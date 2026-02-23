# Framer Motion Animations

## Overview

This skill covers battle animations, HP transitions, hit effects, and visual feedback using Framer Motion in ArenaAI.

## Core Concepts

### Setup

```typescript
import { motion, AnimatePresence } from 'framer-motion'
import { useAnimate } from 'framer-motion'
```

### Basic Motion Component

```typescript
<motion.div
  initial={{ opacity: 0, scale: 0.8 }}
  animate={{ opacity: 1, scale: 1 }}
  exit={{ opacity: 0, scale: 0.8 }}
  transition={{ duration: 0.3 }}
>
  Content
</motion.div>
```

## ArenaUI Patterns

### HP Bar Animation

```typescript
// src/components/HPBar.tsx
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

export function HPBar({ current, max, color }: { current: number; max: number; color: string }) {
  const [displayHp, setDisplayHp] = useState(current)

  useEffect(() => {
    // Animate HP change
    const timeout = setTimeout(() => setDisplayHp(current), 100)
    return () => clearTimeout(timeout)
  }, [current])

  const percentage = (displayHp / max) * 100

  return (
    <div className="w-full h-6 bg-gray-800 rounded-full overflow-hidden border-2 border-gray-700">
      <motion.div
        className={`h-full ${color}`}
        initial={{ width: `${(current / max) * 100}%` }}
        animate={{ width: `${percentage}%` }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      />
      <span className="absolute inset-0 flex items-center justify-center text-sm font-bold">
        {displayHp} / {max}
      </span>
    </div>
  )
}
```

### Hit Effect Animation

```typescript
// src/components/HitEffect.tsx
import { motion, AnimatePresence } from 'framer-motion'

export function HitEffect({ type, visible }: { type: string; visible: boolean }) {
  const effects = {
    LIGHTNING_STRIKE: { emoji: '⚡', color: 'bg-yellow-400' },
    FIRE_SLASH: { emoji: '🔥', color: 'bg-orange-500' },
    COUNTER_ATTACK: { emoji: '💥', color: 'bg-red-500' },
    WEAK_BLOW: { emoji: '🫧', color: 'bg-gray-400' },
  }

  const effect = effects[type as keyof typeof effects] || effects.WEAK_BLOW

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className={`fixed inset-0 pointer-events-none flex items-center justify-center ${effect.color} mix-blend-screen`}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: [0, 0.5, 0], scale: [0, 2, 3] }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.span
            className="text-9xl"
            animate={{ rotate: [0, -10, 10, -10, 0] }}
            transition={{ duration: 0.3 }}
          >
            {effect.emoji}
          </motion.span>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
```

### Character Animation

```typescript
// src/components/CharacterAvatar.tsx
import { motion, useMotionValue, useTransform } from 'framer-motion'

export function CharacterAvatar({
  model,
  isAttacking,
  isDamaged
}: {
  model: { name: string; color: string }
  isAttacking: boolean
  isDamaged: boolean
}) {
  const x = useMotionValue(0)
  const opacity = useTransform(x, [-100, 0, 100], [0, 1, 0])

  return (
    <motion.div
      className="relative"
      animate={{
        x: isAttacking ? [0, 50, 0] : 0,
        rotate: isDamaged ? [0, -5, 5, -5, 0] : 0,
      }}
      transition={{ duration: 0.3 }}
    >
      {/* Avatar */}
      <motion.div
        className={`w-32 h-32 rounded-2xl bg-${model.color} shadow-2xl`}
        whileHover={{ scale: 1.1 }}
        style={{ opacity }}
      >
        {/* Character sprite or emoji */}
        <span className="text-6xl">🤖</span>
      </motion.div>

      {/* Attack animation */}
      <AnimatePresence>
        {isAttacking && (
          <motion.div
            className="absolute inset-0"
            initial={{ scale: 1 }}
            animate={{ scale: [1, 1.2, 1] }}
            exit={{ scale: 1 }}
            transition={{ duration: 0.2 }}
          >
            <div className="w-full h-full bg-yellow-400/30 rounded-2xl animate-pulse" />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
```

### Streaming Text Animation

```typescript
// src/components/StreamingText.tsx
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

export function StreamingText({ content, isComplete }: { content: string; isComplete: boolean }) {
  const [displayText, setDisplayText] = useState('')

  useEffect(() => {
    if (!isComplete) {
      // Typewriter effect for streaming
      const timeout = setTimeout(() => {
        setDisplayText(content)
      }, 10)
      return () => clearTimeout(timeout)
    } else {
      setDisplayText(content)
    }
  }, [content, isComplete])

  return (
    <motion.div
      className="p-4 bg-gray-900/50 rounded-lg border border-gray-700"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
    >
      <p className="text-lg leading-relaxed">
        {displayText}
        {!isComplete && (
          <motion.span
            className="inline-block w-2 h-5 bg-neon-blue ml-1"
            animate={{ opacity: [1, 0, 1] }}
            transition={{ duration: 0.8, repeat: Infinity }}
          />
        )}
      </p>
    </motion.div>
  )
}
```

### Victory Animation

```typescript
// src/components/VictoryScreen.tsx
import { motion, AnimatePresence } from 'framer-motion'

export function VictoryScreen({ winner }: { winner: string }) {
  return (
    <motion.div
      className="fixed inset-0 flex items-center justify-center bg-black/90 z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <motion.div
        className="text-center"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', duration: 0.8 }}
      >
        <motion.h1
          className="text-6xl font-bold text-neon-gold mb-4"
          animate={{ textShadow: ['0 0 20px #ffd700', '0 0 40px #ffd700', '0 0 20px #ffd700'] }}
          transition={{ duration: 1, repeat: Infinity }}
        >
          VICTORY!
        </motion.h1>
        <p className="text-2xl text-white mb-8">{winner} wins!</p>

        {/* Confetti */}
        {[...Array(50)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full"
            style={{
              backgroundColor: ['#00f0ff', '#b026ff', '#ffd700'][i % 3],
              left: '50%',
              top: '50%',
            }}
            animate={{
              x: [0, (Math.random() - 0.5) * window.innerWidth],
              y: [0, (Math.random() - 0.5) * window.innerHeight],
              opacity: [1, 0],
            }}
            transition={{
              duration: 2 + Math.random(),
              delay: Math.random() * 0.5,
            }}
          />
        ))}
      </motion.div>
    </motion.div>
  )
}
```

## Best Practices

1. **Use AnimatePresence** - For enter/exit animations
2. **Leverage useAnimate** - For complex sequence animations
3. **Optimize re-renders** - Use memo for animated components
4. **Keep animations smooth** - Use GPU-accelerated properties (transform, opacity)
5. **Add spring animations** - For natural character movements
6. **Use layout animations** - For smooth HP bar transitions
