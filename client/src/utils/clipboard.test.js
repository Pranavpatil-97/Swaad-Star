import { copyText } from './clipboard'

const setClipboard = (value) =>
  Object.defineProperty(navigator, 'clipboard', { value, configurable: true })

afterEach(() => {
  setClipboard(undefined)
  delete document.execCommand
})

test('uses the clipboard API when available', async () => {
  const writeText = vi.fn().mockResolvedValue()
  setClipboard({ writeText })
  expect(await copyText('hello')).toBe(true)
  expect(writeText).toHaveBeenCalledWith('hello')
})

test('falls back to selecting the text and execCommand', async () => {
  setClipboard(undefined)
  document.execCommand = vi.fn(() => true)
  const el = document.createElement('textarea')
  el.value = 'hello'
  document.body.appendChild(el)
  expect(await copyText('hello', el)).toBe(true)
  expect(document.execCommand).toHaveBeenCalledWith('copy')
})

test('returns false when copying is impossible', async () => {
  setClipboard({ writeText: vi.fn().mockRejectedValue(new Error('denied')) })
  document.execCommand = vi.fn(() => false)
  const el = document.createElement('textarea')
  document.body.appendChild(el)
  expect(await copyText('hello', el)).toBe(false)
})