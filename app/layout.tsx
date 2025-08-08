import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider as NextThemesProvider, ThemeProvider } from "next-themes"

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'نظام الإشعارات',
  description: 'نظام إدارة الإشعارات',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ar" dir="rtl">
      <body className={inter.className}>
        <NextThemesProvider defaultTheme='light'>{children}</NextThemesProvider></body>
    </html>
  )
}

