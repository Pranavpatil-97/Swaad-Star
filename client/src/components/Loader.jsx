export default function Loader({ label = 'Writing your draft...' }) {
  return (
    <div role="status" aria-live="polite" className="flex items-center gap-3 py-6 text-charcoal-soft">
      <span className="flex gap-1" aria-hidden="true">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="h-2 w-2 animate-bounce rounded-full"
            style={{ background: 'var(--brand)', animationDelay: `${i * 150}ms` }}
          />
        ))}
      </span>
      <span>{label}</span>
    </div>
  )
}