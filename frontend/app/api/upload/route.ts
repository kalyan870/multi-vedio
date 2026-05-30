import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    const videoId = Math.random().toString(36).substring(2, 10)

    const duration = Math.max(72, Math.min(480, Math.round(file.size / 42000)))
    const transcript = "Welcome to this video. The speaker introduces the main topic, compares important points, explains supporting examples, and ends with a clear set of takeaways. The system indexes transcript segments, visual moments, and semantic topics so the viewer can search and ask questions without watching the full video."
    const segments = [
      { start: 0, end: 12, text: "Opening context and topic introduction." },
      { start: 12, end: 34, text: "Key comparison points and supporting evidence are discussed." },
      { start: 34, end: 58, text: "Important visual examples and transitions appear on screen." },
      { start: 58, end: 82, text: "Practical implications and recommendations are explained." },
      { start: 82, end: 110, text: "Final summary and conclusion with takeaways." },
    ]
    const frameCount = Math.floor(duration / 2)
    const timeline = []
    for (let i = 0; i < Math.min(segments.length, 5); i++) {
      timeline.push({ time: segments[i].start, content: segments[i].text, type: "transcript" })
      timeline.push({ time: segments[i].start + 1, content: `Visual scene change detected at ${segments[i].start.toFixed(1)}s`, type: "visual" })
    }
    timeline.sort((a, b) => a.time - b.time)
    const highlights = [
      "Topic introduction and framing",
      "Main comparison or evidence section",
      "Most useful practical takeaway",
      "Final verdict / conclusion",
    ]
    const keyframes = [0, 15, 35, 60, 90].filter((time) => time < duration).map((time, index) => ({
      time,
      label: `Keyframe ${index + 1}`,
      description: index === 0 ? "Opening scene" : index === 1 ? "Core topic appears" : index === 2 ? "Visual evidence section" : index === 3 ? "Recommendation moment" : "Closing section",
    }))

    return NextResponse.json({
      video_id: videoId,
      filename: file.name,
      duration,
      metadata: { fps: 30, frame_count: Math.floor(duration * 30), width: 1920, height: 1080 },
      frame_count: frameCount,
      transcript,
      segments,
      timeline,
      highlights,
      keyframes,
      confidence: { summary: 94, transcript: 91, timeline: 88, qa: 92, retrieval: 89 },
      model_status: {
        ffmpeg: "Vercel demo mode",
        whisper: "Simulated transcript",
        vector_db: "In-memory semantic index",
        multimodal: "Timeline QA demo",
      },
      summary: timeline.map(t => `[${t.time.toFixed(1)}s] (${t.type}): ${t.content}`).join("\n"),
    })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json({ error: "Upload failed inside the Vercel API route." }, { status: 500 })
  }
}
