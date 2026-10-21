import { useEffect, useMemo, useRef, useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import api from '../api/client'
import { sendEvent } from '../api/events'
import useBusiness from '../hooks/useBusiness'
import { getSessionId, markOnce } from '../utils/session'
import { copyText } from '../utils/clipboard'
import { friendlyError } from '../utils/errors'
import StarRating from '../components/StarRating'
import TopicChips from '../components/TopicChips'
import ReviewEditor from '../components/ReviewEditor'
import Loader from '../components/Loader'
import ErrorBox from '../components/ErrorBox'
import Button from '../components/Button'
import NotFound from './NotFound'

const MAX_ATTEMPTS = 6 // 1 first draft + 5 regenerations

function Shell({ children }) {
  return <main className="mx-auto min-h-screen max-w-md px-4 py-8">{children}</main>
}

export default function ReviewPage() {
  const { slug } = useParams()
  const [params] = useSearchParams()
  const campaign = params.get('c') || undefined
  const sessionId = useMemo(() => getSessionId(), [])
  const { status, business, retry } = useBusiness(slug)

  const [rating, setRating] = useState(0)
  const [topics, setTopics] = useState([])
  const [feedback, setFeedback] = useState('')
  const [draft, setDraft] = useState(null)
  const [source, setSource] = useState(null)
  const [attempt, setAttempt] = useState(0)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)
  const [needMore, setNeedMore] = useState(false)
  const [copyMsg, setCopyMsg] = useState('')
  const editorRef = useRef(null)

  // Apply the business brand color
  useEffect(() => {
    if (!business?.brandColor) return
    document.documentElement.style.setProperty('--brand', business.brandColor)
    return () => document.documentElement.style.removeProperty('--brand')
  }, [business])

  // Scan event, once per session
  useEffect(() => {
    if (status === 'ready' && markOnce('scan:' + slug)) {
      sendEvent('scan', slug, campaign, sessionId)
    }
  }, [status, slug, campaign, sessionId])

  async function generate(isRegen) {
    const next = attempt + 1
    if (next > MAX_ATTEMPTS) return
    setBusy(true)
    setError(null)
    setNeedMore(false)
    setCopyMsg('')
    try {
      const { data } = await api.post('/reviews/generate', {
        slug, campaign, sessionId, rating, topics,
        feedback: feedback.trim(),
        attempt: next,
      })
      if (data.status === 'need_more_info') {
        setNeedMore(true)
        return
      }
      setAttempt(next)
      setDraft(data.draft)
      setSource(data.source)
      sendEvent(isRegen ? 'regenerate' : 'generate', slug, campaign, sessionId)
    } catch (e) {
      setError(friendlyError(e))
    } finally {
      setBusy(false)
    }
  }

  async function handleCopy() {
    const ok = await copyText(draft, editorRef.current)
    if (ok) {
      setCopyMsg('Copied. Now tap Continue to Google and paste it there.')
      sendEvent('copy', slug, campaign, sessionId)
    } else {
      setCopyMsg('Your text is selected. Press and hold it, then tap Copy.')
    }
  }

  if (status === 'loading') {
    return (
      <Shell>
        <div className="animate-pulse space-y-4" aria-busy="true" aria-label="Loading">
          <div className="h-16 w-16 rounded-md bg-cream-alt" />
          <div className="h-8 w-2/3 rounded-sm bg-cream-alt" />
        </div>
      </Shell>
    )
  }
  if (status === 'notfound') return <NotFound />
  if (status === 'error') {
    return (
      <Shell>
        <ErrorBox message="We could not load this page. Check your connection and try again." onRetry={retry} />
      </Shell>
    )
  }

  const regensLeft = MAX_ATTEMPTS - attempt
  const googleUrl = business.googleReviewUrl

  return (
    <Shell>
      <header className="mb-8">
        {business.logoUrl && (
          <img
            src={business.logoUrl}
            alt={`${business.name} logo`}
            className="mb-4 h-16 w-16 rounded-md object-contain"
            onError={(e) => { e.currentTarget.style.display = 'none' }}
          />
        )}
        <h1 className="text-3xl">{business.name}</h1>
        {draft === null && <p className="mt-2 text-xl text-charcoal-soft">How was your visit?</p>}
      </header>

      {draft === null ? (
        <form
          className="space-y-6"
          onSubmit={(e) => { e.preventDefault(); generate(false) }}
        >
          <StarRating value={rating} onChange={setRating} />
          <TopicChips value={topics} onChange={setTopics} />

          <div>
            <label htmlFor="feedback" className="mb-2 block font-medium">
              A few words about your visit (optional)
            </label>
            <textarea
              id="feedback"
              value={feedback}
              maxLength={500}
              rows={4}
              onChange={(e) => setFeedback(e.target.value)}
              className="w-full rounded-md border border-line bg-white p-4 text-base"
            />
            <p className="mt-1 text-right text-base text-charcoal-soft">{feedback.length}/500</p>
          </div>

          {needMore && (
            <ErrorBox message="Please add a few more words about your visit so we can write a useful draft." />
          )}
          {error && (
            <ErrorBox message={error.message} onRetry={error.kind === 'rate' ? undefined : () => generate(false)} />
          )}

          {busy ? (
            <Loader />
          ) : (
            <div>
              <Button type="submit" className="w-full" disabled={!rating} aria-describedby="rating-hint">
                Write my review
              </Button>
              {!rating && (
                <p id="rating-hint" className="mt-2 text-charcoal-soft">Pick a star rating to continue.</p>
              )}
            </div>
          )}
        </form>
      ) : (
        <section aria-labelledby="draft-h">
          <h2 id="draft-h" className="text-2xl">Your draft</h2>
          {source === 'template' && (
            <p className="mt-1 text-charcoal-soft">This is a simple draft. Feel free to change it.</p>
          )}
          <div className="mt-4">
            <ReviewEditor ref={editorRef} value={draft} onChange={setDraft} />
          </div>

          {error && (
            <div className="mt-4">
              <ErrorBox message={error.message} onRetry={error.kind === 'rate' ? undefined : () => generate(true)} />
            </div>
          )}
          {needMore && (
            <div className="mt-4">
              <ErrorBox message="We need a few more words to write a new draft. Tap Change my answers to add them." />
            </div>
          )}

          {busy ? (
            <Loader />
          ) : (
            <div className="mt-4 flex flex-col gap-3">
              <Button onClick={handleCopy}>Copy review</Button>

              {googleUrl ? (
                <Button
                  as="a"
                  href={googleUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => sendEvent('google_click', slug, campaign, sessionId)}
                >
                  Continue to Google
                </Button>
              ) : (
                <p className="text-charcoal-soft">
                  This place has not set up its Google link yet. You can still copy your review.
                </p>
              )}

              <Button
                variant="secondary"
                disabled={regensLeft <= 0}
                onClick={() => generate(true)}
              >
                {regensLeft > 0 ? `Regenerate (${regensLeft} left)` : 'No regenerations left'}
              </Button>

              <button
                type="button"
                className="min-h-11 cursor-pointer text-charcoal-soft underline"
                onClick={() => { setDraft(null); setCopyMsg('') }}
              >
                Change my answers
              </button>
            </div>
          )}
          <p role="status" className="mt-3 min-h-6 text-charcoal-soft">{copyMsg}</p>
        </section>
      )}
    </Shell>
  )
}