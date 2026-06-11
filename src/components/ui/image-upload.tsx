'use client'

import { useRef, useState } from 'react'
import { toast } from 'sonner'
import { ImageIcon, X } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

const ACCEPTED = ['image/jpeg', 'image/png', 'image/webp']
const MAX_BYTES = 5 * 1024 * 1024

interface ImageUploadProps {
  /** Existing URL to display (e.g. when editing) */
  existingUrl?: string
  onChange: (file: File | null) => void
  className?: string
}

export function ImageUpload({ existingUrl, onChange, className }: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(existingUrl ?? null)
  const inputRef = useRef<HTMLInputElement>(null)

  function handleFile(file: File) {
    if (!ACCEPTED.includes(file.type)) {
      toast.error('Only JPEG, PNG, or WebP images are allowed')
      return
    }
    if (file.size > MAX_BYTES) {
      toast.error('Image must be under 5 MB')
      return
    }
    const url = URL.createObjectURL(file)
    setPreview(url)
    onChange(file)
  }

  function clear(e: React.MouseEvent) {
    e.stopPropagation()
    setPreview(null)
    onChange(null)
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div className={cn('space-y-2', className)}>
      <div
        onClick={() => inputRef.current?.click()}
        className={cn(
          'relative flex items-center justify-center rounded-2xl border-2 border-dashed border-border bg-muted/40 overflow-hidden cursor-pointer transition-colors hover:border-primary/50',
          preview ? 'h-40' : 'h-32',
        )}
      >
        {preview ? (
          <>
            <img src={preview} alt="Preview" className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/20" />
            <button
              type="button"
              onClick={clear}
              className="absolute top-2 right-2 z-10 rounded-full bg-black/60 p-1 text-white hover:bg-black/80"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </>
        ) : (
          <div className="flex flex-col items-center gap-1 text-muted-foreground">
            <ImageIcon className="w-6 h-6" />
            <span className="text-xs">Click to choose image</span>
            <span className="text-xs opacity-60">JPEG · PNG · WebP · max 5 MB</span>
          </div>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED.join(',')}
        className="hidden"
        onChange={e => {
          const file = e.target.files?.[0]
          if (file) handleFile(file)
          e.target.value = ''
        }}
      />
    </div>
  )
}
