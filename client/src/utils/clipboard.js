// Returns true if copied. If false, the editor text is selected so the guest can copy manually.
export async function copyText(text, editorEl) {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text)
      return true
    }
  } catch {
    /* fall through */
  }
  try {
    if (editorEl) {
      editorEl.focus()
      editorEl.select()
      editorEl.setSelectionRange(0, text.length)
      if (document.execCommand('copy')) return true
    }
  } catch {
    /* fall through */
  }
  return false
}