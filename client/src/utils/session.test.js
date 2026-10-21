import { getSessionId, markOnce } from './session'

beforeEach(() => sessionStorage.clear())

test('session id is stable within a session', () => {
  const a = getSessionId()
  expect(a).toBeTruthy()
  expect(getSessionId()).toBe(a)
})

test('markOnce is true only the first time', () => {
  expect(markOnce('scan:x')).toBe(true)
  expect(markOnce('scan:x')).toBe(false)
})

test('nothing is stored in cookies', () => {
  getSessionId()
  expect(document.cookie).toBe('')
})