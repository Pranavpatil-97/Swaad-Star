export default function Button({ as: Tag = 'button', variant = 'primary', className = '', style, ...props }) {
  const base =
    'inline-flex min-h-11 cursor-pointer items-center justify-center rounded-full px-6 text-base font-bold transition disabled:cursor-not-allowed disabled:opacity-50'
  const variants = {
    primary: 'text-white hover:opacity-90',
    secondary: 'border border-charcoal bg-transparent text-charcoal hover:bg-cream-alt',
  }
  const s = variant === 'primary' ? { background: 'var(--brand)', ...style } : style
  return <Tag className={`${base} ${variants[variant]} ${className}`} style={s} {...props} />
}