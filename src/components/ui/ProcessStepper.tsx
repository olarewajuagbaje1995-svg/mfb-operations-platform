
interface ProcessStep {
  title: string
  description: string
}

// Responsibility: process stepper — horizontal on desktop, vertical on mobile.
export function ProcessStepper({ steps }: { steps: ProcessStep[] }) {
  return (
    <>
      {/* Desktop: horizontal stepper */}
      <div className="hidden md:flex gap-6 text-center">
        {steps.map((step, idx) => (
          <div key={step.title} className="flex flex-col items-center gap-2 relative z-10">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-deep text-white font-bold text-sm shadow-lg">
              {idx + 1}
            </span>
            <h3 className="font-bold text-brand-navy">{step.title}</h3>
            <p className="text-xs leading-5 text-brand-text-secondary max-w-xs">
              {step.description}
            </p>
            {idx < steps.length - 1 && (
              <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 h-1 w-full bg-brand-border" />
            )}
          </div>
        ))}
      </div>

      {/* Mobile: vertical timeline */}
      <div className="md:hidden space-y-6">
        {steps.map((step, idx) => (
          <div key={step.title} className="relative flex gap-3">
            <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-deep text-white font-bold text-xs shadow-lg z-10">
              {idx + 1}
            </div>
            <div className="absolute -left-4 top-3 bottom-3 w-0.5 bg-brand-border" />
            <div>
              <h3 className="font-bold text-brand-navy">{step.title}</h3>
              <p className="text-sm leading-6 text-brand-text-secondary">{step.description}</p>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
