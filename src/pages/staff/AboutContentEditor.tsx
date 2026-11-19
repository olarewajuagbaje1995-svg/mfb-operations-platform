import { useEffect, useState } from 'react'
import { CheckCircle2, Plus, Save, Trash2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Alert, Spinner } from '@/components/feedback'

interface ExtraSection {
  title: string
  body: string
}

interface AboutForm {
  hero_badge: string
  hero_title_line1: string
  hero_title_line2: string
  hero_subtitle: string
  intro_eyebrow: string
  intro_title: string
  intro_description: string
  positioning_title: string
  positioning_body: string
  offeringsText: string
  extra_sections: ExtraSection[]
  leadership_title: string
  leadership_subtitle: string
  leadership_body: string
  cta_title: string
  cta_subtitle: string
}

export function AboutContentEditor() {
  const [form, setForm] = useState<AboutForm | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      try {
        setLoading(true)
        const { data, error: fetchError } = await supabase
          .from('about_page_content')
          .select('*')
          .eq('slug', 'about-us')
          .maybeSingle()

        if (fetchError) throw fetchError

        setForm({
          hero_badge: data?.hero_badge || 'About CLOBANS FINANCE',
          hero_title_line1: data?.hero_title_line1 || 'Built to Finance',
          hero_title_line2: data?.hero_title_line2 || 'Nigerian Business.',
          hero_subtitle: data?.hero_subtitle || '',
          intro_eyebrow: data?.intro_eyebrow || 'WHO WE ARE',
          intro_title: data?.intro_title || '',
          intro_description: data?.intro_description || '',
          positioning_title: data?.positioning_title || 'Our Positioning',
          positioning_body: data?.positioning_body || '',
          offeringsText: Array.isArray(data?.offerings)
            ? data.offerings.join('\n')
            : '',
          extra_sections: Array.isArray(data?.extra_sections)
            ? (data.extra_sections as ExtraSection[])
            : [],
          leadership_title:
            data?.leadership_title || 'Meet Our Management Team',
          leadership_subtitle: data?.leadership_subtitle || '',
          leadership_body: data?.leadership_body || '',
          cta_title: data?.cta_title || 'Ready to Grow Your Business?',
          cta_subtitle: data?.cta_subtitle || '',
        })
      } catch (err: any) {
        setError(err.message || 'Failed to load About Us content.')
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  function addExtraSection() {
    if (!form) return
    setForm({
      ...form,
      extra_sections: [...form.extra_sections, { title: '', body: '' }],
    })
  }

  function updateExtraSection(
    index: number,
    field: keyof ExtraSection,
    value: string
  ) {
    if (!form) return
    const updated = form.extra_sections.map((sec, i) =>
      i === index ? { ...sec, [field]: value } : sec
    )
    setForm({ ...form, extra_sections: updated })
  }

  function removeExtraSection(index: number) {
    if (!form) return
    setForm({
      ...form,
      extra_sections: form.extra_sections.filter((_, i) => i !== index),
    })
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!form) return

    try {
      setSaving(true)
      setError(null)
      setSuccess(null)

      const offerings = form.offeringsText
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean)

      const cleanExtraSections = form.extra_sections
        .map((s) => ({ title: s.title.trim(), body: s.body.trim() }))
        .filter((s) => s.title || s.body)

      const { error: upsertError } = await supabase
        .from('about_page_content')
        .upsert({
          slug: 'about-us',
          hero_badge: form.hero_badge.trim(),
          hero_title_line1: form.hero_title_line1.trim(),
          hero_title_line2: form.hero_title_line2.trim(),
          hero_subtitle: form.hero_subtitle.trim(),
          intro_eyebrow: form.intro_eyebrow.trim(),
          intro_title: form.intro_title.trim(),
          intro_description: form.intro_description.trim(),
          positioning_title: form.positioning_title.trim(),
          positioning_body: form.positioning_body.trim(),
          offerings,
          extra_sections: cleanExtraSections,
          leadership_title: form.leadership_title.trim(),
          leadership_subtitle: form.leadership_subtitle.trim(),
          leadership_body: form.leadership_body.trim(),
          cta_title: form.cta_title.trim(),
          cta_subtitle: form.cta_subtitle.trim(),
        })

      if (upsertError) throw upsertError
      setSuccess('About Us page updated live!')
    } catch (err: any) {
      setError(err.message || 'Could not save About Us content.')
    } finally {
      setSaving(false)
    }
  }

  if (loading || !form) {
    return (
      <div className="flex min-h-[30vh] items-center justify-center rounded-2xl border border-[#DCE5F1] bg-white">
        <Spinner label="Loading About Us content..." />
      </div>
    )
  }

  return (
    <form
      onSubmit={handleSave}
      className="space-y-6 rounded-2xl border border-[#DCE5F1] bg-white p-6 shadow-sm sm:p-8"
    >
      {error && <Alert tone="error">{error}</Alert>}
      {success && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Hero Section */}
      <div className="space-y-4 border-b border-[#DCE5F1] pb-6">
        <h2 className="font-heading text-lg font-extrabold text-[#061E45]">
          Hero Banner
        </h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="block text-xs font-bold text-[#344054]">
              Top Badge
            </label>
            <input
              type="text"
              value={form.hero_badge}
              onChange={(e) => setForm({ ...form, hero_badge: e.target.value })}
              className="mt-1.5 w-full rounded-xl border border-[#DCE5F1] px-3.5 py-2.5 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-[#344054]">
              Headline Line 1 (White)
            </label>
            <input
              type="text"
              value={form.hero_title_line1}
              onChange={(e) =>
                setForm({ ...form, hero_title_line1: e.target.value })
              }
              className="mt-1.5 w-full rounded-xl border border-[#DCE5F1] px-3.5 py-2.5 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-[#344054]">
              Headline Line 2 (Gold)
            </label>
            <input
              type="text"
              value={form.hero_title_line2}
              onChange={(e) =>
                setForm({ ...form, hero_title_line2: e.target.value })
              }
              className="mt-1.5 w-full rounded-xl border border-[#DCE5F1] px-3.5 py-2.5 text-sm"
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-bold text-[#344054]">
            Hero Subtitle
          </label>
          <textarea
            rows={2}
            value={form.hero_subtitle}
            onChange={(e) =>
              setForm({ ...form, hero_subtitle: e.target.value })
            }
            className="mt-1.5 w-full rounded-xl border border-[#DCE5F1] px-3.5 py-2.5 text-sm"
          />
        </div>
      </div>

      {/* Intro & Positioning */}
      <div className="space-y-4 border-b border-[#DCE5F1] pb-6">
        <h2 className="font-heading text-lg font-extrabold text-[#061E45]">
          Company Overview &amp; Offerings
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-bold text-[#344054]">
              Section Heading
            </label>
            <input
              type="text"
              value={form.intro_title}
              onChange={(e) =>
                setForm({ ...form, intro_title: e.target.value })
              }
              className="mt-1.5 w-full rounded-xl border border-[#DCE5F1] px-3.5 py-2.5 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-[#344054]">
              Positioning Card Title
            </label>
            <input
              type="text"
              value={form.positioning_title}
              onChange={(e) =>
                setForm({ ...form, positioning_title: e.target.value })
              }
              className="mt-1.5 w-full rounded-xl border border-[#DCE5F1] px-3.5 py-2.5 text-sm"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-[#344054]">
            Overview Description
          </label>
          <textarea
            rows={2}
            value={form.intro_description}
            onChange={(e) =>
              setForm({ ...form, intro_description: e.target.value })
            }
            className="mt-1.5 w-full rounded-xl border border-[#DCE5F1] px-3.5 py-2.5 text-sm"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-bold text-[#344054]">
              Our Positioning Text
            </label>
            <textarea
              rows={4}
              value={form.positioning_body}
              onChange={(e) =>
                setForm({ ...form, positioning_body: e.target.value })
              }
              className="mt-1.5 w-full rounded-xl border border-[#DCE5F1] px-3.5 py-2.5 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-[#344054]">
              What We Offer (one item per line)
            </label>
            <textarea
              rows={4}
              value={form.offeringsText}
              onChange={(e) =>
                setForm({ ...form, offeringsText: e.target.value })
              }
              className="mt-1.5 w-full rounded-xl border border-[#DCE5F1] px-3.5 py-2.5 text-sm"
            />
          </div>
        </div>
      </div>

      {/* Extra Custom Sections */}
      <div className="space-y-4 border-b border-[#DCE5F1] pb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-heading text-lg font-extrabold text-[#061E45]">
              Additional Sections (Mission, Vision, History, etc.)
            </h2>
            <p className="text-xs text-[#475467]">
              Add custom cards to appear on the public About Us page.
            </p>
          </div>
          <button
            type="button"
            onClick={addExtraSection}
            className="inline-flex items-center gap-1.5 rounded-xl border border-[#0B2F5B] bg-white px-4 py-2 text-xs font-bold text-[#0B2F5B] hover:bg-[#EAF2FD]"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Section</span>
          </button>
        </div>

        {form.extra_sections.map((sec, idx) => (
          <div
            key={idx}
            className="space-y-3 rounded-2xl border border-[#DCE5F1] bg-[#F8FAFD] p-4"
          >
            <div className="flex items-center justify-between gap-3">
              <input
                type="text"
                placeholder="Section Title (e.g. Our Mission)"
                value={sec.title}
                onChange={(e) =>
                  updateExtraSection(idx, 'title', e.target.value)
                }
                className="flex-1 rounded-xl border border-[#DCE5F1] bg-white px-3.5 py-2 text-sm font-bold"
              />
              <button
                type="button"
                onClick={() => removeExtraSection(idx)}
                className="rounded-lg border border-red-200 bg-white p-2 text-red-600 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
            <textarea
              rows={3}
              placeholder="Write section content..."
              value={sec.body}
              onChange={(e) => updateExtraSection(idx, 'body', e.target.value)}
              className="w-full rounded-xl border border-[#DCE5F1] bg-white px-3.5 py-2 text-sm"
            />
          </div>
        ))}
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-xl bg-[#FFD036] px-6 py-3 text-sm font-extrabold text-[#061E45] shadow-md transition-all hover:bg-[#FFE066] disabled:opacity-60"
        >
          <Save className="h-4 w-4" />
          <span>{saving ? 'Saving...' : 'Save About Us Content'}</span>
        </button>
      </div>
    </form>
  )
}