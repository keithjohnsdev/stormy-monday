'use client'

import { useEffect, useRef, useState } from 'react'

interface HeroPhoto {
  name: string
  sha?: string
  downloadUrl: string | null
}

interface Props {
  password: string
  isDark: boolean
  onAuthError: () => void
}

export default function HeroPhotosTab({ password, isDark, onAuthError }: Props) {
  const [photos, setPhotos]   = useState<HeroPhoto[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [error, setError]     = useState('')
  const [removing, setRemoving] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const d = (dark: string, light: string) => (isDark ? dark : light)

  async function load() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/hero-photos', {
        headers: { 'X-Admin-Password': password },
        cache: 'no-store',
      })
      if (res.status === 401) return onAuthError()
      if (!res.ok) { setError('Could not load photos. Try again.'); return }
      const { photos } = (await res.json()) as { photos: HeroPhoto[] }
      setPhotos(photos)
    } catch {
      setError('Could not load photos. Try again.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    if (files.length === 0) return
    setUploading(true)
    setError('')

    for (const file of files) {
      try {
        const fd = new FormData()
        fd.append('file', file)
        const res = await fetch('/api/hero-photos', {
          method: 'POST',
          headers: { 'X-Admin-Password': password },
          body: fd,
        })
        if (res.status === 401) { onAuthError(); break }
        if (!res.ok) {
          const body = (await res.json().catch(() => ({}))) as { error?: string }
          setError(body.error ?? `Upload failed for ${file.name}`)
          continue
        }
        const { photo } = (await res.json()) as { photo: HeroPhoto }
        setPhotos(prev => [...prev, photo].sort((a, b) => a.name.localeCompare(b.name)))
      } catch {
        setError(`Upload failed for ${file.name}`)
      }
    }

    setUploading(false)
    if (inputRef.current) inputRef.current.value = ''
  }

  async function handleRemove(photo: HeroPhoto) {
    if (!window.confirm('Remove this photo from the hero slideshow?')) return
    setRemoving(photo.name)
    setError('')
    try {
      const res = await fetch('/api/hero-photos', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', 'X-Admin-Password': password },
        body: JSON.stringify({ name: photo.name, sha: photo.sha }),
      })
      if (res.status === 401) return onAuthError()
      if (!res.ok) { setError('Could not remove that photo. Try again.'); return }
      setPhotos(prev => prev.filter(p => p.name !== photo.name))
    } catch {
      setError('Could not remove that photo. Try again.')
    } finally {
      setRemoving(null)
    }
  }

  return (
    <div className="grid gap-5">
      <div>
        <h2 className={`text-lg font-semibold ${d('text-gray-100', 'text-gray-900')}`}>Hero Slideshow Photos</h2>
        <p className={`text-sm mt-1 ${d('text-gray-400', 'text-gray-500')}`}>
          These photos rotate in the slideshow on the landing page. Add or remove
          them here — changes go live about 30 seconds after you upload or remove.
          Photos appear in the order they were added.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 text-sm px-4 py-3 rounded">{error}</div>
      )}

      {/* Upload */}
      <div>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          onChange={handleFiles}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white font-semibold px-5 py-2.5 rounded text-sm transition-colors"
        >
          {uploading ? 'Uploading…' : '+ Add Photos'}
        </button>
        <span className={`ml-3 text-xs ${d('text-gray-500', 'text-gray-400')}`}>JPG, PNG, or WebP. You can select several at once.</span>
      </div>

      {/* Grid */}
      {loading ? (
        <p className={`text-sm py-8 text-center ${d('text-gray-500', 'text-gray-400')}`}>Loading photos…</p>
      ) : photos.length === 0 ? (
        <p className={`text-sm py-8 text-center ${d('text-gray-500', 'text-gray-400')}`}>
          No hero photos yet. Add some above. (Until then the slideshow shows fallback press photos.)
        </p>
      ) : (
        <>
          <p className={`text-xs ${d('text-gray-500', 'text-gray-400')}`}>
            {photos.length} photo{photos.length === 1 ? '' : 's'} in the slideshow
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {photos.map(photo => (
              <div
                key={photo.name}
                className={`relative aspect-[4/3] rounded-lg overflow-hidden border group ${d('border-gray-700', 'border-gray-200')}`}
              >
                {photo.downloadUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={photo.downloadUrl} alt={photo.name} className="w-full h-full object-cover" />
                ) : (
                  <div className={`w-full h-full flex items-center justify-center ${d('bg-gray-800 text-gray-600', 'bg-gray-100 text-gray-400')}`}>✦</div>
                )}
                <button
                  type="button"
                  onClick={() => handleRemove(photo)}
                  disabled={removing === photo.name}
                  className="absolute top-2 right-2 bg-black/70 hover:bg-red-600 text-white text-xs px-2.5 py-1 rounded transition-colors disabled:opacity-60"
                >
                  {removing === photo.name ? 'Removing…' : 'Remove'}
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
