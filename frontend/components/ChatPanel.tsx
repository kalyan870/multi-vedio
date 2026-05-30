"use client"

import { useState } from "react"

interface Props {
  videoId: string
}

export default function ChatPanel({ videoId }: Props) {
  const [question, setQuestion] = useState("")
  const [answer, setAnswer] = useState("")
  const [loading, setLoading] = useState(false)

  const ask = async () => {
    if (!question.trim()) return
    setLoading(true)
    setAnswer("")
    try {
      const formData = new FormData()
      formData.append("video_id", videoId)
      formData.append("question", question)
      const res = await fetch("/api/qa", { method: "POST", body: formData })
      const data = await res.json()
      setAnswer(data.context || "No answer found.")
    } catch {
      setAnswer("Error processing question.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-gray-900 rounded-xl p-4">
      <h3 className="text-lg font-semibold mb-3 text-purple-300">Ask About This Video</h3>
      <div className="flex gap-2">
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && ask()}
          placeholder="Ask a question..."
          className="flex-1 bg-gray-800 text-white rounded-lg px-3 py-2 text-sm border border-gray-700 focus:border-blue-500 outline-none"
        />
        <button
          onClick={ask}
          disabled={loading}
          className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 px-4 py-2 rounded-lg text-sm font-medium"
        >
          {loading ? "..." : "Ask"}
        </button>
      </div>
      {answer && (
        <div className="mt-3 bg-gray-800 rounded-lg p-3 text-sm text-gray-300 whitespace-pre-wrap">
          {answer}
        </div>
      )}
    </div>
  )
}
