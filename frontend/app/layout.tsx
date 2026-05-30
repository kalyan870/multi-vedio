import "./globals.css"

export const metadata = {
  title: "MultiModel Video",
  description: "Multimodal Video QA & Summariser",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen">{children}</body>
    </html>
  )
}
