import { useCallback, useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/Button'

const CONSENT_KEY = 'clobans_cookie_consent'

export type CookiePrefs = {
  essential: boolean
  analytics: boolean
  marketing: boolean
  updatedAt: string
}

const DEFAULT_PREFS: CookiePrefs = {
  essential: true,
  analytics: false,
  marketing: false,
  updatedAt: new Date().toISOString(),
}

function getSavedPrefs(): CookiePrefs | null {
  try {
    const raw = localStorage.getItem(CONSENT_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<CookiePrefs>
    if (
      typeof parsed.essential !== 'boolean' ||
      typeof parsed.analytics !== 'boolean' ||
      typeof parsed.marketing !== 'boolean' ||
      typeof parsed.updatedAt !== 'string'
    ) {
      return null
    }
    return parsed as CookiePrefs
  } catch {
    return null
  }
}

export function CookieConsent() {
  const [visible, setVisible] = useState(false)
  const [customize, setCustomize] = useState(false)
  const [analytics, setAnalytics] = useState(false)
  const [marketing, setMarketing] = useState(false)

  useEffect(() => {
    setVisible(getSavedPrefs() === null)
  }, [])

  const savePrefs = useCallback(
    (analyticsEnabled: boolean, marketingEnabled: boolean) => {
      setAnalytics(analyticsEnabled)
      setMarketing(marketingEnabled)
      try {
        const prefs: CookiePrefs = {
          essential: true,
          analytics: analyticsEnabled,
          marketing: marketingEnabled,
          updatedAt: new Date().toISOString(),
        }
        localStorage.setItem(CONSENT_KEY, JSON.stringify(prefs))
      } catch {
        // localStorage unavailable — consent cannot be persisted.
      }
      setVisible(false)
      setCustomize(false)
    },
    []
  )

  if (!visible) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="cookie-consent-title"
      className="fixed bottom-0 left-0 right-0 z-50 mx-4 mb-6 rounded-3xl border border-brand-border bg-white p-5 md:p-7 shadow-2xl"
    >
      <button
        type="button"
        aria-label="Close cookie settings"
        onClick={() => setCustomize(false)}
        className="absolute top-4 right-4 p-2 text-text-secondary hover:text-brand-navy md:hidden"
      >
        <X className="h-5 w-5" />
      </button>

      <div className="flex flex-col md:flex-row md:items-start gap-4">
        {!customize ? (
          <>
            <div className="flex-grow">
              <h3 id="cookie-consent-title" className="text-base font-extrabold text-brand-deep">
                Cookies on CLOBANS FINANCE
              </h3>
              <p className="mt-1 text-sm text-text-secondary leading-relaxed">
                CLOBANS FINANCE uses essential cookies to keep our site secure
                and your session stable, and optional cookies to improve your
                site experience. Choose your preference below.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto mt-3 sm:mt-0">
              <Button
                onClick={() => savePrefs(true, true)}
                className="bg-brand-navy text-white text-sm font-extrabold px-5 py-2.5 rounded-xl hover:bg-brand-blue"
              >
                Accept All
              </Button>
              <Button
                variant="secondary"
                onClick={() => savePrefs(false, false)}
                className="text-sm font-extrabold border border-brand-border px-5 py-2.5 rounded-xl"
              >
                Essential Only
              </Button>
              <button
                type="button"
                onClick={() => setCustomize(true)}
                className="mt-3 sm:mt-0 text-sm font-medium text-text-secondary underline underline-offset-4 hover:text-brand-deep"
              >
                Customize
              </button>
            </div>
          </>
        ) : (
          <div className="flex-grow space-y-4 md:max-w-md">
            <h3 id="cookie-consent-title" className="text-base font-extrabold text-brand-deep">
              Customize Cookies
            </h3>
            <p className="text-sm text-text-secondary leading-relaxed">
              Choose which optional cookie categories you allow. Essential
              cookies are always on.
            </p>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-2xl border border-brand-border bg-brand-pale/50">
                <div>
                  <span className="text-sm font-medium text-text-main">
                    Essential cookies
                  </span>
                  <p className="text-xs text-text-secondary">
                    Required for security and session stability. Cannot be
                    turned off.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={true}
                  disabled
                  readOnly
                  aria-label="Essential cookies (always on)"
                  className="rounded border-brand-navy text-brand-navy focus:ring-brand-gold"
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-2xl border border-brand-border bg-white">
                <div>
                  <span className="text-sm font-medium text-text-main">
                    Analytics cookies
                  </span>
                  <p className="text-xs text-text-secondary">
                    Help us improve the site experience.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={analytics}
                  onChange={() => setAnalytics(!analytics)}
                  aria-label="Analytics cookies"
                  className="rounded border-brand-navy text-brand-navy focus:ring-brand-gold"
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-2xl border border-brand-border bg-white">
                <div>
                  <span className="text-sm font-medium text-text-main">
                    Marketing cookies
                  </span>
                  <p className="text-xs text-text-secondary">
                    Used to show you relevant offers and updates.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={marketing}
                  onChange={() => setMarketing(!marketing)}
                  aria-label="Marketing cookies"
                  className="rounded border-brand-navy text-brand-navy focus:ring-brand-gold"
                />
              </div>
            </div>

            <div className="mt-2 flex justify-end">
              <Button onClick={() => savePrefs(analytics, marketing)}>
                Save Preferences
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
