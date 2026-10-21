import { isHttpsUrl, isSlug, isHexColor, contrastWithWhite } from './validate'

test('https url', () => {
  expect(isHttpsUrl('https://google.com/x')).toBe(true)
  expect(isHttpsUrl('http://google.com')).toBe(false)
  expect(isHttpsUrl('not a url')).toBe(false)
})

test('slug', () => {
  expect(isSlug('spice-garden')).toBe(true)
  expect(isSlug('Spice Garden')).toBe(false)
  expect(isSlug('-bad-')).toBe(false)
})

test('hex color and contrast', () => {
  expect(isHexColor('#C8553D')).toBe(true)
  expect(isHexColor('red')).toBe(false)
  expect(contrastWithWhite('#000000')).toBeGreaterThan(15)
  expect(contrastWithWhite('#FFFF00')).toBeLessThan(2)
})