"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import VideoUploader from "../components/VideoUploader"
import VideoPlayer, { type VideoPlayerHandle } from "../components/VideoPlayer"
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
  confidence: Record<string, number>
  model_status: Record<string, string>
}

const PIPELINE_STEPS = [
  "Uploading video",
  "Extracting audio track",
  "Transcribing speech",
  "Generating scene embeddings",
  "Indexing vector database",
  "Preparing summary & QA",
]

export default function Home() {
  const [videoData, setVideoData] = useState<VideoData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [query, setQuery] = useState("")
  const [light, setLight] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [pipelineStep, setPipelineStep] = useState(0)
  const [showArch, setShowArch] = useState(false)
  const videoRef = useRef<VideoPlayerHandle>(null)

  useEffect(() => {
    if (!loading) { setPipelineStep(0); return }
    const timer = setInterval(() => {
      setPipelineStep((p) => (p < PIPELINE_STEPS.length - 1 ? p + 1 : p))
    }, 1800)
    return () => clearInterval(timer)
  }, [loading])

  const handleUploadComplete = useCallback((data: VideoData) => {
    setVideoData(data)
    setLoading(false)
    setError("")
  }, [])

  const handleUploadError = useCallback((err: string) => {
    setError(err)
    setLoading(false)
  }, [])

  const seekTo = useCallback((t: number) => {
    videoRef.current?.seekTo(t)
  }, [])

  const exportFn = useCallback((label: string, content: string) => {
    const url = URL.createObjectURL(new Blob([content], { type: "text/plain" }))
    const a = document.createElement("a"); a.href = url; a.download = `${videoData?.filename ?? "video"}-${label}.txt`
    a.click(); URL.revokeObjectURL(url)
  }, [videoData])

  const exportSummary = useCallback(() => {
    if (!videoData) return
    const text = [
      `MultiModel Video — ${videoData.filename}`,
      "", "=== HIGHLIGHTS ===", ...videoData.highlights.map((h) => `• ${h}`),
      "", "=== TIMELINE ===", ...videoData.timeline.map((t) => `${t.time.toFixed(1)}s [${t.type}] ${t.content}`),
      "", "=== TRANSCRIPT ===", videoData.transcript,
      "", `Confidence — summary ${videoData.confidence.summary}% · transcript ${videoData.confidence.transcript}% · timeline ${videoData.confidence.timeline}%`,
    ].join("\n")
    exportFn("summary", text)
  }, [videoData, exportFn])

  const searchResults = videoData
    ? [...videoData.timeline, ...videoData.keyframes.map((k) => ({ time: k.time, type: "keyframe", content: `${k.label}: ${k.description}` }))]
        .filter((item) => item.content.toLowerCase().includes(query.toLowerCase()))
        .slice(0, 8)
    : []

  const activeSegmentIdx = videoData?.segments.findLastIndex((s) => currentTime >= s.start) ?? -1

  const keyframeColors = [
    "from-rose-500/40 to-amber-500/40",
    "from-sky-500/40 to-indigo-500/40",
    "from-emerald-500/40 to-teal-500/40",
    "from-violet-500/40 to-fuchsia-500/40",
    "from-orange-500/40 to-red-500/40",
  ]

  const statusColor = (status: string) => {
    if (status.toLowerCase().includes("run") || status.toLowerCase().includes("load") || status.toLowerCase().includes("ready") || status.toLowerCase().includes("active") || status.toLowerCase().includes("connect")) return "bg-green-400"
    if (status.toLowerCase().includes("demo") || status.toLowerCase().includes("simul")) return "bg-yellow-400"
    return "bg-red-400"
  }

  return (
    <main className={`${light ? "bg-[#f4efe5] text-[#17120d]" : "bg-[#07070b] text-[#e8e2d6]"} min-h-screen transition-colors`}>
      <div className="max-w-7xl mx-auto p-4 md:p-8">
      <header className="mb-8 flex flex-col gap-4 text-center md:flex-row md:items-center md:justify-between md:text-left">
        <div>
        <h1 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          Multi Video
        </h1>
        <p className="text-gray-400 mt-2">Multimodal Video QA & Summariser</p>
        </div>
        <button onClick={() => setLight((v) => !v)} className="rounded-full border border-slate-600 px-4 py-2 text-sm hover:border-blue-400">
          {light ? "Dark Mode" : "Light Mode"}
        </button>
      </header>

      {!videoData && !loading && (
        <VideoUploader onUploadStart={() => setLoading(true)} onUploadComplete={handleUploadComplete} onUploadError={handleUploadError} />
      )}

      {loading && (
        <div className="mx-auto max-w-lg py-20">
          <h2 className="text-center text-xl font-semibold text-blue-300 mb-8">Processing Pipeline</h2>
          <div className="space-y-4">
            {PIPELINE_STEPS.map((step, i) => {
              const done = i < pipelineStep
              const active = i === pipelineStep
              return (
                <div key={step} className={`flex items-center gap-4 rounded-xl p-4 transition-all ${active ? "bg-blue-500/15 ring-1 ring-blue-400/30 scale-[1.02]" : done ? "bg-green-500/10" : "bg-white/5 opacity-40"}`}>
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${done ? "bg-green-400 text-black" : active ? "bg-blue-400 text-black" : "bg-gray-700 text-gray-400"}`}>
                    {done ? "✓" : active ? "●" : i + 1}
                  </div>
                  <div className="flex-1">
                    <p className={`text-sm font-medium ${done ? "text-green-300" : active ? "text-blue-200" : "text-gray-500"}`}>{step}</p>
                    {active && <div className="mt-1.5 h-1 w-full rounded-full bg-gray-700 overflow-hidden"><div className="h-full w-full bg-blue-400 rounded-full animate-[pulse_1.2s_ease-in-out_infinite]" /></div>}
                  </div>
                  {done && <span className="text-xs text-green-400/70">done</span>}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {error && <p className="text-red-400 text-center mt-4">{error}</p>}

      {videoData && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <VideoPlayer ref={videoRef} filename={videoData.filename} previewUrl={videoData.previewUrl} onTimeUpdate={setCurrentTime} />
            <SummaryCard
              transcript={videoData.transcript}
              frameCount={videoData.frame_count}
              duration={videoData.duration}
              confidence={videoData.confidence}
            />

            <section className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-5">
              <div className="mb-4 flex items-center justify-between gap-3">
                <h2 className="text-xl font-semibold text-amber-300">AI Highlights</h2>
                <div className="flex gap-2">
                  <button onClick={exportSummary} className="rounded-lg bg-amber-400 px-3 py-2 text-sm font-semibold text-black hover:bg-amber-300">Export Summary</button>
                  <button onClick={() => exportFn("transcript", videoData.transcript)} className="rounded-lg border border-amber-400/30 px-3 py-2 text-sm text-amber-200 hover:bg-amber-400/10">Transcript</button>
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {videoData.highlights.map((item, i) => (
                  <div key={item} className="rounded-xl bg-black/30 p-4">
                    <p className="text-xs uppercase tracking-[0.3em] text-amber-200/70">Highlight {i + 1}</p>
                    <p className="mt-2 text-sm">{item}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-2xl border border-cyan-500/20 bg-cyan-500/10 p-5">
              <h2 className="mb-4 text-xl font-semibold text-cyan-300">Keyframe Viewer</h2>
              <div className="grid gap-3 sm:grid-cols-3">
                {videoData.keyframes.map((frame, i) => (
                  <div key={frame.time} onClick={() => seekTo(frame.time)}
                    className="rounded-xl border border-cyan-300/20 bg-black/30 p-4 cursor-pointer hover:border-cyan-300/50 transition"
                  >
                    <div className={`mb-3 h-24 rounded-lg bg-gradient-to-br ${keyframeColors[i % keyframeColors.length]} flex items-center justify-center`}>
                      <span className="text-2xl font-bold text-white/40">{frame.time.toFixed(0)}s</span>
                    </div>
                    <p className="text-sm font-semibold text-cyan-200">{frame.label}</p>
                    <p className="text-xs text-gray-300">{frame.description}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <button onClick={() => setShowArch((v) => !v)} className="flex w-full items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-300">AI Architecture</h2>
                <span className="text-gray-500 text-sm">{showArch ? "▲" : "▼"}</span>
              </button>
              {showArch && (
                <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
                  {["Video Upload", "FFmpeg", "Whisper STT", "Embeddings", "LanceDB", "vLLM / QA", "UI Dashboard"].map((label, i) => (
                    <div key={label} className="flex items-center gap-2">
                      <span className="rounded-lg bg-blue-500/20 px-3 py-2 text-blue-200 ring-1 ring-blue-400/20">{label}</span>
                      {i < 6 && <span className="text-gray-600">→</span>}
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>

          <div className="space-y-6">
            <section className="rounded-xl bg-gray-900 p-4 ring-1 ring-white/10">
              <h3 className="mb-3 text-lg font-semibold text-emerald-300">Semantic Search</h3>
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search camera, conclusion, topic..." className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm outline-none focus:border-emerald-400" />
              {query && <div className="mt-3 space-y-2 text-sm">{(searchResults.length ? searchResults : []).map((item) => <p key={`${item.time}-${item.content}`} className="rounded-lg bg-gray-800 p-2 cursor-pointer hover:bg-gray-700" onClick={() => seekTo(item.time)}><span className="text-emerald-300">{item.time.toFixed(1)}s</span> {item.content}</p>)}</div>}
            </section>

            <Timeline items={videoData.timeline} onSeek={seekTo} currentTime={currentTime} />
            <ChatPanel videoId={videoData.video_id} />

            <section className="rounded-xl bg-gray-900 p-4 ring-1 ring-white/10">
              <h3 className="mb-3 text-lg font-semibold text-blue-300">Transcript</h3>
              <div className="max-h-52 overflow-y-auto rounded-lg bg-gray-800 p-3 text-sm leading-6">
                {videoData.segments.map((seg, i) => (
                  <p key={seg.start} onClick={() => seekTo(seg.start)}
                    className={`cursor-pointer rounded px-1 transition ${i === activeSegmentIdx ? "bg-blue-500/20 text-blue-200" : "text-gray-300 hover:bg-white/5"}`}
                  >
                    <span className="text-blue-300">{seg.start.toFixed(1)}s</span> {seg.text}
                  </p>
                ))}
              </div>
            </section>

            <section className="rounded-xl bg-gray-900 p-4 ring-1 ring-white/10">
              <h3 className="mb-3 text-lg font-semibold text-violet-300">Model Status</h3>
              <div className="space-y-2 text-sm">
                {Object.entries(videoData.model_status).map(([name, status]) => (
                  <div key={name} className="flex items-center justify-between rounded-lg bg-gray-800 p-2.5">
                    <span className="capitalize text-gray-300">{name.replace("_", " ")}</span>
                    <span className="flex items-center gap-1.5 text-violet-300">
                      <span className={`inline-block h-2 w-2 rounded-full ${statusColor(status)}`} />
                      {status}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 text-center text-xs">
                {Object.entries(videoData.confidence).map(([key, val]) => (
                  <div key={key} className="rounded-lg bg-gray-800 p-2">
                    <p className="text-gray-400 capitalize">{key}</p>
                    <p className="text-lg font-bold text-violet-200">{val}%</p>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      )}
      </div>
    </main>
  )
}
