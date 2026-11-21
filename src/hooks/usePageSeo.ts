import { useEffect } from 'react'

// Responsibility: keeps a public page's document title, meta description and
// robots tag in sync with the route. Staff pages opt in with noIndex: true so
// internal admin pages are never indexed by search engines.
export function usePageSeo({
  title,
  description,
  noIndex = false,
}: {
  title?: string
  description?: string
  noIndex?: boolean
}) {
  useEffect(() => {
    if (title) {
      document.title = title
    }

    if (description) {
      let el = document.querySelector('meta[name="description"]')
      if (!el) {
        el = document.createElement('meta')
        el.setAttribute('name', 'description')
        document.head.appendChild(el)
      }
      el.setAttribute('content', description)
    }

    let el = document.querySelector('meta[name="robots"]')
    if (!el) {
      el = document.createElement('meta')
      el.setAttribute('name', 'robots')
      document.head.appendChild(el)
    }
    el.setAttribute('content', noIndex ? 'noindex, nofollow' : 'index, follow')
  }, [title, description, noIndex])
}
