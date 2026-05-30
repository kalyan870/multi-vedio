"use client"

import { useCallback, useRef } from "react"

interface Props {
  onUploadComplete: (data: any) => void
  onUploadStart: () => void
}

export default function VideoUploader({ onUploadComplete, onUploadStart }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    onUploadStart()

    const formData = new FormData()
    formData.append("file", file)

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
      const res = await fetch(`${API_URL}/api/upload`, {
        method: "POST",
        body: formData,
      })
      const data = await res.json()
      onUploadComplete(data)
    } catch (err) {
      alert("Upload failed. Make sure the backend server is running.")
      console.error(err)
    }
  }, [onUploadComplete, onUploadStart])

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
