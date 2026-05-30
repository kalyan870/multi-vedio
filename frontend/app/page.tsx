"use client"

import { useState, useCallback } from "react"
import VideoUploader from "../components/VideoUploader"
import VideoPlayer from "../components/VideoPlayer"
import Timeline from "../components/Timeline"
import ChatPanel from "../components/ChatPanel"
import SummaryCard from "../components/SummaryCard"

interface VideoData {
  video_id: string
  filename: string
  duration: number
  transcript: string
  segments: { start: number; end: number; text: string }[]
  timeline: { time: number; content: string; type: string }[]
  summary: string
  frame_count: number
}

export default function Home() {
  const [videoData, setVideoData] = useState<VideoData | null>(null)
  const [loading, setLoading] = useState(false)

  const handleUploadComplete = useCallback((data: VideoData) => {
    setVideoData(data)
    setLoading(false)
  }, [])

  return (
    <main className="max-w-7xl mx-auto p-4 md:p-8">
      <header className="mb-8 text-center">
        <h1 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          MultiModel Video
        </h1>
        <p className="text-gray-400 mt-2">Multimodal Video QA & Summariser</p>
      </header>

      {!videoData && !loading && (
        <VideoUploader onUploadComplete={handleUploadComplete} onUploadStart={() => setLoading(true)} />
      )}

      {loading && (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="mt-4 text-gray-400">Processing video... This may take a few minutes.</p>
        </div>
      )}

      {videoData && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <VideoPlayer filename={videoData.filename} />
            <SummaryCard
              transcript={videoData.transcript}
              frameCount={videoData.frame_count}
              duration={videoData.duration}
            />
          </div>
          <div className="space-y-6">
            <Timeline items={videoData.timeline} />
            <ChatPanel videoId={videoData.video_id} />
          </div>
        </div>
      )}
    </main>
  )
}
