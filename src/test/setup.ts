import '@testing-library/jest-dom/vitest'
import { afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'

afterEach(() => cleanup())

// jsdom does not implement scrollTo; stub it so navigation does not log "Not implemented".
window.scrollTo = () => {}
