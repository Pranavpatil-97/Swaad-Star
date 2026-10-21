import { forwardRef } from 'react'

const ReviewEditor = forwardRef(function ReviewEditor({ value, onChange }, ref) {
  return (
    <div>
      <label htmlFor="draft" className="mb-2 block font-medium">
        Your review draft (you can edit it)
      </label>
      <textarea
        id="draft"
        ref={ref}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={8}
        className="w-full rounded-md border border-line bg-white p-4 text-base leading-relaxed"
      />
    </div>
  )
})

export default ReviewEditor