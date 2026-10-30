export default function Card({ className = '', children, ...props }) {
  return (
    <div
      className={`rounded-xl border border-outline bg-neutral-50 p-6 shadow-soft ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}
