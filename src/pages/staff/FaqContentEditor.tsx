import { useEffect, useState } from 'react'
import {
  CheckCircle2,
  Eye,
  EyeOff,
  HelpCircle,
  Pencil,
  Plus,
  Trash2,
  X,
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Alert, Spinner } from '@/components/feedback'

interface FaqRow {
  id: string
  category: string
  question: string
  answer: string
  display_order: number
  is_published: boolean
}

const DEFAULT_CATEGORIES = [
  'General Questions',
  'SME Business Loans',
  'Asset-Backed Finance',
  'Equipment Finance',
  'Working Capital',
  'Application Process',
  'Documentation',
  'Application Tracking',
  'Customer Support',
]

export function FaqContentEditor() {
  const [items, setItems] = useState<FaqRow[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [category, setCategory] = useState('General Questions')
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState('')
  const [displayOrder, setDisplayOrder] = useState(0)
  const [isPublished, setIsPublished] = useState(true)

  async function loadFaqs() {
    try {
      setLoading(true)
      setError(null)
      const { data, error: fetchError } = await supabase
        .from('faq_items')
        .select('*')
        .order('display_order', { ascending: true })
        .order('created_at', { ascending: true })

      if (fetchError) throw fetchError
      setItems((data as FaqRow[]) || [])
    } catch (err: any) {
      setError(err.message || 'Failed to load FAQs.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadFaqs()
  }, [])

  function openCreate() {
    setEditingId(null)
    setCategory('General Questions')
    setQuestion('')
    setAnswer('')
    setDisplayOrder(items.length + 1)
    setIsPublished(true)
    setError(null)
    setModalOpen(true)
  }

  function openEdit(item: FaqRow) {
    setEditingId(item.id)
    setCategory(item.category)
    setQuestion(item.question)
    setAnswer(item.answer)
    setDisplayOrder(item.display_order)
    setIsPublished(item.is_published)
    setError(null)
    setModalOpen(true)
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!question.trim() || !answer.trim()) {
      setError('Both question and answer are required.')
      return
    }

    try {
      setSaving(true)
      setError(null)
      setSuccess(null)

      const payload = {
        category: category.trim() || 'General Questions',
        question: question.trim(),
        answer: answer.trim(),
        display_order: Number(displayOrder) || 0,
        is_published: isPublished,
      }

      if (editingId) {
        const { error: updateError } = await supabase
          .from('faq_items')
          .update(payload)
          .eq('id', editingId)
        if (updateError) throw updateError
        setSuccess('FAQ updated.')
      } else {
        const { error: insertError } = await supabase
          .from('faq_items')
          .insert(payload)
        if (insertError) throw insertError
        setSuccess('New FAQ added.')
      }

      setModalOpen(false)
      await loadFaqs()
    } catch (err: any) {
      setError(err.message || 'Could not save FAQ.')
    } finally {
      setSaving(false)
    }
  }

  async function togglePublish(item: FaqRow) {
    try {
      setError(null)
      const { error: updateError } = await supabase
        .from('faq_items')
        .update({ is_published: !item.is_published })
        .eq('id', item.id)

      if (updateError) throw updateError
      setItems((prev) =>
        prev.map((row) =>
          row.id === item.id
            ? { ...row, is_published: !row.is_published }
            : row
        )
      )
    } catch (err: any) {
      setError(err.message || 'Failed to update visibility.')
    }
  }

  async function handleDelete(item: FaqRow) {
    if (!window.confirm(`Delete this FAQ?\n\n"${item.question}"`)) return
    try {
      setError(null)
      const { error: deleteError } = await supabase
        .from('faq_items')
        .delete()
        .eq('id', item.id)

      if (deleteError) throw deleteError
      setItems((prev) => prev.filter((row) => row.id !== item.id))
      setSuccess('FAQ deleted.')
    } catch (err: any) {
      setError(err.message || 'Failed to delete FAQ.')
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-4 rounded-2xl border border-[#DCE5F1] bg-white p-6 shadow-sm sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-[#B8840A]">
            <HelpCircle className="h-4 w-4" />
            <span>Help Centre</span>
          </div>
          <h2 className="mt-1 font-heading text-xl font-extrabold text-[#061E45]">
            Frequently Asked Questions ({items.length})
          </h2>
          <p className="mt-1 text-xs text-[#475467]">
            Add, edit, hide, or remove questions shown on <code>/faq</code>.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreate}
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#0B2F5B] px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-[#0052B4]"
        >
          <Plus className="h-4 w-4" />
          <span>Add Question</span>
        </button>
      </div>

      {error && <Alert tone="error">{error}</Alert>}
      {success && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {loading ? (
        <div className="flex min-h-[25vh] items-center justify-center rounded-2xl border border-[#DCE5F1] bg-white">
          <Spinner label="Loading FAQs..." />
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#DCE5F1] bg-white p-10 text-center">
          <p className="text-sm font-bold text-[#061E45]">No FAQs added yet</p>
          <p className="mt-1 text-xs text-[#475467]">
            Click &ldquo;Add Question&rdquo; to publish your first FAQ.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex flex-col justify-between gap-4 rounded-2xl border border-[#DCE5F1] bg-white p-5 shadow-sm sm:flex-row sm:items-start"
            >
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-[#F1F6FE] px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-[#0B2F5B]">
                    {item.category}
                  </span>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${
                      item.is_published
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {item.is_published ? 'Published' : 'Hidden'}
                  </span>
                  <span className="font-mono text-[10px] text-[#667085]">
                    #{item.display_order}
                  </span>
                </div>
                <h3 className="font-heading text-sm font-extrabold text-[#061E45]">
                  {item.question}
                </h3>
                <p className="text-xs leading-6 text-[#475467]">{item.answer}</p>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                <button
                  type="button"
                  onClick={() => togglePublish(item)}
                  title={item.is_published ? 'Hide' : 'Publish'}
                  className="rounded-lg border border-[#DCE5F1] bg-white p-2 text-[#475467] hover:bg-[#EAF2FD] hover:text-[#0B2F5B]"
                >
                  {item.is_published ? (
                    <Eye className="h-4 w-4" />
                  ) : (
                    <EyeOff className="h-4 w-4" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => openEdit(item)}
                  title="Edit FAQ"
                  className="rounded-lg border border-[#DCE5F1] bg-white p-2 text-[#0B2F5B] hover:bg-[#EAF2FD]"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(item)}
                  title="Delete FAQ"
                  className="rounded-lg border border-red-200 bg-white p-2 text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ADD / EDIT MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#061E45]/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-3xl bg-white p-6 shadow-2xl sm:p-8">
            <div className="flex items-center justify-between border-b border-[#DCE5F1] pb-4">
              <h3 className="font-heading text-lg font-extrabold text-[#061E45]">
                {editingId ? 'Edit Question & Answer' : 'Add Question & Answer'}
              </h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="rounded-lg p-1.5 text-[#667085] hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="mt-5 space-y-4">
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-[#344054]">
                    Category *
                  </label>
                  <input
                    list="faq-categories-list"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    required
                    className="mt-1.5 w-full rounded-xl border border-[#DCE5F1] px-3.5 py-2.5 text-sm"
                  />
                  <datalist id="faq-categories-list">
                    {DEFAULT_CATEGORIES.map((c) => (
                      <option key={c} value={c} />
                    ))}
                  </datalist>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#344054]">
                    Display Order
                  </label>
                  <input
                    type="number"
                    value={displayOrder}
                    onChange={(e) => setDisplayOrder(Number(e.target.value))}
                    className="mt-1.5 w-full rounded-xl border border-[#DCE5F1] px-3.5 py-2.5 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#344054]">
                  Question *
                </label>
                <input
                  type="text"
                  required
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="e.g. How long does loan approval take?"
                  className="mt-1.5 w-full rounded-xl border border-[#DCE5F1] px-3.5 py-2.5 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#344054]">
                  Answer *
                </label>
                <textarea
                  rows={4}
                  required
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder="Write a clear, helpful answer..."
                  className="mt-1.5 w-full rounded-xl border border-[#DCE5F1] px-3.5 py-2.5 text-sm"
                />
              </div>

              <label className="flex cursor-pointer items-center gap-2.5 text-sm font-semibold text-[#061E45]">
                <input
                  type="checkbox"
                  checked={isPublished}
                  onChange={(e) => setIsPublished(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300"
                />
                <span>Published on Public Website</span>
              </label>

              <div className="flex justify-end gap-3 border-t border-[#DCE5F1] pt-4">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-xl border border-[#DCE5F1] px-5 py-2.5 text-sm font-bold text-[#475467] hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-[#FFD036] px-6 py-2.5 text-sm font-extrabold text-[#061E45] shadow-md hover:bg-[#FFE066] disabled:opacity-60"
                >
                  {saving ? 'Saving...' : editingId ? 'Save Changes' : 'Add FAQ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}