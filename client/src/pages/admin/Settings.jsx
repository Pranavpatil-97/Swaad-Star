import { useEffect, useState } from 'react'
import api from '../../api/client'
import Button from '../../components/Button'
import ErrorBox from '../../components/ErrorBox'
import Loader from '../../components/Loader'
import GuestPreview from '../../components/GuestPreview'
import { friendlyError } from '../../utils/errors'
import { isHttpsUrl, isSlug, isHexColor, contrastWithWhite } from '../../utils/validate'

const LANGUAGES = [
  { v: 'en', l: 'English' },
  { v: 'hi', l: 'Hindi' },
  { v: 'mr', l: 'Marathi' },
  { v: 'hinglish', l: 'Hinglish' },
]
const STYLES = [
  { v: 'casual', l: 'Casual' },
  { v: 'polite', l: 'Polite' },
  { v: 'short', l: 'Short' },
]
const LOGO_TYPES = ['image/png', 'image/jpeg', 'image/webp']
const input = 'min-h-11 w-full rounded-md border border-line bg-white px-4'

function Field({ id, label, error, hint, children }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1 block font-medium">{label}</label>
      {children}
      {hint && <p className="mt-1 text-charcoal-soft">{hint}</p>}
      {error && <p id={`${id}-err`} className="mt-1 font-medium text-terracotta-dark">{error}</p>}
    </div>
  )
}

export default function Settings() {
  const [form, setForm] = useState(null)
  const [loadError, setLoadError] = useState('')
  const [logoFile, setLogoFile] = useState(null)
  const [logoPreview, setLogoPreview] = useState('')
  const [errors, setErrors] = useState({})
  const [busy, setBusy] = useState(false)
  const [saved, setSaved] = useState(false)
  const [serverError, setServerError] = useState('')

  useEffect(() => {
    api.get('/admin/business')
      .then((r) => setForm(r.data))
      .catch((e) => setLoadError(friendlyError(e).message))
  }, [])

  useEffect(() => () => { if (logoPreview.startsWith('blob:')) URL.revokeObjectURL(logoPreview) }, [logoPreview])

  if (loadError) return <ErrorBox message={loadError} />
  if (!form) return <Loader label="Loading your settings..." />

  const set = (k) => (e) => { setForm({ ...form, [k]: e.target.value }); setSaved(false) }

  function pickLogo(e) {
    const file = e.target.files?.[0]
    if (!file) return
    if (!LOGO_TYPES.includes(file.type)) return setErrors({ ...errors, logo: 'Please choose a PNG, JPG or WebP image.' })
    if (file.size > 1024 * 1024) return setErrors({ ...errors, logo: 'The image must be 1 MB or smaller.' })
    setErrors({ ...errors, logo: '' })
    setLogoFile(file)
    setLogoPreview(URL.createObjectURL(file))
    setSaved(false)
  }

  function validate() {
    const e = {}
    if (!form.name.trim()) e.name = 'Please enter the business name.'
    if (!isSlug(form.slug)) e.slug = 'Use lowercase letters, numbers and hyphens only, like spice-garden.'
    if (!isHexColor(form.brandColor)) e.brandColor = 'Use a color like #C8553D.'
    if (form.googleReviewUrl && !isHttpsUrl(form.googleReviewUrl)) e.googleReviewUrl = 'Enter a valid link that starts with https://'
    return e
  }

  async function submit(ev) {
    ev.preventDefault()
    const e = validate()
    setErrors((prev) => ({ ...e, logo: prev.logo }))
    if (Object.keys(e).length) return
    setBusy(true)
    setServerError('')
    try {
      const fd = new FormData()
      ;['name', 'slug', 'brandColor', 'googleReviewUrl', 'language', 'writingStyle'].forEach((k) => fd.append(k, form[k] ?? ''))
      if (logoFile) fd.append('logo', logoFile)
      const { data } = await api.put('/admin/business', fd)
      setForm(data)
      setLogoFile(null)
      setSaved(true)
    } catch (err) {
      setServerError(err.response?.data?.error?.message || friendlyError(err).message)
    } finally {
      setBusy(false)
    }
  }

  const lowContrast = isHexColor(form.brandColor) && contrastWithWhite(form.brandColor) < 4.5
  const canTest = form.googleReviewUrl && isHttpsUrl(form.googleReviewUrl)

  return (
    <section>
      <h1 className="text-3xl">Business settings</h1>
      <div className="mt-6 grid gap-8 lg:grid-cols-2">
        <form onSubmit={submit} noValidate className="space-y-5">
          <Field id="name" label="Business name" error={errors.name}>
            <input id="name" className={input} value={form.name} onChange={set('name')} aria-describedby="name-err" />
          </Field>

          <Field id="slug" label="Link name" error={errors.slug}
            hint="Guests open /r/your-link-name. Changing it breaks QR codes you have already printed.">
            <input id="slug" className={input} value={form.slug} onChange={set('slug')} aria-describedby="slug-err" />
          </Field>

          <Field id="logo" label="Logo (PNG, JPG or WebP, up to 1 MB)" error={errors.logo}>
            <input id="logo" type="file" accept=".png,.jpg,.jpeg,.webp" onChange={pickLogo} className="block w-full" />
          </Field>

          <Field id="brandColor" label="Brand color" error={errors.brandColor}
            hint={lowContrast ? 'Warning: white button text will be hard to read on this color. Choose a darker one.' : ''}>
            <div className="flex gap-3">
              <input type="color" aria-label="Pick a color" value={isHexColor(form.brandColor) ? form.brandColor : '#C8553D'}
                onChange={set('brandColor')} className="h-11 w-14 cursor-pointer rounded-md border border-line bg-white p-1" />
              <input id="brandColor" className={input} value={form.brandColor} onChange={set('brandColor')} aria-describedby="brandColor-err" />
            </div>
          </Field>

          <Field id="googleReviewUrl" label="Google review link" error={errors.googleReviewUrl}>
            <div className="flex gap-3">
              <input id="googleReviewUrl" className={input} value={form.googleReviewUrl || ''} onChange={set('googleReviewUrl')}
                aria-describedby="googleReviewUrl-err" inputMode="url" />
              <Button type="button" variant="secondary" disabled={!canTest}
                onClick={() => window.open(form.googleReviewUrl, '_blank', 'noopener,noreferrer')}>
                Test
              </Button>
            </div>
          </Field>

          <Field id="language" label="Review language">
            <select id="language" className={input} value={form.language} onChange={set('language')}>
              {LANGUAGES.map((o) => <option key={o.v} value={o.v}>{o.l}</option>)}
            </select>
          </Field>

          <Field id="writingStyle" label="Writing style">
            <select id="writingStyle" className={input} value={form.writingStyle} onChange={set('writingStyle')}>
              {STYLES.map((o) => <option key={o.v} value={o.v}>{o.l}</option>)}
            </select>
          </Field>

          {serverError && <ErrorBox message={serverError} />}
          <div className="flex items-center gap-4">
            <Button type="submit" disabled={busy}>{busy ? 'Saving...' : 'Save changes'}</Button>
            <p role="status" className="text-charcoal-soft">{saved ? 'Saved.' : ''}</p>
          </div>
        </form>

        <aside>
          <h2 className="mb-3 text-xl">Live preview</h2>
          <GuestPreview name={form.name} logoUrl={logoPreview || form.logoUrl} brandColor={isHexColor(form.brandColor) ? form.brandColor : '#C8553D'} />
        </aside>
      </div>
    </section>
  )
}