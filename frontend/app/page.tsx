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
  previewUrl?: string
  duration: number
  transcript: string
  segments: { start: number; end: number; text: string }[]
  timeline: { time: number; content: string; type: string }[]
  summary: string
  frame_count: number
  highlights: string[]
  keyframes: { time: number; label: string; description: string }[]
  model_status: Record<string, string>
}

export default function Home() {
  const [videoData, setVideoData] = useState<VideoData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [query, setQuery] = useState("")
  const [light, setLight] = useState(false)

  const handleUploadComplete = useCallback((data: VideoData) => {
    setVideoData(data)
    setLoading(false)
    setError("")
  }, [])

  const handleUploadError = useCallback((err: string) => {
    setError(err)
    setLoading(false)
  }, [])

  const exportSummary = useCallback(() => {
    if (!videoData) return
    const text = [
      `MultiModel Video Summary: ${videoData.filename}`,
      "",
      "Highlights:",
      ...videoData.highlights.map((item) => `- ${item}`),
      "",
      "Timeline:",
      ...videoData.timeline.map((item) => `${item.time.toFixed(1)}s [${item.type}] ${item.content}`),
      "",
      "Transcript:",
      videoData.transcript,
    ].join("\n")
    const url = URL.createObjectURL(new Blob([text], { type: "text/plain" }))
    const a = document.createElement("a")
    a.href = url
    a.download = `${videoData.filename}-summary.txt`
    a.click()
    URL.revokeObjectURL(url)
  }, [videoData])

  const searchResults = videoData
    ? [...videoData.timeline, ...videoData.keyframes.map((k) => ({ time: k.time, type: "keyframe", content: `${k.label}: ${k.description}` }))]
        .filter((item) => item.content.toLowerCase().includes(query.toLowerCase()))
        .slice(0, 8)
    : []

  return (
    <main className={`${light ? "bg-[#f4efe5] text-[#17120d]" : "bg-[#07070b] text-[#e8e2d6]"} min-h-screen transition-colors`}>
      <div className="max-w-7xl mx-auto p-4 md:p-8">
      <header className="mb-8 flex flex-col gap-4 text-center md:flex-row md:items-center md:justify-between md:text-left">
        <div>
        <h1 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          MultiModel Video
        </h1>
        <p className="text-gray-400 mt-2">Multimodal Video QA & Summariser</p>
        </div>
        <button onClick={() => setLight((value) => !value)} className="rounded-full border border-slate-600 px-4 py-2 text-sm hover:border-blue-400">
          {light ? "Dark Mode" : "Light Mode"}
        </button>
      </header>

      {!videoData && !loading && (
        <VideoUploader onUploadStart={() => setLoading(true)} onUploadComplete={handleUploadComplete} onUploadError={handleUploadError} />
      )}

      {loading && (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="mt-4 text-gray-400">Processing video...</p>
        </div>
      )}

      {error && <p className="text-red-400 text-center mt-4">{error}</p>}

      {videoData && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <VideoPlayer filename={videoData.filename} previewUrl={videoData.previewUrl} />
            <SummaryCard
              transcript={videoData.transcript}
              frameCount={videoData.frame_count}
              duration={videoData.duration}
            />
            <section className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-5">
              <div className="mb-4 flex items-center justify-between gap-3">
                <h2 className="text-xl font-semibold text-amber-300">AI Highlights</h2>
                <button onClick={exportSummary} className="rounded-lg bg-amber-400 px-3 py-2 text-sm font-semibold text-black hover:bg-amber-300">Export Summary</button>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {videoData.highlights.map((item, index) => (
                  <div key={item} className="rounded-xl bg-black/30 p-4">
                    <p className="text-xs uppercase tracking-[0.3em] text-amber-200/70">Highlight {index + 1}</p>
                    <p className="mt-2 text-sm">{item}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-2xl border border-cyan-500/20 bg-cyan-500/10 p-5">
              <h2 className="mb-4 text-xl font-semibold text-cyan-300">Keyframe Viewer</h2>
              <div className="grid gap-3 sm:grid-cols-3">
                {videoData.keyframes.map((frame) => (
                  <div key={frame.time} className="rounded-xl border border-cyan-300/20 bg-black/30 p-4">
                    <div className="mb-3 h-24 rounded-lg bg-[radial-gradient(circle_at_30%_20%,#22d3ee55,transparent_35%),linear-gradient(135deg,#111827,#0f172a)]" />
                    <p className="text-sm font-semibold text-cyan-200">{frame.time.toFixed(1)}s</p>
                    <p className="text-xs text-gray-300">{frame.description}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>
          <div className="space-y-6">
            <section className="rounded-xl bg-gray-900 p-4">
              <h3 className="mb-3 text-lg font-semibold text-emerald-300">Semantic Search</h3>
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search camera, conclusion, topic..." className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm outline-none focus:border-emerald-400" />
              {query && <div className="mt-3 space-y-2 text-sm">{searchResults.length ? searchResults.map((item) => <p key={`${item.time}-${item.content}`} className="rounded-lg bg-gray-800 p-2"><span className="text-emerald-300">{item.time.toFixed(1)}s</span> {item.content}</p>) : <p className="text-gray-400">No matching indexed moments.</p>}</div>}
            </section>
            <Timeline items={videoData.timeline} />
            <ChatPanel videoId={videoData.video_id} />
            <section className="rounded-xl bg-gray-900 p-4">
              <h3 className="mb-3 text-lg font-semibold text-blue-300">Transcript</h3>
              <div className="max-h-52 overflow-y-auto rounded-lg bg-gray-800 p-3 text-sm leading-6 text-gray-300">
                {videoData.segments.map((segment) => <p key={segment.start}><span className="text-blue-300">{segment.start.toFixed(1)}s</span> {segment.text}</p>)}
              </div>
            </section>
            <section className="rounded-xl bg-gray-900 p-4">
              <h3 className="mb-3 text-lg font-semibold text-violet-300">Model Status</h3>
              <div className="space-y-2 text-sm">
                {Object.entries(videoData.model_status).map(([name, status]) => <p key={name} className="flex justify-between rounded-lg bg-gray-800 p-2"><span className="capitalize text-gray-300">{name.replace("_", " ")}</span><span className="text-violet-300">{status}</span></p>)}
              </div>
            </section>
          </div>
        </div>
      )}
      </div>
    </main>
  )
}
