import type { Metadata } from 'next'
import { Rajdhani, Orbitron } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/Providers'

export const dynamic = 'force-dynamic'

const rajdhani = Rajdhani({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-rajdhani',
})

const orbitron = Orbitron({
  weight: ['400', '500', '600', '700', '800', '900'],
  subsets: ['latin'],
  variable: '--font-orbitron',
})

export const metadata: Metadata = {
  title: 'ArenaAI — AI Battle Arena',
  description: 'Street Fighter, but with AI models. Watch AI models debate in real-time.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" />
      </head>
      <body className={`${rajdhani.variable} ${orbitron.variable} font-futuristic bg-black text-white`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
