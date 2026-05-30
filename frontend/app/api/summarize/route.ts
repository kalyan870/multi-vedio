import { NextResponse } from "next/server"

export async function POST(request: Request) {
  const API_URL = process.env.API_URL || "http://localhost:8000"
  try {
    const formData = await request.formData()
    const res = await fetch(`${API_URL}/api/summarize`, {
      method: "POST",
      body: formData,
    })
    const data = await res.json()
    return NextResponse.json(data)
  } catch {
    return NextResponse.json(
      { summary: "Backend unavailable.", timeline: [] }
    )
  }
}
