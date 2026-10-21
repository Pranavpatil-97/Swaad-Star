import { useEffect, useState } from 'react'
import api from '../api/client'

export default function useBusiness(slug) {
  const [state, setState] = useState({ status: 'loading', business: null })
  const [tick, setTick] = useState(0)

  useEffect(() => {
    let cancelled = false
    setState({ status: 'loading', business: null })
    api
      .get(`/business/${slug}`)
      .then((r) => !cancelled && setState({ status: 'ready', business: r.data }))
      .catch((e) => {
        if (cancelled) return
        setState({ status: e.response?.status === 404 ? 'notfound' : 'error', business: null })
      })
    return () => { cancelled = true }
  }, [slug, tick])

  return { ...state, retry: () => setTick((t) => t + 1) }
}