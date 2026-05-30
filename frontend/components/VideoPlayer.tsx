"use client"

interface Props {
  filename: string
}

export default function VideoPlayer({ filename }: Props) {
  return (
    <div className="bg-gray-900 rounded-xl overflow-hidden">
      <video controls className="w-full aspect-video" src={`/uploads/${filename}`}>
        Your browser does not support video playback.
      </video>
    </div>
  )
}
