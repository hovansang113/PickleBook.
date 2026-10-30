import { forwardRef } from 'react'

const Input = forwardRef(function Input(
  { label, id, className = '', ...props },
  ref,
) {
  const field = (
    <input
      ref={ref}
      id={id}
      className={`w-full rounded-xl border border-outline bg-background px-4 py-3 font-body text-neutral-900 outline-none transition-shadow duration-200 placeholder:text-neutral-400 focus:border-primary focus:ring-4 focus:ring-ring ${className}`}
      {...props}
    />
  )

  if (!label) return field

  return (
    <div className="flex flex-col items-start gap-2 text-left">
      <label htmlFor={id} className="font-body text-sm font-medium text-neutral-700">
        {label}
      </label>
      {field}
    </div>
  )
})

export default Input
