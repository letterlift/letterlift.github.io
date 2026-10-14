import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { LANG_KEY, resetLangForTests } from '../i18n'
import type { Block } from '../ingest/types'
import { useSettings } from '../settings/useSettings'
import { FOCUS_KEY } from './useFocusTools'
import { ReaderScreen, toPlainText } from './ReaderScreen'

const BLOCKS: Block[] = [
  { type: 'heading', text: 'A calm title' },
  { type: 'paragraph', text: 'First paragraph of the text.' },
  { type: 'list-item', text: 'one' },
  { type: 'list-item', text: 'two' },
  { type: 'paragraph', text: 'Last paragraph.' },
]

// Test harness only: in the app, App owns the single useSettings() call.
function Harness({ onBack = () => {} }: { onBack?: () => void }) {
  const [settings, patch, reset] = useSettings()
  return (
    <ReaderScreen
      blocks={BLOCKS}
      title="A calm title"
      settings={settings}
      patch={patch}
      reset={reset}
      onBack={onBack}
    />
  )
}

const article = () => screen.getByRole('article')

describe('ReaderScreen', () => {
  beforeEach(() => {
    localStorage.clear()
    localStorage.setItem(LANG_KEY, 'en')
    resetLangForTests()
    document.documentElement.removeAttribute('data-theme')
  })
  afterEach(() => {
    localStorage.clear()
    resetLangForTests()
    vi.restoreAllMocks()
    document.documentElement.removeAttribute('data-theme')
  })

  it('shows the title, reading time and top bar actions', async () => {
    const onBack = vi.fn()
    render(<Harness onBack={onBack} />)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('A calm title')
    expect(screen.getByText('about 1 min read')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Settings' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Copy text' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Print' })).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: '← New text' }))
    expect(onBack).toHaveBeenCalledTimes(1)
  })

  describe('settings panel', () => {
    it('opens as a labelled modal dialog', async () => {
      render(<Harness />)
      const trigger = screen.getByRole('button', { name: 'Settings' })
      await userEvent.click(trigger)
      const dialog = screen.getByRole('dialog', { name: 'Reading settings' })
      expect(dialog).toHaveAttribute('aria-modal', 'true')
      expect(trigger).toHaveAttribute('aria-expanded', 'true')
    })

    it('changing font size updates the article CSS variable live and snaps to the step', () => {
      render(<Harness />)
      fireEvent.click(screen.getByRole('button', { name: 'Settings' }))
      expect(article().style.getPropertyValue('--reader-size')).toBe('20px')
      fireEvent.change(screen.getByLabelText('Text size'), { target: { value: '24' } })
      expect(article().style.getPropertyValue('--reader-size')).toBe('24px')

      fireEvent.change(screen.getByLabelText('Line spacing'), { target: { value: '1.9000000000000001' } })
      expect(article().style.getPropertyValue('--reader-leading')).toBe('1.9')
      expect(JSON.parse(localStorage.getItem('letterlift:settings:v1')!).lineHeight).toBe(1.9)
    })

    it('turns bolding off and on', async () => {
      render(<Harness />)
      expect(article().querySelectorAll('b').length).toBeGreaterThan(0)
      await userEvent.click(screen.getByRole('button', { name: 'Settings' }))
      const toggle = screen.getByRole('switch', { name: 'Bold word beginnings' })
      await userEvent.click(toggle)
      expect(article().querySelectorAll('b')).toHaveLength(0)
      expect(screen.getByLabelText('Number of bold letters')).toBeDisabled()
    })

    it('picks theme and font from labelled swatches, and resets to defaults', async () => {
      render(<Harness />)
      await userEvent.click(screen.getByRole('button', { name: 'Settings' }))
      await userEvent.click(screen.getByRole('radio', { name: 'Sepia' }))
      expect(document.documentElement).toHaveAttribute('data-theme', 'sepia')
      await userEvent.click(screen.getByRole('radio', { name: 'Serif' }))
      expect(article().style.getPropertyValue('--reader-font')).toContain('Georgia')

      await userEvent.click(screen.getByRole('button', { name: 'Reset to defaults' }))
      expect(document.documentElement).not.toHaveAttribute('data-theme')
      expect(article().style.getPropertyValue('--reader-font')).toBe('var(--font-body)')
      expect(screen.getByRole('radio', { name: 'System' , checked: true })).toBeInTheDocument()
    })

    it('exposes the on-screen value to assistive tech and makes the page inert behind the sheet', async () => {
      render(<Harness />)
      const trigger = screen.getByRole('button', { name: 'Settings' })
      await userEvent.click(trigger)
      expect(screen.getByLabelText('Text size')).toHaveAttribute('aria-valuetext', '20 px')
      expect(screen.getByLabelText('Number of bold letters')).toHaveAttribute('aria-valuetext', '45%')
      expect(trigger.closest('[inert]')).not.toBeNull()
      await userEvent.keyboard('{Escape}')
      expect(trigger.closest('[inert]')).toBeNull()
    })

    it('closes on Escape and returns focus to the trigger', async () => {
      render(<Harness />)
      const trigger = screen.getByRole('button', { name: 'Settings' })
      await userEvent.click(trigger)
      expect(screen.getByRole('dialog')).toHaveFocus()
      await userEvent.keyboard('{Escape}')
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
      expect(trigger).toHaveFocus()
    })

    it('closes on backdrop click and with the close button', async () => {
      render(<Harness />)
      await userEvent.click(screen.getByRole('button', { name: 'Settings' }))
      await userEvent.click(screen.getByTestId('panel-backdrop'))
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()

      await userEvent.click(screen.getByRole('button', { name: 'Settings' }))
      await userEvent.click(screen.getByRole('button', { name: 'Close settings' }))
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })

    it('traps Tab focus inside the dialog in both directions', async () => {
      const user = userEvent.setup()
      render(<Harness />)
      await user.click(screen.getByRole('button', { name: 'Settings' }))
      const dialog = screen.getByRole('dialog')
      const close = within(dialog).getByRole('button', { name: 'Close settings' })
      const reset = within(dialog).getByRole('button', { name: 'Reset to defaults' })

      await user.tab({ shift: true })
      expect(reset).toHaveFocus()
      await user.tab()
      expect(close).toHaveFocus()
      for (let i = 0; i < 25; i++) {
        await user.tab()
        expect(dialog.contains(document.activeElement)).toBe(true)
      }
    })
  })

  describe('focus tools', () => {
    it('paragraph focus adds a dimming class and is remembered', async () => {
      const { unmount } = render(<Harness />)
      const body = screen.getByTestId('reader-body')
      expect(body.className).not.toMatch(/dimming/)

      await userEvent.click(screen.getByRole('button', { name: 'Settings' }))
      await userEvent.click(screen.getByRole('switch', { name: /Paragraph focus/ }))
      expect(body.className).toMatch(/dimming/)
      expect(document.querySelectorAll('[data-focus-active]')).toHaveLength(1)
      expect(JSON.parse(localStorage.getItem(FOCUS_KEY)!)).toEqual({ ruler: false, paragraph: true })

      unmount()
      render(<Harness />)
      expect(screen.getByTestId('reader-body').className).toMatch(/dimming/)
    })

    const scrollTo = (y: number, scrollHeight: number) => {
      Object.defineProperty(window, 'scrollY', { value: y, configurable: true })
      Object.defineProperty(document.documentElement, 'scrollHeight', { value: scrollHeight, configurable: true })
    }

    it('paragraph focus activates the first block at scroll 0 and the last at the bottom', async () => {
      scrollTo(0, 5000)
      render(<Harness />)
      await userEvent.click(screen.getByRole('button', { name: 'Settings' }))
      await userEvent.click(screen.getByRole('switch', { name: /Paragraph focus/ }))
      expect(document.querySelector('[data-focus-active]')).toHaveAttribute('data-block-index', '0')

      scrollTo(4300, 5000)
      fireEvent.scroll(window)
      await waitFor(() =>
        expect(document.querySelector('[data-focus-active]')).toHaveAttribute('data-block-index', '4'),
      )
      scrollTo(0, 0)
    })

    it('reading ruler shows and hides', async () => {
      render(<Harness />)
      expect(screen.queryByTestId('reading-ruler')).not.toBeInTheDocument()
      await userEvent.click(screen.getByRole('button', { name: 'Settings' }))
      await userEvent.click(screen.getByRole('switch', { name: /Reading ruler/ }))
      // 20px * 1.7 line height * 1.6 = 54px
      expect(screen.getByTestId('reading-ruler')).toHaveStyle({ height: '54px' })
      await userEvent.click(screen.getByRole('switch', { name: /Reading ruler/ }))
      expect(screen.queryByTestId('reading-ruler')).not.toBeInTheDocument()
    })

    it('ignores broken stored focus preferences', () => {
      localStorage.setItem(FOCUS_KEY, '{not json')
      render(<Harness />)
      expect(screen.getByTestId('reader-body').className).not.toMatch(/dimming/)
    })
  })

  describe('copy and print', () => {
    it('copies plain text and confirms', async () => {
      const writeText = vi.fn().mockResolvedValue(undefined)
      Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true })
      render(<Harness />)
      await userEvent.click(screen.getByRole('button', { name: 'Copy text' }))
      expect(writeText).toHaveBeenCalledWith(
        'A calm title\n\nFirst paragraph of the text.\n\n- one\n- two\n\nLast paragraph.',
      )
      const status = screen.getByRole('status')
      await waitFor(() => expect(status).toHaveTextContent('Copied'))
      expect(status).toBeVisible()
      expect(status.querySelector('[data-state="ok"]')).not.toBeNull()
    })

    it('keeps the status live region mounted and unhidden before, during and after a message', async () => {
      Object.defineProperty(navigator, 'clipboard', {
        value: { writeText: vi.fn().mockResolvedValue(undefined) },
        configurable: true,
      })
      render(<Harness />)
      const status = screen.getByRole('status')
      const stillThere = () => {
        expect(status.isConnected).toBe(true)
        expect(screen.getByRole('status')).toBe(status)
        expect(status).toBeVisible()
        expect(status).not.toHaveAttribute('hidden')
        expect(status).not.toHaveAttribute('aria-hidden')
      }
      stillThere()
      expect(status).toBeEmptyDOMElement()
      await userEvent.click(screen.getByRole('button', { name: 'Copy text' }))
      stillThere() // cleared, waiting to be refilled
      await waitFor(() => expect(status).toHaveTextContent('Copied'))
      stillThere()
    })

    it('never gives the body wrapper an undefined class', () => {
      render(<Harness />)
      expect(screen.getByTestId('reader-body').className).not.toMatch(/undefined/)
    })

    it('says what to do when copying fails', async () => {
      Object.defineProperty(navigator, 'clipboard', {
        value: { writeText: vi.fn().mockRejectedValue(new Error('denied')) },
        configurable: true,
      })
      document.execCommand = vi.fn().mockReturnValue(false)
      render(<Harness />)
      await userEvent.click(screen.getByRole('button', { name: 'Copy text' }))
      const status = screen.getByRole('status')
      await waitFor(() => expect(status).toHaveTextContent(/Couldn't copy/))
      expect(status).toBeVisible()
      expect(status.querySelector('[data-state="fail"]')).not.toBeNull()
    })

    it('print calls window.print', async () => {
      const print = vi.spyOn(window, 'print').mockImplementation(() => {})
      render(<Harness />)
      await userEvent.click(screen.getByRole('button', { name: 'Print' }))
      expect(print).toHaveBeenCalledTimes(1)
    })
  })
})

describe('toPlainText', () => {
  it('separates blocks with blank lines and keeps list items together', () => {
    expect(toPlainText(BLOCKS)).toBe(
      'A calm title\n\nFirst paragraph of the text.\n\n- one\n- two\n\nLast paragraph.',
    )
    expect(toPlainText([])).toBe('')
  })
})
