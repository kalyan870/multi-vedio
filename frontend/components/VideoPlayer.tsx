"use client"

import { forwardRef, useImperativeHandle, useRef } from "react"

interface Props {
  filename: string
  previewUrl?: string
  onTimeUpdate?: (t: number) => void
}

export interface VideoPlayerHandle {
  seekTo: (t: number) => void
  getCurrentTime: () => number
}

const VideoPlayer = forwardRef<VideoPlayerHandle, Props>(({ filename, previewUrl, onTimeUpdate }, ref) => {
  const videoRef = useRef<HTMLVideoElement>(null)

  useImperativeHandle(ref, () => ({
    seekTo(t: number) {
      if (videoRef.current) videoRef.current.currentTime = t
    },
    getCurrentTime() {
      return videoRef.current?.currentTime ?? 0
    },
  }))

  return (
    <div className="bg-gray-900 rounded-xl overflow-hidden ring-1 ring-white/10">
      <video
        ref={videoRef}
        controls
        className="w-full aspect-video"
        src={previewUrl}
        title={filename}
        onTimeUpdate={() => onTimeUpdate?.(videoRef.current?.currentTime ?? 0)}
      >
        Your browser does not support video playback.
      </video>
    </div>
  )
})

VideoPlayer.displayName = "VideoPlayer"
export default VideoPlayer
