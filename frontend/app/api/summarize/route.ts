import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const videoId = formData.get("video_id") as string

    const timeline = [
      { time: 0, content: "Video introduction and welcome", type: "transcript" },
      { time: 1, content: "Opening scene with title graphics", type: "visual" },
      { time: 5, content: "Overview of key concepts begins", type: "transcript" },
      { time: 6, content: "Concept diagram displayed on screen", type: "visual" },
      { time: 15, content: "Deep dive into important topics", type: "transcript" },
      { time: 16, content: "Scene transition to detailed explanation", type: "visual" },
      { time: 25, content: "Real-world applications discussed", type: "transcript" },
      { time: 26, content: "Example scenarios shown visually", type: "visual" },
      { time: 35, content: "Summary and key takeaways", type: "transcript" },
    ]

    return NextResponse.json({
      video_id: videoId,
      summary: timeline.map(t => `[${t.time.toFixed(1)}s] (${t.type}): ${t.content}`).join("\n"),
      timeline,
    })
  } catch {
    return NextResponse.json({ summary: "Summary unavailable.", timeline: [] })
  }
}
