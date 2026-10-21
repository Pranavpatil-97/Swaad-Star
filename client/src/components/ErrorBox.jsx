import Button from './Button'

export default function ErrorBox({ message, onRetry }) {
  return (
    <div role="alert" className="rounded-md border border-line bg-cream-alt p-4">
      <p className="text-charcoal">{message}</p>
      {onRetry && (
        <Button variant="secondary" className="mt-3" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  )
}