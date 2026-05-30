"use client"

interface Props {
  filename: string
  previewUrl?: string
}

export default function VideoPlayer({ filename, previewUrl }: Props) {
  return (
    <div className="bg-gray-900 rounded-xl overflow-hidden">
      <video controls className="w-full aspect-video" src={previewUrl} title={filename}>
        Your browser does not support video playback.
      </video>
    </div>
  )
}
