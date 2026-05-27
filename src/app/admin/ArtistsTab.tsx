'use client'

import { useState } from 'react'
import type { Artist } from '@/types'

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

const emptyForm = (): Omit<Artist, 'id'> => ({
  name: '', genre: '', description: '', website: '', defaultCoverCharge: 'Free',
})

interface Props {
  initialArtists: Artist[]
  password: string
  isDark: boolean
}

export default function ArtistsTab({ initialArtists, password, isDark }: Props) {
  const [artists, setArtists] = useState<Artist[]>(initialArtists)
  const [form, setForm] = useState(emptyForm())
  const [status, setStatus] = useState<SaveStatus>('idle')

  const d = (dark: string, light: string) => isDark ? dark : light

  const inputCls = `w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 ${
    d('bg-gray-800 border-gray-600 text-gray-100 placeholder:text-gray-500', 'bg-white border-gray-300 text-gray-900')
  }`
  const labelCls = `text-xs font-semibold uppercase tracking-wide block mb-1 ${d('text-gray-400', 'text-gray-500')}`

  function addArtist() {
    if (!form.name.trim()) return
    setArtists(prev => [...prev, { ...form, id: `artist-${Date.now()}` }])
    setForm(emptyForm())
  }

  function removeArtist(id: string) {
    setArtists(prev => prev.filter(a => a.id !== id))
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
          <div key={a.id} className={`border rounded-lg p-4 flex items-start justify-between gap-4 ${d('border-gray-700', 'border-gray-200 bg-white')}`}>
            <div className="min-w-0">
              <p className={`font-semibold ${d('text-amber-400', 'text-gray-900')}`}>{a.name}</p>
              <p className={`text-sm ${d('text-gray-400', 'text-gray-500')}`}>
                {a.genre}{a.defaultCoverCharge ? ` · ${a.defaultCoverCharge}` : ''}
              </p>
              {a.description && (
                <p className={`text-xs mt-1 line-clamp-2 ${d('text-gray-500', 'text-gray-400')}`}>{a.description}</p>
              )}
              {a.website && (
                <p className="text-xs text-amber-500 mt-1 truncate">{a.website}</p>
              )}
            </div>
            <button onClick={() => removeArtist(a.id)} className="text-xs text-red-400 hover:text-red-500 shrink-0 mt-0.5">
              Remove
            </button>
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
              <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="Artist or band name" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Genre</label>
              <input type="text" value={form.genre} onChange={e => setForm(f => ({ ...f, genre: e.target.value }))}
                placeholder="e.g. Live Jazz, Blues, Indie Folk" className={inputCls} />
            </div>
          </div>
          <div>
            <label className={labelCls}>Description</label>
            <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              rows={3} placeholder="Short bio shown on the shows page"
              className={`${inputCls} resize-y`} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Website / Ticket Link</label>
              <input type="text" value={form.website} onChange={e => setForm(f => ({ ...f, website: e.target.value }))}
                placeholder="https://..." className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Default Cover Charge</label>
              <input type="text" value={form.defaultCoverCharge} onChange={e => setForm(f => ({ ...f, defaultCoverCharge: e.target.value }))}
                placeholder="Free, $10, etc." className={inputCls} />
            </div>
          </div>
          <button onClick={addArtist} disabled={!form.name.trim()}
            className="bg-gray-700 hover:bg-gray-600 disabled:opacity-40 text-white font-semibold px-5 py-2 rounded text-sm transition-colors w-fit">
            Add to Roster
          </button>
        </div>
      </details>

      {/* Save */}
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
