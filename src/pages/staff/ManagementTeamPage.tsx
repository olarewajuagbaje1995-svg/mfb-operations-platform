import { useEffect, useState } from 'react'
import {
  CheckCircle2,
  Crown,
  Eye,
  EyeOff,
  FileText,
  HelpCircle,
  Pencil,
  Plus,
  Trash2,
  Upload,
  Users,
  X,
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Alert, Spinner } from '@/components/feedback'
import { AboutContentEditor } from './AboutContentEditor'
import { FaqContentEditor } from './FaqContentEditor'

type Category = 'board' | 'executive' | 'departmental'

interface ManagementRow {
  id: string
  name: string
  position: string
  category: Category
  department: string | null
  is_ceo: boolean
  short_bio: string
  full_bio: string | null
  qualifications: string[] | null
  image_url: string | null
  linkedin_url: string | null
  display_order: number
  is_published: boolean
  created_at: string
}

interface FormState {
  name: string
  position: string
  category: Category
  department: string
  is_ceo: boolean
  short_bio: string
  full_bio: string
  qualificationsText: string
  image_url: string
  linkedin_url: string
  display_order: number
  is_published: boolean
}

const EMPTY_FORM: FormState = {
  name: '',
  position: '',
  category: 'executive',
  department: '',
  is_ceo: false,
  short_bio: '',
  full_bio: '',
  qualificationsText: '',
  image_url: '',
  linkedin_url: '',
  display_order: 0,
  is_published: true,
}

export default function ManagementTeamPage() {
  const [members, setMembers] = useState<ManagementRow[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [filterCategory, setFilterCategory] = useState<'all' | Category>('all')
  const [activeTab, setActiveTab] = useState<'leadership' | 'about' | 'faq'>('leadership')

  async function loadMembers() {
    try {
      setLoading(true)
      setError(null)
      const { data, error: fetchError } = await supabase
        .from('management_team')
        .select('*')
        .order('display_order', { ascending: true })
        .order('created_at', { ascending: true })

      if (fetchError) throw fetchError
      setMembers((data as ManagementRow[]) || [])
    } catch (err: any) {
      setError(err.message || 'Failed to load management team.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadMembers()
  }, [])

  function openCreateModal() {
    setEditingId(null)
    setForm({ ...EMPTY_FORM, display_order: members.length + 1 })
    setError(null)
    setModalOpen(true)
  }

  function openEditModal(member: ManagementRow) {
    setEditingId(member.id)
    setForm({
      name: member.name,
      position: member.position,
      category: member.category,
      department: member.department || '',
      is_ceo: member.is_ceo,
      short_bio: member.short_bio || '',
      full_bio: member.full_bio || '',
      qualificationsText: (member.qualifications || []).join('\n'),
      image_url: member.image_url || '',
      linkedin_url: member.linkedin_url || '',
      display_order: member.display_order ?? 0,
      is_published: member.is_published,
    })
    setError(null)
    setModalOpen(true)
  }

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setUploading(true)
      setError(null)

      const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
      const filePath = `portraits/${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 8)}.${ext}`

      const { error: uploadError } = await supabase.storage
        .from('management-photos')
        .upload(filePath, file, { upsert: true })

      if (uploadError) throw uploadError

      const { data: publicUrlData } = supabase.storage
        .from('management-photos')
        .getPublicUrl(filePath)

      setForm((prev) => ({ ...prev, image_url: publicUrlData.publicUrl }))
    } catch (err: any) {
      setError(err.message || 'Photo upload failed.')
    } finally {
      setUploading(false)
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim() || !form.position.trim()) {
      setError('Full name and position are required.')
      return
    }

    try {
      setSaving(true)
      setError(null)
      setSuccess(null)

      const qualifications = form.qualificationsText
        .split('\n')
        .map((q) => q.trim())
        .filter(Boolean)

      const payload = {
        name: form.name.trim(),
        position: form.position.trim(),
        category: form.category,
        department: form.department.trim() || null,
        is_ceo: form.is_ceo,
        short_bio: form.short_bio.trim(),
        full_bio: form.full_bio.trim() || null,
        qualifications,
        image_url: form.image_url.trim() || null,
        linkedin_url: form.linkedin_url.trim() || null,
        display_order: Number(form.display_order) || 0,
        is_published: form.is_published,
      }

      if (editingId) {
        const { error: updateError } = await supabase
          .from('management_team')
          .update(payload)
          .eq('id', editingId)

        if (updateError) throw updateError
        setSuccess(`Updated ${payload.name}.`)
      } else {
        const { error: insertError } = await supabase
          .from('management_team')
          .insert(payload)

        if (insertError) throw insertError
        setSuccess(`Added ${payload.name} to Management & Leadership.`)
      }

      setModalOpen(false)
      await loadMembers()
    } catch (err: any) {
      setError(err.message || 'Could not save leader profile.')
    } finally {
      setSaving(false)
    }
  }

  async function togglePublished(member: ManagementRow) {
    try {
      setError(null)
      const { error: updateError } = await supabase
        .from('management_team')
        .update({ is_published: !member.is_published })
        .eq('id', member.id)

      if (updateError) throw updateError
      setMembers((prev) =>
        prev.map((m) =>
          m.id === member.id ? { ...m, is_published: !m.is_published } : m
        )
      )
    } catch (err: any) {
      setError(err.message || 'Failed to update visibility.')
    }
  }

  async function handleDelete(member: ManagementRow) {
    if (!window.confirm(`Remove ${member.name} from the management team?`)) {
      return
    }

    try {
      setError(null)
      const { error: deleteError } = await supabase
        .from('management_team')
        .delete()
        .eq('id', member.id)

      if (deleteError) throw deleteError
      setSuccess(`Removed ${member.name}.`)
      setMembers((prev) => prev.filter((m) => m.id !== member.id))
    } catch (err: any) {
      setError(err.message || 'Failed to delete profile.')
    }
  }

  const visibleMembers =
    filterCategory === 'all'
      ? members
      : members.filter((m) => m.category === filterCategory)

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      {/* HEADER */}
      <div className="flex flex-col justify-between gap-4 rounded-2xl border border-[#DCE5F1] bg-white p-6 shadow-sm sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-[#B8840A]">
            <Users className="h-4 w-4" />
            <span>Public Website Content</span>
          </div>
          <h1 className="mt-1 font-heading text-2xl font-extrabold text-[#061E45]">
            Management &amp; Leadership
          </h1>
          <p className="mt-1 text-sm text-[#475467]">
            Add, edit, or publish Board members, CEO, Executives, and
            Departmental Leaders shown on <code>/management</code>.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#0B2F5B] px-5 py-3 text-sm font-bold text-white shadow-sm transition-all hover:bg-[#0052B4]"
        >
          <Plus className="h-4 w-4" />
          <span>Add Leader</span>
        </button>
      </div>

      {/* MANAGEMENT TABS */}
      <div className="flex gap-2 text-sm font-semibold">
        <button
          type="button"
          className={`px-3 py-1.5 rounded-xl border transition-colors ${
            activeTab === 'leadership'
              ? 'border-[#0B2F5B] bg-[#0B2F5B] text-white'
              : 'border-[#DCE5F1] text-[#475467] hover:bg-[#F8FAFD]'
          }`}
          onClick={() => setActiveTab('leadership')}
        >
          <FileText className="mr-2 h-4 w-4" /> Leadership Team
        </button>
        <button
          type="button"
          className={`px-3 py-1.5 rounded-xl border transition-colors ${
            activeTab === 'about'
              ? 'border-[#0B2F5B] bg-[#0B2F5B] text-white'
              : 'border-[#DCE5F1] text-[#475467] hover:bg-[#F8FAFD]'
          }`}
          onClick={() => setActiveTab('about')}
        >
          <HelpCircle className="mr-2 h-4 w-4" /> About Us Content
        </button>
        <button
          type="button"
          className={`px-3 py-1.5 rounded-xl border transition-colors ${
            activeTab === 'faq'
              ? 'border-[#0B2F5B] bg-[#0B2F5B] text-white'
              : 'border-[#DCE5F1] text-[#475467] hover:bg-[#F8FAFD]'
          }`}
          onClick={() => setActiveTab('faq')}
        >
          <HelpCircle className="mr-2 h-4 w-4" /> FAQs (Q&A)
        </button>
      </div>

      {error && <Alert tone="error">{error}</Alert>}
      {success && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {activeTab === 'leadership' ? (
        <>
          {/* CATEGORY FILTER TABS */}
          <div className="flex flex-wrap gap-2">
        {(['all', 'board', 'executive', 'departmental'] as const).map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setFilterCategory(cat)}
            className={`rounded-full px-4 py-2 text-xs font-bold capitalize transition-all ${
              filterCategory === cat
                ? 'bg-[#0B2F5B] text-white shadow-sm'
                : 'border border-[#DCE5F1] bg-white text-[#475467] hover:bg-[#F1F6FE]'
            }`}
          >
            {cat === 'all' ? `All (${members.length})` : cat}
          </button>
        ))}
      </div>

      {/* MEMBERS LIST */}
      {loading ? (
        <div className="flex min-h-[30vh] items-center justify-center rounded-2xl border border-[#DCE5F1] bg-white">
          <Spinner label="Loading leadership profiles..." />
        </div>
      ) : visibleMembers.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#DCE5F1] bg-white p-12 text-center">
          <p className="text-base font-bold text-[#061E45]">
            No leadership profiles yet
          </p>
          <p className="mt-1 text-sm text-[#475467]">
            Click &ldquo;Add Leader&rdquo; to publish your CEO, Board, or
            Executive Management team.
          </p>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {visibleMembers.map((member) => (
            <div
              key={member.id}
              className="flex flex-col justify-between overflow-hidden rounded-2xl border border-[#DCE5F1] bg-white shadow-sm"
            >
              <div className="p-5">
                <div className="flex items-start gap-4">
                  {member.image_url ? (
                    <img
                      src={member.image_url}
                      alt={member.name}
                      className="h-16 w-16 shrink-0 rounded-xl object-cover object-top border border-[#DCE5F1]"
                    />
                  ) : (
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-[#EAF2FD] text-lg font-extrabold text-[#0B2F5B]">
                      {member.name.slice(0, 2).toUpperCase()}
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="rounded-full bg-[#F1F6FE] px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-[#0B2F5B]">
                        {member.category}
                      </span>
                      {member.is_ceo && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-[#FFF9E6] px-2.5 py-0.5 text-[10px] font-extrabold uppercase text-[#8A6100]">
                          <Crown className="h-3 w-3" />
                          CEO
                        </span>
                      )}
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${
                          member.is_published
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {member.is_published ? 'Published' : 'Hidden'}
                      </span>
                    </div>

                    <h3 className="mt-2 truncate font-heading text-base font-extrabold text-[#061E45]">
                      {member.name}
                    </h3>
                    <p className="truncate text-xs font-semibold text-[#0052B4]">
                      {member.position}
                    </p>
                  </div>
                </div>

                {member.short_bio && (
                  <p className="mt-4 line-clamp-2 text-xs leading-5 text-[#475467]">
                    {member.short_bio}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between border-t border-[#DCE5F1] bg-[#F8FAFD] px-5 py-3">
                <span className="font-mono text-[11px] font-semibold text-[#667085]">
                  Order: #{member.display_order}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => togglePublished(member)}
                    title={member.is_published ? 'Hide from public' : 'Publish'}
                    className="rounded-lg border border-[#DCE5F1] bg-white p-2 text-[#475467] transition-colors hover:bg-[#EAF2FD] hover:text-[#0B2F5B]"
                  >
                    {member.is_published ? (
                      <Eye className="h-4 w-4" />
                    ) : (
                      <EyeOff className="h-4 w-4" />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => openEditModal(member)}
                    title="Edit profile"
                    className="rounded-lg border border-[#DCE5F1] bg-white p-2 text-[#0B2F5B] transition-colors hover:bg-[#EAF2FD]"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(member)}
                    title="Delete profile"
                    className="rounded-lg border border-red-200 bg-white p-2 text-red-600 transition-colors hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      </>
    ) : activeTab === 'about' ? (
      <AboutContentEditor />
    ) : (
      <FaqContentEditor />
    )}

      {/* ADD / EDIT MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#061E45]/60 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl sm:p-8">
            <div className="flex items-center justify-between border-b border-[#DCE5F1] pb-4">
              <h2 className="font-heading text-xl font-extrabold text-[#061E45]">
                {editingId ? 'Edit Leader Profile' : 'Add Leader Profile'}
              </h2>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="rounded-lg p-1.5 text-[#667085] hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="mt-6 space-y-5">
              {/* Portrait Upload */}
              <div className="flex flex-col items-start gap-4 rounded-2xl border border-[#DCE5F1] bg-[#F8FAFD] p-4 sm:flex-row sm:items-center">
                {form.image_url ? (
                  <img
                    src={form.image_url}
                    alt="Preview"
                    className="h-20 w-20 rounded-xl object-cover object-top border border-[#DCE5F1]"
                  />
                ) : (
                  <div className="flex h-20 w-20 items-center justify-center rounded-xl bg-[#EAF2FD] text-xs font-bold text-[#0B2F5B]">
                    No Photo
                  </div>
                )}

                <div className="flex-1 space-y-2">
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-[#0B2F5B] px-4 py-2 text-xs font-bold text-white hover:bg-[#0052B4]">
                    <Upload className="h-3.5 w-3.5" />
                    <span>{uploading ? 'Uploading...' : 'Upload Portrait'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      disabled={uploading}
                      className="hidden"
                    />
                  </label>
                  <input
                    type="url"
                    placeholder="Or paste image URL (https://...)"
                    value={form.image_url}
                    onChange={(e) =>
                      setForm({ ...form, image_url: e.target.value })
                    }
                    className="w-full rounded-xl border border-[#DCE5F1] bg-white px-3 py-2 text-xs text-[#101828]"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold text-[#344054]">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g. Dr. Adebayo Ogunlesi"
                    className="mt-1.5 w-full rounded-xl border border-[#DCE5F1] px-3.5 py-2.5 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#344054]">
                    Position / Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.position}
                    onChange={(e) =>
                      setForm({ ...form, position: e.target.value })
                    }
                    placeholder="e.g. Chief Executive Officer"
                    className="mt-1.5 w-full rounded-xl border border-[#DCE5F1] px-3.5 py-2.5 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#344054]">
                    Category *
                  </label>
                  <select
                    value={form.category}
                    onChange={(e) =>
                      setForm({ ...form, category: e.target.value as Category })
                    }
                    className="mt-1.5 w-full rounded-xl border border-[#DCE5F1] bg-white px-3.5 py-2.5 text-sm"
                  >
                    <option value="board">Board of Directors</option>
                    <option value="executive">Executive Management</option>
                    <option value="departmental">Departmental Leadership</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#344054]">
                    Department (Optional)
                  </label>
                  <input
                    type="text"
                    value={form.department}
                    onChange={(e) =>
                      setForm({ ...form, department: e.target.value })
                    }
                    placeholder="e.g. Credit & Risk Management"
                    className="mt-1.5 w-full rounded-xl border border-[#DCE5F1] px-3.5 py-2.5 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#344054]">
                    LinkedIn URL (Optional)
                  </label>
                  <input
                    type="url"
                    value={form.linkedin_url}
                    onChange={(e) =>
                      setForm({ ...form, linkedin_url: e.target.value })
                    }
                    placeholder="https://linkedin.com/in/..."
                    className="mt-1.5 w-full rounded-xl border border-[#DCE5F1] px-3.5 py-2.5 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#344054]">
                    Display Order
                  </label>
                  <input
                    type="number"
                    value={form.display_order}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        display_order: Number(e.target.value),
                      })
                    }
                    className="mt-1.5 w-full rounded-xl border border-[#DCE5F1] px-3.5 py-2.5 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#344054]">
                  Short Bio *
                </label>
                <textarea
                  rows={2}
                  required
                  value={form.short_bio}
                  onChange={(e) =>
                    setForm({ ...form, short_bio: e.target.value })
                  }
                  placeholder="Brief 1–2 sentence summary shown on the card..."
                  className="mt-1.5 w-full rounded-xl border border-[#DCE5F1] px-3.5 py-2.5 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#344054]">
                  Full Bio (Optional)
                </label>
                <textarea
                  rows={3}
                  value={form.full_bio}
                  onChange={(e) =>
                    setForm({ ...form, full_bio: e.target.value })
                  }
                  placeholder="Expanded biography shown when clicking 'Read full profile'..."
                  className="mt-1.5 w-full rounded-xl border border-[#DCE5F1] px-3.5 py-2.5 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#344054]">
                  Qualifications (one per line)
                </label>
                <textarea
                  rows={3}
                  value={form.qualificationsText}
                  onChange={(e) =>
                    setForm({ ...form, qualificationsText: e.target.value })
                  }
                  placeholder={'MBA, Lagos Business School\nFellow, ICAN'}
                  className="mt-1.5 w-full rounded-xl border border-[#DCE5F1] px-3.5 py-2.5 text-sm"
                />
              </div>

              <div className="flex flex-wrap gap-6 rounded-xl border border-[#DCE5F1] bg-[#F8FAFD] p-4">
                <label className="flex cursor-pointer items-center gap-2.5 text-sm font-semibold text-[#061E45]">
                  <input
                    type="checkbox"
                    checked={form.is_ceo}
                    onChange={(e) =>
                      setForm({ ...form, is_ceo: e.target.checked })
                    }
                    className="h-4 w-4 rounded border-slate-300"
                  />
                  <span>Feature as CEO Spotlight</span>
                </label>

                <label className="flex cursor-pointer items-center gap-2.5 text-sm font-semibold text-[#061E45]">
                  <input
                    type="checkbox"
                    checked={form.is_published}
                    onChange={(e) =>
                      setForm({ ...form, is_published: e.target.checked })
                    }
                    className="h-4 w-4 rounded border-slate-300"
                  />
                  <span>Published on Public Website</span>
                </label>
              </div>

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
                  disabled={saving || uploading}
                  className="rounded-xl bg-[#FFD036] px-6 py-2.5 text-sm font-extrabold text-[#061E45] shadow-md hover:bg-[#FFE066] disabled:opacity-60"
                >
                  {saving
                    ? 'Saving...'
                    : editingId
                      ? 'Save Changes'
                      : 'Add Leader'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}