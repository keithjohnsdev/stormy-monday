'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'

type Phase = 'checking' | 'invalid' | 'form' | 'submitting' | 'done'

const inputCls =
  'w-full bg-storm-dark border border-storm-border text-storm-cream px-4 py-3 text-sm focus:outline-none focus:border-storm-gold transition-colors placeholder:text-storm-muted'
const labelCls = 'block text-xs tracking-widest uppercase text-storm-muted mb-2'

export default function ArtistSignupClient() {
  const params = useSearchParams()
  const token = params.get('token') ?? ''

  const [phase, setPhase] = useState<Phase>('checking')
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [login, setLogin] = useState<{ email: string; password: string } | null>(null)

  const [name, setName] = useState('')
  const [genre, setGenre] = useState('')
  const [description, setDescription] = useState('')
  const [website, setWebsite] = useState('')
  const [file, setFile] = useState<File | null>(null)

  // Validate the invite token up front
  useEffect(() => {
    if (!token) { setPhase('invalid'); setError('This invite link is missing its token.'); return }
    fetch(`/api/artist-signup?token=${encodeURIComponent(token)}`)
      .then(async res => {
        const data = await res.json().catch(() => ({}))
        if (res.ok) { setEmail(data.email); setPhase('form') }
        else { setError(data.error || 'This invite link is invalid or has expired.'); setPhase('invalid') }
      })
      .catch(() => { setError('Could not verify this link. Try again.'); setPhase('invalid') })
  }, [token])

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    setPhase('submitting')
    setError('')

    const fd = new FormData()
    fd.set('token', token)
    fd.set('name', name)
    fd.set('genre', genre)
    fd.set('description', description)
    fd.set('website', website)
    if (file) fd.set('file', file)

    try {
      const res = await fetch('/api/artist-signup', { method: 'POST', body: fd })
      const data = await res.json().catch(() => ({}))
      if (res.ok) { setLogin(data.login); setPhase('done') }
      else { setError(data.error || 'Something went wrong. Try again.'); setPhase('form') }
    } catch {
      setError('Something went wrong. Try again.'); setPhase('form')
    }
  }

  return (
    <div className="pt-16 min-h-screen">
      <section className="max-w-2xl mx-auto px-6 py-20">
        <p className="text-xs tracking-[0.3em] uppercase text-storm-gold mb-3">Stormy Monday</p>
        <h1 className="font-display text-4xl text-storm-cream">Artist Sign-Up</h1>

        {phase === 'checking' && (
          <p className="mt-8 text-storm-muted text-sm">Verifying your invite…</p>
        )}

        {phase === 'invalid' && (
          <p className="mt-8 text-red-400 text-sm">{error}</p>
        )}

        {(phase === 'form' || phase === 'submitting') && (
          <>
            <p className="mt-4 text-storm-muted leading-relaxed text-sm">
              Fill out your artist profile below. It’ll be added to the Stormy Monday
              roster once you submit. You’re signing up as <span className="text-storm-cream">{email}</span>.
            </p>

            <form onSubmit={submit} className="mt-10 space-y-5">
              <div>
                <label className={labelCls}>Artist / Band Name *</label>
                <input className={inputCls} value={name} onChange={e => setName(e.target.value)}
                  placeholder="Your stage name" required />
              </div>
              <div>
                <label className={labelCls}>Genre</label>
                <input className={inputCls} value={genre} onChange={e => setGenre(e.target.value)}
                  placeholder="e.g. Soul, Jazz, Indie Folk" />
              </div>
              <div>
                <label className={labelCls}>Bio / Description</label>
                <textarea className={`${inputCls} resize-y`} rows={5} value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="A short bio shown alongside your shows" />
              </div>
              <div>
                <label className={labelCls}>Website or Social Link</label>
                <input className={inputCls} value={website} onChange={e => setWebsite(e.target.value)}
                  placeholder="https://..." />
              </div>
              <div>
                <label className={labelCls}>Photo (optional)</label>
                <input type="file" accept="image/jpeg,image/png,image/webp"
                  onChange={e => setFile(e.target.files?.[0] ?? null)}
                  className="block w-full text-sm text-storm-muted file:mr-4 file:py-2 file:px-4 file:border-0 file:text-sm file:font-semibold file:bg-storm-gold file:text-storm-black hover:file:bg-storm-gold-light file:cursor-pointer" />
              </div>

              {error && <p className="text-red-400 text-sm">{error}</p>}

              <button type="submit" disabled={phase === 'submitting' || !name.trim()}
                className="btn-primary disabled:opacity-50">
                {phase === 'submitting' ? 'Submitting…' : 'Submit Profile'}
              </button>
            </form>
          </>
        )}

        {phase === 'done' && (
          <div className="mt-8">
            <p className="text-storm-cream text-lg">You’re on the roster. 🎶</p>
            <p className="mt-3 text-storm-muted text-sm leading-relaxed">
              Your profile will appear on the site within about a minute. Save these
              credentials — you can use them to log in at{' '}
              <span className="text-storm-cream">/musicians</span> to update your profile
              or book shows:
            </p>
            {login && (
              <div className="mt-5 bg-storm-card border border-storm-border p-5 text-sm">
                <p className="text-storm-muted">Login</p>
                <p className="text-storm-cream font-mono mt-1">{login.email}</p>
                <p className="text-storm-muted mt-3">Password</p>
                <p className="text-storm-cream font-mono mt-1">{login.password}</p>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  )
}
