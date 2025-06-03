import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'AI Visibility Checker',
  description: 'AI Visibility hecker'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
