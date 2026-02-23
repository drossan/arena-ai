import Link from 'next/link'
import { ReactNode } from 'react'

type NeonVariant = 'cyan' | 'purple' | 'amber' | 'green'

const NEON_STYLES: Record<NeonVariant, { border: string; dotColor: string }> = {
  cyan: { border: 'neon-border-cyan', dotColor: 'bg-primary' },
  purple: { border: 'neon-border-purple', dotColor: 'bg-secondary' },
  amber: { border: 'neon-border-amber', dotColor: 'bg-accent' },
  green: { border: 'neon-border-green', dotColor: 'bg-[#39ff14]' },
}

interface NeonButtonProps {
  href: string
  variant?: NeonVariant
  icon: ReactNode
  children: ReactNode
}

export function NeonButton({ href, variant = 'cyan', icon, children }: NeonButtonProps) {
  const style = NEON_STYLES[variant]

  return (
    <Link
      href={href}
      className={`${style.border} group relative px-10 py-5 bg-black/40 backdrop-blur-sm transition-all hover:scale-105 active:scale-95`}
    >
      <div className="flex items-center space-x-4">
        <span className="text-2xl group-hover:animate-spin">{icon}</span>
        <span className="font-display font-bold text-lg tracking-widest uppercase">
          {children}
        </span>
      </div>
      <div className={`absolute top-0 left-0 w-2 h-2 ${style.dotColor}`} />
      <div className={`absolute bottom-0 right-0 w-2 h-2 ${style.dotColor}`} />
    </Link>
  )
}
