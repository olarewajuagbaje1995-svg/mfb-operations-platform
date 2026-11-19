import { Button } from '@/components/Button'

// Responsibility: secondary button — transparent with navy text.
export function SecondaryButton({
  children,
  className = '',
  ...rest
}: React.ComponentPropsWithRef<typeof Button> & { className?: string }) {
  return (
    <Button
      variant="ghost"
      className={`text-brand-navy border-brand-border hover:bg-brand-light font-semibold ${className}`}
      {...rest}
    >
      {children}
    </Button>
  )
}
