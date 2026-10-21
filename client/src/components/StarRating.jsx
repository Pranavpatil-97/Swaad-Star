const STAR = 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z'

export default function StarRating({ value, onChange }) {
  return (
    <fieldset>
      <legend className="mb-2 font-medium">Your rating</legend>
      <div className="flex">
        {[1, 2, 3, 4, 5].map((n) => (
          <label key={n} className="flex h-12 w-12 cursor-pointer items-center justify-center">
            <input
              type="radio"
              name="rating"
              value={n}
              checked={value === n}
              onChange={() => onChange(n)}
              className="peer sr-only"
              aria-label={`${n} star${n > 1 ? 's' : ''}`}
            />
            <svg
              viewBox="0 0 24 24"
              className="h-9 w-9 rounded-sm peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-charcoal"
              fill={n <= value ? '#E8A317' : 'none'}
              stroke={n <= value ? '#E8A317' : '#4A433A'}
              strokeOpacity={n <= value ? 1 : 0.5}
              strokeWidth="1.5"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d={STAR} />
            </svg>
          </label>
        ))}
      </div>
    </fieldset>
  )
}