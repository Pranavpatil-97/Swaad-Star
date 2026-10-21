const TOPICS = [
  { id: 'food', label: 'Food' },
  { id: 'service', label: 'Service' },
  { id: 'staff', label: 'Staff' },
  { id: 'cleanliness', label: 'Cleanliness' },
  { id: 'ambience', label: 'Ambience' },
]

export default function TopicChips({ value, onChange }) {
  const toggle = (id) =>
    onChange(value.includes(id) ? value.filter((t) => t !== id) : [...value, id])

  return (
    <fieldset>
      <legend className="mb-2 font-medium">What was it about? (optional)</legend>
      <div className="flex flex-wrap gap-2">
        {TOPICS.map((t) => {
          const on = value.includes(t.id)
          return (
            <button
              key={t.id}
              type="button"
              aria-pressed={on}
              onClick={() => toggle(t.id)}
              className={`min-h-11 cursor-pointer rounded-full border px-4 text-base ${
                on ? 'border-transparent text-white' : 'border-line bg-white text-charcoal'
              }`}
              style={on ? { background: 'var(--brand)' } : undefined}
            >
              {t.label}
            </button>
          )
        })}
      </div>
    </fieldset>
  )
}