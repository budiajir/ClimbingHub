'use client'

import { useState, useRef } from 'react'
import {
  Upload,
  Camera,
  Link as LinkIcon,
  Trash2,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Image as ImageIcon,
  RefreshCw,
} from 'lucide-react'
import { uploadMediaToCloudinary } from '@/lib/upload-client'
import { useTheme } from '@/lib/theme-context'

export interface ImageUploadFieldProps {
  label?: string
  value: string
  onChange: (url: string) => void
  folder?: string
  placeholder?: string
  helperText?: string
  required?: boolean
  className?: string
  darkMode?: boolean
}

export default function ImageUploadField({
  label = 'Foto Tebing / Gambar',
  value,
  onChange,
  folder = 'jalur/crags',
  placeholder = 'https://images.unsplash.com/...',
  helperText = 'Pilih foto langsung dari galeri HP atau folder laptop (JPG, PNG, WEBP maks. 10MB).',
  required = false,
  className = '',
  darkMode = true,
}: ImageUploadFieldProps) {
  const { theme } = useTheme()
  const isDark = darkMode || theme !== 'sandstone'

  const fileInputRef = useRef<HTMLInputElement>(null)
  const [mode, setMode] = useState<'upload' | 'url'>('upload')
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  const processFile = async (file: File) => {
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setUploadError('File harus berupa gambar (JPG, PNG, WEBP, atau format foto lainnya).')
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      setUploadError('Ukuran foto maksimal 10MB.')
      return
    }

    setUploadError(null)
    setIsUploading(true)

    try {
      // 1. Upload ke Cloudinary
      const uploaded = await uploadMediaToCloudinary(file, folder)
      onChange(uploaded.secureUrl)
    } catch (err) {
      console.warn('Cloudinary upload warning, falling back to local preview:', err)
      // 2. Graceful fallback: FileReader Data URL jika offline atau gagal koneksi
      try {
        const reader = new FileReader()
        reader.onload = () => {
          if (typeof reader.result === 'string') {
            onChange(reader.result)
          }
        }
        reader.readAsDataURL(file)
      } catch (fallbackErr) {
        setUploadError(
          err instanceof Error
            ? err.message
            : 'Gagal mengunggah foto. Periksa koneksi internet.'
        )
      }
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) processFile(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) processFile(file)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Label & Mode Switcher */}
      <div className="flex items-center justify-between">
        <label className="text-white/80 block text-xs font-semibold">
          {label} {required && <span className="text-orange-500">*</span>}
        </label>
        <div className="flex items-center gap-1 text-[11px]">
          <button
            type="button"
            onClick={() => setMode('upload')}
            className={`px-2 py-0.5 rounded-lg transition-colors flex items-center gap-1 font-medium ${
              mode === 'upload'
                ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                : 'text-white/50 hover:text-white'
            }`}
          >
            <Camera size={11} />
            <span>File / Galeri</span>
          </button>
          <button
            type="button"
            onClick={() => setMode('url')}
            className={`px-2 py-0.5 rounded-lg transition-colors flex items-center gap-1 font-medium ${
              mode === 'url'
                ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                : 'text-white/50 hover:text-white'
            }`}
          >
            <LinkIcon size={11} />
            <span>Link URL</span>
          </button>
        </div>
      </div>

      {/* Hidden File Input (Mendukung Kamera / Galeri HP & File Laptop) */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Error alert */}
      {uploadError && (
        <div className="rounded-xl bg-red-500/10 border border-red-500/30 px-3 py-2 flex items-start gap-2 text-xs text-red-400">
          <AlertCircle size={14} className="shrink-0 mt-0.5" />
          <span>{uploadError}</span>
        </div>
      )}

      {/* Main Upload / Preview Area */}
      {value ? (
        /* Image Preview Box */
        <div className="relative rounded-2xl overflow-hidden border border-white/15 bg-black/50 group">
          <img
            src={value}
            alt="Preview Foto Tebing"
            className="w-full h-44 sm:h-52 object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            onError={(e) => {
              // Jika gambar error, tetap render preview fallback
              e.currentTarget.src =
                'https://images.unsplash.com/photo-1522163182402-834f871fd851?w=800&q=80'
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end justify-between p-3">
            <div className="flex items-center gap-1.5 text-xs text-white/90 truncate max-w-[65%]">
              <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
              <span className="truncate text-[11px] font-medium">Foto siap digunakan</span>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={isUploading}
                onClick={() => fileInputRef.current?.click()}
                className="px-2.5 py-1.5 rounded-xl bg-black/70 hover:bg-black text-white text-[11px] font-bold border border-white/20 backdrop-blur-md transition-all flex items-center gap-1 disabled:opacity-60"
              >
                {isUploading ? (
                  <Loader2 size={12} className="animate-spin text-orange-400" />
                ) : (
                  <RefreshCw size={12} />
                )}
                <span>Ganti Foto</span>
              </button>
              <button
                type="button"
                onClick={() => onChange('')}
                className="p-1.5 rounded-xl bg-red-500/80 hover:bg-red-600 text-white text-xs border border-white/20 backdrop-blur-md transition-colors"
                title="Hapus Foto"
              >
                <Trash2 size={13} />
              </button>
            </div>
          </div>
        </div>
      ) : mode === 'upload' ? (
        /* Dropzone / Click to Upload Box */
        <div
          onClick={() => !isUploading && fileInputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`w-full py-7 px-4 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-2.5 cursor-pointer transition-all select-none ${
            isDragging
              ? 'border-orange-500 bg-orange-500/10 scale-[0.99]'
              : 'border-white/20 hover:border-orange-500/60 bg-black/30 hover:bg-black/50'
          }`}
        >
          <div className="w-12 h-12 rounded-2xl bg-orange-500/15 border border-orange-500/30 text-orange-400 flex items-center justify-center shadow-lg">
            {isUploading ? (
              <Loader2 size={22} className="animate-spin text-orange-500" />
            ) : (
              <Upload size={22} />
            )}
          </div>
          <div className="text-center space-y-0.5">
            <p className="font-bold text-xs text-white">
              {isUploading
                ? 'Mengunggah foto ke server...'
                : 'Pilih dari File Laptop atau Galeri HP'}
            </p>
            <p className="text-[11px] text-white/50 max-w-xs">
              Klik di sini untuk buka galeri / file explorer, atau drag & drop foto ke sini
            </p>
          </div>
        </div>
      ) : (
        /* URL Input Box */
        <div className="space-y-1.5">
          <div className="relative flex items-center">
            <input
              type="url"
              placeholder={placeholder}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className="w-full p-2.5 pr-20 rounded-xl bg-black/40 border border-white/15 text-white text-xs outline-none focus:border-orange-500"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute right-1.5 px-2 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[11px] font-medium flex items-center gap-1 transition-colors"
            >
              <Upload size={11} />
              <span>File</span>
            </button>
          </div>
          <p className="text-[10px] text-white/50">
            Paste URL gambar dari Unsplash, Cloudinary, atau web.
          </p>
        </div>
      )}

      {/* Helper info text below */}
      {!value && mode === 'upload' && (
        <p className="text-[10px] text-white/50 leading-relaxed">
          {helperText}
        </p>
      )}
    </div>
  )
}
