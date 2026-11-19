import { cloneElement, isValidElement, type ReactElement } from 'react'
import { Button } from '@/components/Button'

// Responsibility: primary call-to-action button in brand gold. Supports `asChild`
// so an anchor (or other element) can take the button styling directly.
export function PrimaryButton({
  children,
  className = '',
  asChild = false,
  ...rest
}: React.ComponentPropsWithRef<typeof Button> & { className?: string; asChild?: boolean }) {
  const base = `bg-brand-gold text-brand-deep hover:bg-brand-gold-light font-bold shadow-sm ${className}`

  if (asChild && isValidElement(children)) {
    const child = children as ReactElement<{ className?: string }>
    return cloneElement(child, {
      className: `${base} ${child.props.className ?? ''}`.trim(),
    })
  }

  return (
    <Button variant="primary" className={base} {...rest}>
      {children}
    </Button>
  )
}
