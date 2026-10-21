export const isHttpsUrl = (v) => {
  try { return new URL(v).protocol === 'https:' } catch { return false }
}

export const isSlug = (v) => /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(v)

export const isHexColor = (v) => /^#[0-9a-fA-F]{6}$/.test(v)

// WCAG contrast ratio of white text on the given background
export function contrastWithWhite(hex) {
  const lin = (c) => {
    c /= 255
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  }
  const n = parseInt(hex.slice(1), 16)
  const L = 0.2126 * lin((n >> 16) & 255) + 0.7152 * lin((n >> 8) & 255) + 0.0722 * lin(n & 255)
  return 1.05 / (L + 0.05)
}