"use client"

interface Props {
  filename: string
}

export default function VideoPlayer({ filename }: Props) {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
  const videoUrl = `${API_URL}/uploads/${filename}`

  return (
    <div className="bg-gray-900 rounded-xl overflow-hidden">
      <video controls className="w-full aspect-video" src={videoUrl}>
        Your browser does not support video playback.
      </video>
    </div>
  )
}
