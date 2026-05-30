"use client"

interface TimelineItem {
  time: number
  content: string
  type: string
}

interface Props {
  items: TimelineItem[]
  onSeek?: (time: number) => void
  currentTime?: number
}

export default function Timeline({ items, onSeek, currentTime }: Props) {
  const activeIdx = currentTime !== undefined
    ? items.reduceRight((found, item, i) => (currentTime >= item.time ? i : found), -1)
    : -1

  return (
    <div className="bg-gray-900 rounded-xl p-4 ring-1 ring-white/10">
      <h3 className="text-lg font-semibold mb-3 text-blue-300">Timeline</h3>
      <div className="space-y-2 max-h-80 overflow-y-auto">
        {items.map((item, i) => {
          const isActive = i === activeIdx
          return (
            <div
              key={i}
              onClick={() => onSeek?.(item.time)}
              className={`flex gap-3 text-sm border-l-2 pl-3 py-1.5 rounded-r-md transition-all cursor-pointer
                ${isActive ? "border-blue-400 bg-blue-500/15" : "border-gray-700 hover:border-gray-500 hover:bg-white/5"}`}
            >
              <span className={`shrink-0 w-16 ${isActive ? "text-blue-300" : "text-gray-400"}`}>
                {item.time.toFixed(1)}s
              </span>
              <span className={`text-xs mr-1 ${item.type === "visual" ? "text-green-300" : "text-yellow-300"}`}>
                [{item.type}]
              </span>
              <span className="text-gray-300">{item.content}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
