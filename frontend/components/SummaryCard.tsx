"use client"

interface Props {
  transcript: string
  frameCount: number
  duration: number
  confidence?: Record<string, number>
}

export default function SummaryCard({ transcript, frameCount, duration, confidence }: Props) {
  return (
    <div className="bg-gray-900 rounded-xl p-4">
      <h3 className="text-lg font-semibold mb-3 text-green-300">Video Summary</h3>
      <div className="grid grid-cols-3 gap-4 mb-4 text-center text-sm">
        <div className="bg-gray-800 rounded-lg p-2">
          <p className="text-2xl font-bold text-blue-400">{duration.toFixed(1)}s</p>
          <p className="text-gray-400">Duration</p>
        </div>
        <div className="bg-gray-800 rounded-lg p-2">
          <p className="text-2xl font-bold text-green-400">{frameCount}</p>
          <p className="text-gray-400">Frames</p>
        </div>
        <div className="bg-gray-800 rounded-lg p-2">
          <p className="text-2xl font-bold text-purple-400">{transcript.split(" ").length}</p>
          <p className="text-gray-400">Words</p>
        </div>
      </div>
      {confidence && (
        <div className="mb-3 flex gap-3 text-center text-xs">
          {Object.entries(confidence).map(([key, val]) => (
            <div key={key} className="flex-1 rounded-lg bg-gray-800 p-2">
              <p className="text-gray-400 capitalize">{key}</p>
              <p className="text-lg font-bold text-green-200">{val}%</p>
            </div>
          ))}
        </div>
      )}
      <div className="bg-gray-800 rounded-lg p-3 text-sm text-gray-300 max-h-40 overflow-y-auto">
        {transcript || "No transcript available."}
      </div>
    </div>
  )
}
