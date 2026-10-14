import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App from '../App'
import { resetLangForTests } from '../i18n'
import { DropZone } from './DropZone'
import { pl } from '../i18n/pl'
import * as ingest from '../ingest'

vi.mock('../ingest', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../ingest')>()
  return { ...actual, ingestFile: vi.fn(actual.ingestFile) }
})

function setNavigatorLanguage(lang: string) {
  vi.spyOn(window.navigator, 'language', 'get').mockReturnValue(lang)
  resetLangForTests()
}

beforeEach(() => {
  localStorage.clear()
  resetLangForTests()
})
afterEach(() => {
  vi.restoreAllMocks()
  localStorage.clear()
  resetLangForTests()
})

describe('language default', () => {
  it('uses Polish when navigator.language starts with pl', () => {
    setNavigatorLanguage('pl-PL')
    render(<App />)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'Czytaj tak, jak lubi Twój mózg.',
    )
    expect(document.documentElement.lang).toBe('pl')
  })

  it('uses English otherwise and can switch to Polish', async () => {
    setNavigatorLanguage('en-GB')
    render(<App />)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'Read the way your brain likes it.',
    )
    await userEvent.click(screen.getByRole('button', { name: 'PL' }))
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'Czytaj tak, jak lubi Twój mózg.',
    )
    expect(localStorage.getItem('letterlift:lang')).toBe('pl')
  })
})

describe('paste flow', () => {
  it('disables Read while the textarea is empty or blank', async () => {
    setNavigatorLanguage('en-US')
    render(<App />)
    const read = screen.getByRole('button', { name: 'Read' })
    expect(read).toBeDisabled()
    await userEvent.type(screen.getByLabelText('Text to read'), '   ')
    expect(read).toBeDisabled()
    await userEvent.type(screen.getByLabelText('Text to read'), 'hello')
    expect(read).toBeEnabled()
  })

  it('opens the reader with bolded text and a title from the first words', async () => {
    setNavigatorLanguage('en-US')
    render(<App />)
    await userEvent.type(
      screen.getByLabelText('Text to read'),
      'Reading should feel lighter than this every single day',
    )
    expect(screen.getByText('54 characters')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Read' }))

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Reading should feel lighter than this…' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '← New text' })).toBeInTheDocument()
    const article = screen.getByRole('article')
    const bold = Array.from(article.querySelectorAll('b')).map((b) => b.textContent)
    expect(bold.length).toBeGreaterThan(0)
    expect(bold[0]).toBe('Rea')

    await userEvent.click(screen.getByRole('button', { name: '← New text' }))
    expect(await screen.findByRole('button', { name: 'Read' })).toBeInTheDocument()
  })
})

describe('DropZone', () => {
  it('shows the mapped error for an unsupported file', async () => {
    setNavigatorLanguage('pl')
    const onBlocks = vi.fn()
    render(<DropZone onBlocks={onBlocks} />)
    const input = screen.getByTestId('file-input')
    fireEvent.change(input, {
      target: { files: [new File(['x'], 'photo.jpg', { type: 'image/jpeg' })] },
    })
    const alert = screen.getByRole('alert')
    await waitFor(() => expect(within(alert).getByText(pl.drop.errors.unsupported)).toBeInTheDocument())
    expect(onBlocks).not.toHaveBeenCalled()
  })

  it('shows the empty error for a blank text file', async () => {
    setNavigatorLanguage('en')
    render(<DropZone onBlocks={vi.fn()} />)
    fireEvent.change(screen.getByTestId('file-input'), {
      target: { files: [new File(['   \n  '], 'a.txt', { type: 'text/plain' })] },
    })
    expect(await screen.findByText(/There is no text in this file/)).toBeInTheDocument()
  })
})

describe('upload race', () => {
  it('ignores a slow file result after leaving the Upload tab', async () => {
    setNavigatorLanguage('en-US')
    let resolve!: (b: ingest.Block[]) => void
    vi.mocked(ingest.ingestFile).mockImplementationOnce(
      () => new Promise<ingest.Block[]>((r) => (resolve = r)),
    )
    render(<App />)
    await userEvent.click(screen.getByRole('tab', { name: 'Upload a file' }))
    fireEvent.change(screen.getByTestId('file-input'), {
      target: { files: [new File(['x'], 'slow.pdf', { type: 'application/pdf' })] },
    })
    expect(screen.getByRole('status')).toHaveTextContent('Loading your file')

    await userEvent.click(screen.getByRole('tab', { name: 'Paste text' }))
    resolve([{ type: 'paragraph', text: 'Late arrival' }])
    await Promise.resolve()

    expect(screen.queryByRole('heading', { level: 1, name: 'Late arrival' })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Read' })).toBeInTheDocument()
  })
})

describe('pasted text', () => {
  it('survives a visit to About and back', async () => {
    setNavigatorLanguage('en-US')
    render(<App />)
    await userEvent.type(screen.getByLabelText('Text to read'), 'keep me')
    await userEvent.click(screen.getByRole('link', { name: 'About' }))
    await userEvent.click(await screen.findByRole('button', { name: '← Back' }))
    expect(await screen.findByLabelText('Text to read')).toHaveValue('keep me')
  })
})
