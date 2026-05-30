"use client"

import { useCallback, useRef } from "react"

interface Props {
  onUploadStart: () => void
  onUploadComplete: (data: any) => void
  onUploadError: (err: string) => void
}

export default function VideoUploader({ onUploadStart, onUploadComplete, onUploadError }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const formData = new FormData()
    formData.append("file", file)

    try {
      onUploadStart()
      const res = await fetch("/api/upload", { method: "POST", body: formData })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "Upload failed")
      }
      const data = await res.json()
      onUploadComplete({ ...data, previewUrl: URL.createObjectURL(file) })
    } catch (err: any) {
      onUploadError(err.message || "Upload failed. Please try again.")
    }
  }, [onUploadStart, onUploadComplete, onUploadError])

  return (
    <div className="border-2 border-dashed border-gray-600 rounded-2xl p-12 text-center hover:border-blue-500 transition cursor-pointer"
      onClick={() => inputRef.current?.click()}
    >
      <input ref={inputRef} type="file" accept="video/*" className="hidden" onChange={handleUpload} />
      <div className="text-6xl mb-4">🎥</div>
      <p className="text-xl font-medium text-gray-300">Click to upload a video</p>
      <p className="text-sm text-gray-500 mt-2">MP4, MOV, MKV supported</p>
    </div>
  )
}
