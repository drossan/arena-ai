import { ReactNode } from 'react'

interface FighterCardProps {
  id: string
  name: string
  nickname: string
  color: string
  image: string
  onClick?: () => void
}

export function FighterCard({ id, name, nickname, color, image, onClick }: FighterCardProps) {
  const rgbColor = hexToRgb(color)

  return (
    <div className="group cursor-pointer" onClick={onClick}>
      <div
        className="relative aspect-[3/4] bg-black/60 overflow-hidden transition-all fighter-card"
        style={{
          '--card-color': color,
          '--card-shadow': `rgba(${rgbColor}, 0.3)`,
        } as React.CSSProperties}
      >
        <div className="absolute inset-0 card-gradient" />
        <img
          alt={`Cyberpunk warrior ${name.toLowerCase()}`}
          className="w-full h-full object-cover fighter-card-image"
          src={image}
        />
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black to-transparent">
          <p
            className="font-display font-bold text-xl group-hover:translate-x-1 transition-transform"
            style={{ color }}
          >
            {name}
          </p>
          <p className="text-xs text-gray-400 uppercase tracking-tighter">
            {nickname}
          </p>
        </div>
      </div>
    </div>
  )
}

// Helper function to convert hex to RGB
function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
    : '255, 255, 255'
}
