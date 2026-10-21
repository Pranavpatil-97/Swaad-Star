import Button from './Button'

const STAR = 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z'

export default function GuestPreview({ name, logoUrl, brandColor }) {
  return (
    <div
      className="rounded-lg border border-line bg-cream p-5"
      style={{ '--brand': brandColor }}
      aria-label="Preview of the guest page"
    >
      {logoUrl && <img src={logoUrl} alt="" className="mb-3 h-12 w-12 rounded-md object-contain" />}
      <p className="font-display text-2xl font-semibold">{name || 'Your restaurant'}</p>
      <p className="mt-1 text-charcoal-soft">How was your visit?</p>
      <div className="mt-3 flex gap-1" aria-hidden="true">
        {[1, 2, 3, 4, 5].map((n) => (
          <svg key={n} viewBox="0 0 24 24" className="h-8 w-8" strokeWidth="1.5" strokeLinejoin="round"
            fill={n <= 4 ? '#E8A317' : 'none'} stroke={n <= 4 ? '#E8A317' : '#4A433A'}>
            <path d={STAR} />
          </svg>
        ))}
      </div>
      <Button type="button" tabIndex={-1} className="mt-4 w-full">Write my review</Button>
    </div>
  )
}