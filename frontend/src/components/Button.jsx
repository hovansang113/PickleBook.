const variants = {
  primary: 'bg-primary text-white hover:bg-primary-hover',
  secondary:
    'bg-background text-primary border border-primary/40 hover:bg-primary/5',
}

export default function Button({
  variant = 'primary',
  className = '',
  children,
  ...props
}) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 font-body text-base font-semibold transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
