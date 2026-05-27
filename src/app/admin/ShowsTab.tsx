'use client'

import { useState } from 'react'
import type { Artist, StoredShow } from '@/types'

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

function today() {
  return new Date().toISOString().split('T')[0]
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
}

interface Props {
  initialShows: StoredShow[]
  artists: Artist[]
  password: string
  isDark: boolean
  onAuthError: () => void
}

export default function ShowsTab({ initialShows, artists, password, isDark, onAuthError }: Props) {
  const [shows, setShows] = useState<StoredShow[]>(
    [...initialShows].sort((a, b) => a.date.localeCompare(b.date))
  )
  const [artistId, setArtistId] = useState('')
  const [date, setDate] = useState('')
  const [featured, setFeatured] = useState(false)
  const [ticketed, setTicketed] = useState(false)
  const [status, setStatus] = useState<SaveStatus>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  const dk = (dark: string, light: string) => isDark ? dark : light

  const inputCls = `w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 ${
    dk('bg-gray-800 border-gray-600 text-gray-100', 'bg-white border-gray-300 text-gray-900')
  }`

  const selectedArtist = artists.find(a => a.id === artistId)
  const todayStr = today()
  const upcoming = shows.filter(s => s.date >= todayStr)
  const past = shows.filter(s => s.date < todayStr)

  function addShow() {
    if (!artistId || !date || !selectedArtist) return
    const newShow: StoredShow = {
      id: `show-${Date.now()}`,
      artistId: selectedArtist.id,
      artistName: selectedArtist.name,
      date,
      startTime: '8pm',
      genre: selectedArtist.genre,
      description: selectedArtist.description,
      ticketed,
      ticketLink: '',
      artistWebsite: selectedArtist.website || '',
      coverCharge: selectedArtist.defaultCoverCharge,
      featured,
      status: 'published',
    }
    setShows(prev => [...prev, newShow].sort((a, b) => a.date.localeCompare(b.date)))
    setArtistId('')
    setDate('')
    setFeatured(false)
    setTicketed(false)
  }

  function removeShow(id: string) {
    setShows(prev => prev.filter(s => s.id !== id))
  }

  async function save() {
    setStatus('saving')
    try {
      const res = await fetch('/api/save-shows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Admin-Password': password },
        body: JSON.stringify({ shows }),
      })
      if (res.status === 401) {
        onAuthError()
        return
      }
      if (res.ok) {
        setStatus('saved')
        setTimeout(() => setStatus('idle'), 5000)
      } else {
        const body = await res.json().catch(() => ({}))
        setErrorMsg(body.error ?? `HTTP ${res.status}`)
        setStatus('error')
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Network error')
      setStatus('error')
    }
  }

  return (
    <div className="grid gap-6">

      {/* Add show form */}
      <div className={`border rounded-lg p-5 grid gap-4 ${dk('border-gray-700 bg-gray-800', 'border-gray-200 bg-white')}`}>
        <p className={`font-semibold ${dk('text-gray-100', 'text-gray-800')}`}>Schedule a Show</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className={`text-xs font-semibold uppercase tracking-wide block mb-1 ${dk('text-gray-400', 'text-gray-500')}`}>Artist *</label>
            <select value={artistId} onChange={e => setArtistId(e.target.value)} className={inputCls}>
              <option value="">— select from roster —</option>
              {artists.map(a => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={`text-xs font-semibold uppercase tracking-wide block mb-1 ${dk('text-gray-400', 'text-gray-500')}`}>Date *</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} className={inputCls} />
          </div>
        </div>

        {selectedArtist && (
          <div className={`border rounded px-3 py-2 text-xs ${dk('border-amber-800 bg-amber-900/30 text-amber-300', 'border-amber-100 bg-amber-50 text-amber-800')}`}>
            <span className="font-semibold">{selectedArtist.genre}</span>
            {selectedArtist.description && (
              <span className={dk('text-amber-400', 'text-amber-700')}>
                {' · '}{selectedArtist.description.slice(0, 100)}{selectedArtist.description.length > 100 ? '…' : ''}
              </span>
            )}
          </div>
        )}

        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-5">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input type="checkbox" checked={featured} onChange={e => setFeatured(e.target.checked)} className="accent-amber-500 w-4 h-4" />
              <span className={`text-sm ${dk('text-gray-300', 'text-gray-700')}`}>
                Featured <span className={dk('text-gray-500', 'text-gray-400')}>(highlighted on homepage)</span>
              </span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input type="checkbox" checked={ticketed} onChange={e => setTicketed(e.target.checked)} className="accent-amber-500 w-4 h-4" />
              <span className={`text-sm ${dk('text-gray-300', 'text-gray-700')}`}>
                Ticketed <span className={dk('text-gray-500', 'text-gray-400')}>(shows ticket link on card)</span>
              </span>
            </label>
          </div>
          <button onClick={addShow} disabled={!artistId || !date}
            className="bg-gray-700 hover:bg-gray-600 disabled:opacity-40 text-white font-semibold px-5 py-2 rounded text-sm transition-colors">
            Add Show
          </button>
        </div>
      </div>

      {/* Upcoming shows */}
      <div className="grid gap-2">
        <p className={`text-xs font-semibold uppercase tracking-wide ${dk('text-gray-400', 'text-gray-500')}`}>
          Upcoming ({upcoming.length})
        </p>
        {upcoming.length === 0 && (
          <p className={`text-sm text-center py-4 border border-dashed rounded-lg ${dk('border-gray-700 text-gray-500', 'border-gray-200 text-gray-400')}`}>
            No upcoming shows scheduled.
          </p>
        )}
        {upcoming.map(s => (
          <div key={s.id} className={`border rounded-lg px-4 py-3 flex items-center justify-between gap-4 ${dk('border-gray-700 bg-gray-800', 'border-gray-200')}`}>
            <div className="min-w-0">
              <span className="text-xs text-amber-500 font-semibold mr-2">{formatDate(s.date)}</span>
              {s.featured && (
                <span className={`text-xs px-1.5 py-0.5 rounded font-medium mr-2 ${dk('bg-amber-900/50 text-amber-400', 'bg-amber-100 text-amber-700')}`}>Featured</span>
              )}
              <span className={`font-semibold text-sm ${dk('text-gray-100', 'text-gray-900')}`}>{s.artistName}</span>
              <span className={`text-sm ${dk('text-gray-500', 'text-gray-400')}`}> · {s.genre}</span>
            </div>
            <button onClick={() => removeShow(s.id)} className="text-xs text-red-400 hover:text-red-500 shrink-0">Remove</button>
          </div>
        ))}
      </div>

      {/* Past shows */}
      {past.length > 0 && (
        <details className={`border rounded-lg overflow-hidden ${dk('border-gray-700', 'border-gray-100')}`}>
          <summary className={`px-4 py-3 text-xs cursor-pointer select-none ${dk('bg-gray-800 text-gray-500 hover:bg-gray-700', 'bg-gray-50 text-gray-400 hover:bg-gray-100')}`}>
            Past shows ({past.length})
          </summary>
          <div className={`divide-y ${dk('divide-gray-700', 'divide-gray-100')}`}>
            {[...past].reverse().map(s => (
              <div key={s.id} className={`px-4 py-3 flex items-center justify-between gap-4 opacity-50 ${dk('bg-gray-900', '')}`}>
                <div>
                  <span className={`text-xs mr-2 ${dk('text-gray-400', 'text-gray-500')}`}>{formatDate(s.date)}</span>
                  <span className={`text-sm ${dk('text-gray-300', 'text-gray-700')}`}>{s.artistName}</span>
                  <span className={`text-sm ${dk('text-gray-500', 'text-gray-400')}`}> · {s.genre}</span>
                </div>
                <button onClick={() => removeShow(s.id)} className="text-xs text-red-400 hover:text-red-500 shrink-0">Remove</button>
              </div>
            ))}
          </div>
        </details>
      )}

      {/* Publish */}
      <div className="flex items-center gap-4 pt-2">
        <button onClick={save} disabled={status === 'saving'}
          className="bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white font-semibold px-6 py-2.5 rounded text-sm transition-colors">
          {status === 'saving' ? 'Publishing…' : 'Publish Shows'}
        </button>
        {status === 'saved' && <span className="text-green-500 text-sm">Published. Live in ~30 seconds.</span>}
        {status === 'error' && <span className="text-red-400 text-sm">{errorMsg || 'Something went wrong.'}</span>}
      </div>

    </div>
  )
}
