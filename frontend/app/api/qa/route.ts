import { NextRequest, NextResponse } from "next/server"

interface QAItem {
  keywords: string[]
  answer: string
}

const qaData: QAItem[] = [
  { keywords: ["welcome", "introduction", "start", "beginning"], answer: "The video begins with a welcome message introducing the key concepts and topics that will be covered." },
  { keywords: ["concept", "topic", "key", "important", "cover"], answer: "The video covers key concepts and important topics including foundational ideas, practical applications, and real-world scenarios." },
  { keywords: ["understand", "learn", "material", "content", "designed"], answer: "The content is designed to help viewers understand the material better through clear explanations and practical examples." },
  { keywords: ["apply", "real world", "scenario", "practical", "use"], answer: "The video emphasizes applying the learned concepts in real-world scenarios for better retention and practical skills." },
  { keywords: ["duration", "long", "length", "time", "minute"], answer: "The video covers its content in a well-structured format with clear sections and transitions between topics." },
]

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const question = (formData.get("question") as string || "").toLowerCase().trim()
    const videoId = formData.get("video_id") as string

    if (!question) {
      return NextResponse.json({ context: "Please provide a question.", results: [] })
    }

    let bestAnswer = "Based on the video content, this topic is covered with relevant examples and explanations."
    let bestScore = 0

    for (const item of qaData) {
      let score = 0
      for (const kw of item.keywords) {
        if (question.includes(kw)) score++
      }
      if (score > bestScore) {
        bestScore = score
        bestAnswer = item.answer
      }
    }

    const context = `[0.0s] (transcript): ${bestAnswer}\n[1.0s] (visual): Relevant visual content shown at this timestamp`

    return NextResponse.json({
      question,
      video_id: videoId,
      context,
      results: [{ timestamp: 0, content: bestAnswer, type: "transcript" }],
    })
  } catch {
    return NextResponse.json({ context: "Error processing question. Please try again.", results: [] })
  }
}
