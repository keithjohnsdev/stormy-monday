'use client'

import { useRef, useState } from 'react'

interface Props {
  /** Currently stored public URL, e.g. /images/artists/{id}/photo.jpg */
  value?: string
  folder: 'artists' | 'events'
  /** Entity ID used to build the stable upload path — omit only when the server derives the ID (musician portal) */
  entityId?: string
  /** Admin password — if omitted, no X-Admin-Password header is sent (musician portal uses session cookie) */
  password?: string
  /** Upload endpoint — defaults to /api/upload-image */
  uploadUrl?: string
  isDark: boolean
  onChange: (url: string) => void
}

export default function ImageUpload({ value, folder, entityId, password, uploadUrl = '/api/upload-image', isDark, onChange }: Props) {
  const [uploading,    setUploading]    = useState(false)
  const [error,        setError]        = useState('')
  const [localPreview, setLocalPreview] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const d = (dark: string, light: string) => isDark ? dark : light

  // Show local blob preview during/after upload; fall back to stored value
  const displayUrl = localPreview ?? value ?? null

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    const preview = URL.createObjectURL(file)
    setLocalPreview(preview)
    setUploading(true)
    setError('')

    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('folder', folder)
      if (entityId) fd.append('entityId', entityId)

      const headers: Record<string, string> = {}
      if (password) headers['X-Admin-Password'] = password

      const res = await fetch(uploadUrl, {
        method: 'POST',
        headers,
        body: fd,
      })

      if (!res.ok) {
        const body = await res.json().catch(() => ({})) as { error?: string }
        setError(body.error ?? 'Upload failed')
        URL.revokeObjectURL(preview)
        setLocalPreview(null)
        return
      }

      const { url } = await res.json() as { url: string }
      onChange(url)
      // Keep the blob preview — the deployed URL won't resolve until Vercel redeploys
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
      URL.revokeObjectURL(preview)
      setLocalPreview(null)
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  function handleClear() {
    if (localPreview) URL.revokeObjectURL(localPreview)
    setLocalPreview(null)
    setError('')
    onChange('')
  }

  return (
    <div className="flex items-center gap-3">
      {/* Thumbnail */}
      <div className={`w-14 h-14 rounded overflow-hidden shrink-0 border flex items-center justify-center text-lg select-none ${
        displayUrl
          ? d('border-gray-600', 'border-gray-300')
          : d('border-gray-700 text-gray-600', 'border-gray-200 text-gray-400')
      }`}>
        {displayUrl
          ? <img src={displayUrl} alt="Preview" className="w-full h-full object-cover" />
          : '✦'
        }
      </div>

      {/* Controls */}
      <div>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          onChange={handleFile}
          className="hidden"
        />
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className={`text-xs px-3 py-1.5 rounded border transition-colors disabled:opacity-50 ${
              d('border-gray-600 text-gray-400 hover:border-gray-400 hover:text-gray-200',
                'border-gray-300 text-gray-500 hover:border-gray-400 hover:text-gray-700')
            }`}
          >
            {uploading ? 'Uploading…' : displayUrl ? 'Change Photo' : 'Upload Photo'}
          </button>
          {displayUrl && !uploading && (
            <button
              type="button"
              onClick={handleClear}
              className="text-xs text-red-400 hover:text-red-500 transition-colors"
            >
              Remove
            </button>
          )}
        </div>
        {uploading && (
          <p className={`text-xs mt-1 ${d('text-gray-500', 'text-gray-400')}`}>
            Uploading…
          </p>
        )}
        {!uploading && error && (
          <p className="text-xs text-red-400 mt-1">{error}</p>
        )}
        {!uploading && !error && localPreview && (
          <p className={`text-xs mt-1 ${d('text-gray-500', 'text-gray-400')}`}>
            ✓ Uploaded · live after next deploy
          </p>
        )}
      </div>
    </div>
  )
}
