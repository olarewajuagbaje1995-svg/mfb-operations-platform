interface FAQItem {
  question: string
  answer: string
}

// Responsibility: accessible expandable FAQ accordion.
export function FAQAccordion({ items }: { items: FAQItem[] }) {
  return (
    <div className="divide-y divide-brand-border border-y border-brand-border">
      {items.map((item, index) => {
        const id = `faq-${index}`
        return (
          <div key={item.question} className="py-1">
            <button
              type="button"
              aria-expanded={false}
              aria-controls={id}
              className="flex w-full items-center justify-between gap-4 py-4 text-left text-sm font-semibold text-brand-navy"
            >
              <span>{item.question}</span>
              <span className="text-2xl font-bold text-brand-text-secondary">+</span>
            </button>
            <div id={id} className="pb-4 text-sm leading-7 text-brand-text-secondary">
              {item.answer}
            </div>
          </div>
        )
      })}
    </div>
  )
}
