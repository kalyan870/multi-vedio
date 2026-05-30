"use client"

interface TimelineItem {
  time: number
  content: string
  type: string
}

interface Props {
  items: TimelineItem[]
}

export default function Timeline({ items }: Props) {
  return (
    <div className="bg-gray-900 rounded-xl p-4">
      <h3 className="text-lg font-semibold mb-3 text-blue-300">Timeline</h3>
      <div className="space-y-2 max-h-80 overflow-y-auto">
        {items.map((item, i) => (
          <div key={i} className="flex gap-3 text-sm border-l-2 border-gray-700 pl-3 py-1">
            <span className="text-gray-400 shrink-0 w-16">{item.time.toFixed(1)}s</span>
            <span className={`${item.type === "visual" ? "text-green-300" : "text-yellow-300"} text-xs mr-1`}>
              [{item.type}]
            </span>
            <span className="text-gray-300">{item.content}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
