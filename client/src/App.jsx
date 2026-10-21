import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

const Landing = lazy(() => import('./pages/Landing'))
const ReviewPage = lazy(() => import('./pages/ReviewPage'))
const NotFound = lazy(() => import('./pages/NotFound'))
const AdminApp = lazy(() => import('./pages/admin/AdminApp'))

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={null}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/r/:slug" element={<ReviewPage />} />
          <Route path="*" element={<NotFound />} />
          <Route path="/admin/*" element={<AdminApp />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}