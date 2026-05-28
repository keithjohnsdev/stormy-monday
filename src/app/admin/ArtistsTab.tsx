'use client'

import { useState } from 'react'
import type { Artist } from '@/types'
import ImageUpload from '@/components/admin/ImageUpload'

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

const emptyArtist = (): Omit<Artist, 'id'> => ({
  name: '', genre: '', description: '', website: '', defaultCoverCharge: 'Free', email: '', password: '', imageUrl: '',
})

interface Props {
  initialArtists: Artist[]
  password: string
  isDark: boolean
}

export default function ArtistsTab({ initialArtists, password, isDark }: Props) {
  const [artists, setArtists] = useState<Artist[]>(initialArtists)
  const [addForm, setAddForm] = useState(emptyArtist())
  const [pendingAddId, setPendingAddId] = useState(() => `artist-${Date.now()}`)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<Artist | null>(null)
  const [status, setStatus] = useState<SaveStatus>('idle')

  const d = (dark: string, light: string) => isDark ? dark : light

  const inputCls = `w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 ${
    d('bg-gray-800 border-gray-600 text-gray-100 placeholder:text-gray-500', 'bg-white border-gray-300 text-gray-900')
  }`
  const labelCls = `text-xs font-semibold uppercase tracking-wide block mb-1 ${d('text-gray-400', 'text-gray-500')}`

  function startEdit(artist: Artist) {
    setEditingId(artist.id)
    setEditForm({ ...artist })
  }

  function cancelEdit() {
    setEditingId(null)
    setEditForm(null)
  }

  function saveEdit() {
    if (!editForm) return
    setArtists(prev => prev.map(a => a.id === editingId ? { ...editForm } : a))
    setEditingId(null)
    setEditForm(null)
  }

  function addArtist() {
    if (!addForm.name.trim()) return
    setArtists(prev => [...prev, { ...addForm, id: pendingAddId }])
    setAddForm(emptyArtist())
    setPendingAddId(`artist-${Date.now()}`)
  }

  function removeArtist(id: string) {
    setArtists(prev => prev.filter(a => a.id !== id))
    if (editingId === id) cancelEdit()
  }

  async function save() {
    setStatus('saving')
    try {
      const res = await fetch('/api/save-artists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Admin-Password': password },
        body: JSON.stringify({ artists }),
      })
      setStatus(res.ok ? 'saved' : 'error')
      if (res.ok) setTimeout(() => setStatus('idle'), 4000)
    } catch {
      setStatus('error')
    }
  }

  return (
    <div className="grid gap-6">

      {/* Artist list */}
      <div className="grid gap-3">
        {artists.length === 0 && (
          <p className={`text-sm text-center py-8 ${d('text-gray-500', 'text-gray-400')}`}>
            No artists yet. Add one below.
          </p>
        )}

        {artists.map(a => (
          <div key={a.id} className={`border rounded-lg overflow-hidden ${d('border-gray-700', 'border-gray-200')}`}>
            {/* Card header */}
            <div className={`px-4 py-3 flex items-start justify-between gap-4 ${d('bg-gray-800', 'bg-white')}`}>
              <div className="min-w-0 flex-1">
                <p className={`font-semibold ${d('text-amber-400', 'text-gray-900')}`}>{a.name}</p>
                <p className={`text-sm ${d('text-gray-400', 'text-gray-500')}`}>
                  {a.genre}
                  {a.email ? (
                    <span className={`ml-2 text-xs ${d('text-green-400', 'text-green-600')}`}>
                      · Portal: {a.email}
                    </span>
                  ) : (
                    <span className={`ml-2 text-xs ${d('text-gray-600', 'text-gray-400')}`}>· No portal access</span>
                  )}
                </p>
              </div>
              <div className="flex gap-2 shrink-0">
                <button
                  onClick={() => editingId === a.id ? cancelEdit() : startEdit(a)}
                  className={`text-xs px-2.5 py-1 rounded border transition-colors ${
                    editingId === a.id
                      ? d('border-amber-600 text-amber-400 hover:bg-amber-900/30', 'border-amber-400 text-amber-600 hover:bg-amber-50')
                      : d('border-gray-600 text-gray-400 hover:text-gray-200', 'border-gray-300 text-gray-500 hover:text-gray-800')
                  }`}
                >
                  {editingId === a.id ? 'Cancel' : 'Edit'}
                </button>
                <button
                  onClick={() => removeArtist(a.id)}
                  className="text-xs text-red-400 hover:text-red-500 px-2"
                >
                  Remove
                </button>
              </div>
            </div>

            {/* Inline edit form */}
            {editingId === a.id && editForm && (
              <div className={`px-4 py-4 grid gap-3 border-t ${d('bg-gray-900 border-gray-700', 'bg-gray-50 border-gray-200')}`}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>Name *</label>
                    <input type="text" value={editForm.name}
                      onChange={e => setEditForm(f => f ? { ...f, name: e.target.value } : f)}
                      className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Genre</label>
                    <input type="text" value={editForm.genre}
                      onChange={e => setEditForm(f => f ? { ...f, genre: e.target.value } : f)}
                      className={inputCls} />
                  </div>
                </div>
                <div>
                  <label className={labelCls}>Description / Bio</label>
                  <textarea value={editForm.description}
                    onChange={e => setEditForm(f => f ? { ...f, description: e.target.value } : f)}
                    rows={3} className={`${inputCls} resize-y`} />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>Website</label>
                    <input type="text" value={editForm.website}
                      onChange={e => setEditForm(f => f ? { ...f, website: e.target.value } : f)}
                      className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Default Cover Charge</label>
                    <input type="text" value={editForm.defaultCoverCharge}
                      onChange={e => setEditForm(f => f ? { ...f, defaultCoverCharge: e.target.value } : f)}
                      className={inputCls} />
                  </div>
                </div>
                <div className={`border-t pt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 ${d('border-gray-700', 'border-gray-200')}`}>
                  <div>
                    <label className={labelCls}>Portal Login Email</label>
                    <input type="email" value={editForm.email ?? ''}
                      onChange={e => setEditForm(f => f ? { ...f, email: e.target.value } : f)}
                      placeholder="musician@email.com" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Portal Password</label>
                    <input type="text" value={editForm.password ?? ''}
                      onChange={e => setEditForm(f => f ? { ...f, password: e.target.value } : f)}
                      placeholder="Set a password for this artist" className={inputCls} />
                  </div>
                </div>
                <p className={`text-xs ${d('text-gray-500', 'text-gray-400')}`}>
                  Portal credentials let this artist log in at /musicians to self-book shows.
                  Leave blank to disable portal access.
                </p>
                <div className={`border-t pt-3 ${d('border-gray-700', 'border-gray-200')}`}>
                  <label className={`${labelCls} mb-2`}>Artist Photo</label>
                  <ImageUpload
                    value={editForm.imageUrl ?? ''}
                    folder="artists"
                    entityId={editForm.id}
                    password={password}
                    isDark={isDark}
                    onChange={url => setEditForm(f => f ? { ...f, imageUrl: url } : f)}
                  />
                </div>
                <button
                  onClick={saveEdit}
                  disabled={!editForm.name.trim()}
                  className="bg-amber-500 hover:bg-amber-600 disabled:opacity-40 text-white font-semibold px-5 py-2 rounded text-sm transition-colors w-fit"
                >
                  Save Changes
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add artist */}
      <details className={`border rounded-lg overflow-hidden ${d('border-gray-700', 'border-gray-200')}`}>
        <summary className={`px-5 py-3 cursor-pointer text-sm font-semibold select-none ${
          d('bg-gray-800 text-gray-200 hover:bg-gray-700', 'bg-gray-50 text-gray-700 hover:bg-gray-100')
        }`}>
          + Add Artist
        </summary>
        <div className={`px-5 py-4 grid gap-3 ${d('bg-gray-900', 'bg-white')}`}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Name *</label>
              <input type="text" value={addForm.name}
                onChange={e => setAddForm(f => ({ ...f, name: e.target.value }))}
                placeholder="Artist or band name" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Genre</label>
              <input type="text" value={addForm.genre}
                onChange={e => setAddForm(f => ({ ...f, genre: e.target.value }))}
                placeholder="e.g. Live Jazz, Blues, Indie Folk" className={inputCls} />
            </div>
          </div>
          <div>
            <label className={labelCls}>Description / Bio</label>
            <textarea value={addForm.description}
              onChange={e => setAddForm(f => ({ ...f, description: e.target.value }))}
              rows={3} placeholder="Short bio shown on the shows page"
              className={`${inputCls} resize-y`} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Website / Ticket Link</label>
              <input type="text" value={addForm.website}
                onChange={e => setAddForm(f => ({ ...f, website: e.target.value }))}
                placeholder="https://..." className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Default Cover Charge</label>
              <input type="text" value={addForm.defaultCoverCharge}
                onChange={e => setAddForm(f => ({ ...f, defaultCoverCharge: e.target.value }))}
                placeholder="Free, $10, etc." className={inputCls} />
            </div>
          </div>
          <div className={`border-t pt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 ${d('border-gray-700', 'border-gray-200')}`}>
            <div>
              <label className={labelCls}>Portal Login Email</label>
              <input type="email" value={addForm.email ?? ''}
                onChange={e => setAddForm(f => ({ ...f, email: e.target.value }))}
                placeholder="musician@email.com" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Portal Password</label>
              <input type="text" value={addForm.password ?? ''}
                onChange={e => setAddForm(f => ({ ...f, password: e.target.value }))}
                placeholder="Optional — enables /musicians login" className={inputCls} />
            </div>
          </div>
          <div className={`border-t pt-3 ${d('border-gray-700', 'border-gray-200')}`}>
            <label className={`${labelCls} mb-2`}>Artist Photo</label>
            <ImageUpload
              value={addForm.imageUrl ?? ''}
              folder="artists"
              entityId={pendingAddId}
              password={password}
              isDark={isDark}
              onChange={url => setAddForm(f => ({ ...f, imageUrl: url }))}
            />
          </div>
          <button onClick={addArtist} disabled={!addForm.name.trim()}
            className="bg-gray-700 hover:bg-gray-600 disabled:opacity-40 text-white font-semibold px-5 py-2 rounded text-sm transition-colors w-fit">
            Add to Roster
          </button>
        </div>
      </details>

      {/* Save roster */}
      <div className="flex items-center gap-4 pt-2">
        <button onClick={save} disabled={status === 'saving'}
          className="bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white font-semibold px-6 py-2.5 rounded text-sm transition-colors">
          {status === 'saving' ? 'Saving…' : 'Save Roster'}
        </button>
        {status === 'saved' && <span className="text-green-500 text-sm">Saved. Live in ~30 seconds.</span>}
        {status === 'error' && <span className="text-red-400 text-sm">Something went wrong. Try again.</span>}
      </div>

    </div>
  )
}
