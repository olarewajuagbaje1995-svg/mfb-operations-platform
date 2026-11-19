import { useEffect } from 'react'

// Responsibility: sets document title + meta / Open Graph tags for each public page.
export function SEO({
  title,
  description,
  type = 'website',
  image,
}: {
  title: string
  description: string
  type?: string
  image?: string
}) {
  useEffect(() => {
    document.title = title

    const set = (name: string, value: string, attr = 'name') => {
      let el = document.querySelector(`meta[${attr}="${name}"]`)
      if (!el) {
        el = document.createElement('meta')
        el.setAttribute(attr, name)
        document.head.appendChild(el)
      }
      el.setAttribute('content', value)
    }

    set('description', description)
    set('og:title', title, 'property')
    set('og:description', description, 'property')
    set('og:type', type, 'property')
    if (image) set('og:image', image, 'property')
    set('og:url', window.location.href, 'property')
    set('twitter:card', 'summary_large_image', 'property')
  }, [title, description, type, image])

  return null
}
