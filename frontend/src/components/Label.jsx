export default function Label({ className = '', children, ...props }) {
  return (
    <label
      className={`font-body text-sm font-medium text-neutral-700 ${className}`}
      {...props}
    >
      {children}
    </label>
  )
}
