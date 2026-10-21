import { useEffect, useState } from 'react'
import api from './api/client'

export default function App() {
  const [biz, setBiz] = useState(null)
  useEffect(() => { api.get('/business/spice-garden').then((r) => setBiz(r.data)) }, [])
  return (
    <main className="p-6">
      <h1 className="text-3xl text-terracotta">Swaad Star</h1>
      <p className="font-body text-charcoal-soft">{biz ? biz.name : 'Loading...'}</p>
    </main>
  )
}