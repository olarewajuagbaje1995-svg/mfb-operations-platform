
// Responsibility: consistent section heading used across public pages.
export function SectionHeading({
  eyebrow,
  title,
  description,
  centered = false,
}: {
  eyebrow?: string
  title: string
  description?: string
  centered?: boolean
}) {
  return (
    <div className={centered ? 'mx-auto max-w-2xl text-center' : 'max-w-2xl'}>
      {eyebrow && (
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-gold">
          {eyebrow}
        </p>
      )}
      <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-brand-navy sm:text-4xl">
        {title}
      </h2>
      {description && (
        <p className="mt-4 text-sm leading-7 text-brand-text-secondary sm:text-base">
          {description}
        </p>
      )}
    </div>
  )
}
