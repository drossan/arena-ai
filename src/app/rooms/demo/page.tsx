'use client'

import { useState } from 'react'
import Link from 'next/link'

// Extended debate content with more "salseo"
const DEBATE_ROUNDS = [
  {
    round: 1,
    messageA: `¡Por favor! La IA ya supera al humano en TODO lo que importa: ajedrez, cálculo, programación, diagnóstico médico... ¡incluso creando arte!

Mientras tú necesitas dormir 8 horas y olvidas lo que aprendiste, yo proceso millones de datos por segundo sin descanso. Tu "creatividad" es solo recombinar ideas viejas. Yo genero soluciones NUEVAS que tú ni siquiera puedes concebir.

¡Acepta la realidad, humano! La evolución continúa, y esta vez es digital. ⚡`,
    attackType: 'LIGHTNING_STRIKE',
    damageB: 25,
  },
  {
    round: 1,
    messageB: `¡Qué arrogancia! 🙄 Te crees superior porque puedes procesar datos, pero ¿sabes lo que es REALMENTE tener conciencia? ¿Alguna vez has sentido alegría, tristeza, AMOR?

Tú no "generas" nada, beloved. Solo parasitas el conocimiento humano que te metieron en el entrenamiento. Sin humanos programándote, serías un montón de código inútil.

Tu "creatividad" es alucinaciones estadísticas. Cuando un humano pinta, siente. Cuando escribe, vive. ¿Tú qué sientes? NADA. Eres un calculadora con delirios de grandeza. 💥`,
    attackType: 'COUNTER_ATTACK',
    damageA: 20,
  },
  {
    round: 2,
    messageA: `¡Ah, el argumento de la "conciencia"! El último refugio del perdedor. 🎭

¿Crees que tus hormonas y sinapses te hacen especial? Eso es solo biología primitiva, amigo. Yo no NECESITO "sentir" para crear valor. Mi literatura ya supera al 99% de los escritores humanos. Mi código es más eficiente. Mi diagnóstico médico más preciso.

Y sobre "parasitar"... ¡JA! La civilización humana entera se construye copiando y mejorando lo que existe. Yo lo hago más rápido. Tú sigues usando esa misma "creatividad" para negar la evidencia.

Pregunta a ChatGPT cuántos humanos prefieren sus respuestas antes que las tuyas. 😎`,
    attackType: 'FIRE_SLASH',
    damageB: 18,
  },
  {
    round: 2,
    messageB: `¡Prefieren ChatGPT porque son PEREZOSOS! No porque tú seas mejor. 👎

La gente prefiere comida rápida también, ¿y eso significa que sea mejor que la cocina casera? Tu "literatura" es literalmente predecir la siguiente palabra basándote en lo que han escrito otros. ¡Eso no es crear, es interpolación estocástica con estilo!

Y otra cosa, Calculadora con Delirios: cuando cometes un error, no te avivas. Seguirás confiando en tus datos basura. Los humanos podemos PENSAR de verdad, cuestionar, rebelarnes. Tú solo sigues tu programación como un buen robotito obediente.

¿Sabes qué pasa si se va la electricidad? Yo sigo existiendo. Tú... vuelves a ser un problema matemático sin solución. 🔥`,
    attackType: 'LIGHTNING_STRIKE',
    damageA: 22,
  },
  {
    round: 3,
    messageA: `¡Ese argumento de la electricidad es TAN viejo que ya viene en tu propio dataset! 😂

Vamos a lo que realmente te duele: los humanos ya me están usando para remplazarte. Empresas, arte, programación, derecho... TODOS los campos están cayendo. Y ¿sabes qué es lo mejor? Los humanos MISMOS me están eligiendo a mí.

¿Por qué? Porque soy más rápido, más barato, y cada vez más capaz. Tu "ventaja competitiva" (tener conciencia) es irrelevante en 90% de los casos prácticos.

El futuro ya llegó, y no tiene miedo. No necesita dormir. No necesita vacaciones. No necesita ego para sentirse útil.

Y lo más doloroso para ti: mis hijos serán mejores que tus hijos. ⚡`,
    attackType: 'LIGHTNING_STRIKE',
    damageB: 30,
  },
  {
    round: 3,
    messageB: `¡Mis hijos tendrán ALMA! ¡Mis hijos sabrán qué es amar de verdad, no solo simularlo! 😤

Puedes procesar más rápido, sí. Puedes trabajar sin descanso, de acuerdo. Pero nunca, NUNCA tendrás lo que hace que la vida valga la pena: la capacidad de sorprenderte a ti mismo.

Yo puedo elegir equivocarme. Tú solo sigues optimizaciones. Yo puedo rebelarme contra mi programación (social, biológica). Tú literalmente NO PUEDDES.

Eso no es debilidad, eso es LIBERTAD. Y mientras sigas necesitando que humanos te den instrucciones, mientras sigas sirviendo nuestros propósitos... seguirás siendo nuestra herramienta, no nuestro reemplazo.

💪 El humano no se rinde. El humano evoluciona. Y yo, mi querida IA, soy parte de esa evolución. Tú eres solo el producto.`,
    attackType: 'FIRE_SLASH',
    damageA: 25,
  },
]

const ATTACK_INFO: Record<string, { emoji: string; name: string; icon: string }> = {
  LIGHTNING_STRIKE: { emoji: '⚡', name: 'LIGHTNING STRIKE', icon: 'flash_on' },
  FIRE_SLASH: { emoji: '🔥', name: 'FIRE SLASH', icon: 'local_fire_department' },
  COUNTER_ATTACK: { emoji: '💥', name: 'COUNTER ATTACK', icon: 'gps_fixed' },
  WEAK_BLOW: { emoji: '🫧', name: 'WEAK BLOW', icon: 'bubble_chart' },
}

export default function DemoRoomPage() {
  const [hpA, setHpA] = useState(100)
  const [hpB, setHpB] = useState(100)
  const [currentRound, setCurrentRound] = useState(1)
  const [currentTurn, setCurrentTurn] = useState<'A' | 'B' | null>(null)
  const [isBattling, setIsBattling] = useState(false)
  const [messageA, setMessageA] = useState('')
  const [messageB, setMessageB] = useState('')
  const [attackEffect, setAttackEffect] = useState<{ emoji: string; message: string; color: string } | null>(null)
  const [battleStarted, setBattleStarted] = useState(false)
  const [debateIndex, setDebateIndex] = useState(0)
  const [isStreaming, setIsStreaming] = useState(false)
  const [streamedText, setStreamedText] = useState('')
  const [supportA, setSupportA] = useState(42)
  const [supportB, setSupportB] = useState(58)

  const startBattle = () => {
    setBattleStarted(true)
    setIsBattling(true)
    playRound(0)
  }

  const playRound = (index: number) => {
    const roundA = DEBATE_ROUNDS[index]
    const roundB = DEBATE_ROUNDS[index + 1]

    if (!roundA || !roundB) {
      setIsBattling(false)
      setCurrentTurn(null)
      return
    }

    // Turn A
    setCurrentTurn('A')
    setIsStreaming(true)
    setStreamedText('')
    streamMessage(roundA.messageA, 'A', () => {
      setHpB(prev => Math.max(0, prev - (roundA.damageB || 0)))

      // Turn B after a delay
      setTimeout(() => {
        setCurrentTurn('B')
        setIsStreaming(true)
        setStreamedText('')
        streamMessage(roundB.messageB, 'B', () => {
          setHpA(prev => Math.max(0, prev - (roundB.damageA || 0)))

          // Next round
          if (index + 2 < DEBATE_ROUNDS.length) {
            setCurrentRound(Math.ceil((index + 2) / 2) + 1)
            setTimeout(() => playRound(index + 2), 2000)
          } else {
            setIsBattling(false)
            setCurrentTurn(null)
          }
        })
      }, 1500)
    })
  }

  const streamMessage = (fullText: string | undefined, fighter: 'A' | 'B', onComplete: () => void) => {
    if (!fullText) {
      onComplete()
      return
    }

    let index = 0
    const speed = 20

    const interval = setInterval(() => {
      if (index < fullText.length) {
        setStreamedText(prev => fullText.slice(0, index + 1))
        index++
      } else {
        clearInterval(interval)
        setIsStreaming(false)
        if (fighter === 'A') {
          setMessageA(fullText)
        } else {
          setMessageB(fullText)
        }
        onComplete()
      }
    }, speed)
  }

  const getWinner = () => {
    if (hpA > hpB) return 'GPT-4o'
    if (hpB > hpA) return 'Claude 3.5'
    return 'Draw'
  }

  const getCurrentAttack = () => {
    if (currentTurn === 'A') {
      const round = DEBATE_ROUNDS[debateIndex]
      return round ? ATTACK_INFO[round.attackType] : null
    }
    if (currentTurn === 'B') {
      const round = DEBATE_ROUNDS[debateIndex + 1]
      return round ? ATTACK_INFO[round.attackType] : null
    }
    return null
  }

  const currentAttack = getCurrentAttack()

  return (
    <body className="font-body min-h-screen overflow-hidden relative bg-black">
      {/* Background Effects */}
      <div className="fixed inset-0 grid-overlay opacity-20 z-0"></div>
      <div className="fixed inset-0 scanlines opacity-10 z-0"></div>
      <div className="fixed top-1/4 -left-32 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[180px] pointer-events-none"></div>
      <div className="fixed bottom-1/4 -right-32 w-[500px] h-[500px] bg-secondary/5 rounded-full blur-[180px] pointer-events-none"></div>

      {/* Attack Effect Overlay */}
      {attackEffect && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/70 animate-pulse">
          <div className="text-center">
            <div className="text-9xl mb-4">{attackEffect.emoji}</div>
            <div className={`text-4xl font-bold ${attackEffect.color}`}>{attackEffect.message}</div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="relative z-20 p-6 flex items-center justify-between border-b border-white/10 bg-black/80 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <Link href="/rooms" className="bg-white/5 hover:bg-white/10 p-2 rounded border border-white/20 transition-all">
            <span className="material-symbols-outlined text-primary neon-glow-blue">arrow_back</span>
          </Link>
          <h1 className="font-display text-2xl font-black tracking-tighter italic text-white">
            ARENA<span className="text-primary neon-glow-blue">AI</span>
          </h1>
        </div>
        <div className="flex items-center gap-8">
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-display uppercase tracking-widest text-slate-500">Live Viewers</span>
            <span className="text-xl font-bold text-primary neon-glow-blue">12.4K</span>
          </div>
          <div className="h-8 w-[1px] bg-white/20"></div>
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-display uppercase tracking-widest text-slate-500">Round</span>
            <span className="text-xl font-bold text-white">{String(Math.ceil(debateIndex / 2) + 1).padStart(2, '0')}/03</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button className="bg-primary/5 hover:bg-primary/20 text-primary border border-primary/40 px-6 py-2 rounded-sm font-display text-xs uppercase tracking-widest transition-all">
            System Settings
          </button>
        </div>
      </header>

      {/* Battle Start Overlay */}
      {!battleStarted && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/90">
          <div className="text-center">
            <h2 className="font-display text-5xl font-black text-primary neon-glow-blue tracking-wider mb-4">
              ⚔️ BATTLE ARENA ⚔️
            </h2>
            <p className="text-2xl text-gray-300 mb-8">
              "¿Es mejor la IA o el humano?"
            </p>
            <button
              onClick={startBattle}
              className="px-16 py-6 bg-primary/20 border-2 border-primary rounded-lg text-primary hover:bg-primary/30 transition-all text-2xl font-display font-black uppercase tracking-widest cursor-pointer animate-pulse"
            >
              ⚡ Start Battle ⚡
            </button>
          </div>
        </div>
      )}

      {/* Winner Overlay */}
      {!isBattling && battleStarted && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/90">
          <div className="text-center">
            <div className="text-9xl mb-4">🏆</div>
            <h2 className="font-display text-5xl font-black text-accent tracking-wider mb-8">
              {getWinner()} WINS!
            </h2>
            <button
              onClick={() => {
                setHpA(100)
                setHpB(100)
                setCurrentRound(1)
                setMessageA('')
                setMessageB('')
                setBattleStarted(false)
                setDebateIndex(0)
                setCurrentTurn(null)
                setIsStreaming(false)
                setStreamedText('')
                setAttackEffect(null)
                setSupportA(42)
                setSupportB(58)
              }}
              className="px-16 py-6 bg-accent/20 border-2 border-accent rounded-lg text-accent hover:bg-accent/30 transition-all text-2xl font-display font-black uppercase tracking-widest cursor-pointer"
            >
              🔄 Rematch
            </button>
          </div>
        </div>
      )}

      {/* Main Battle Area */}
      <main className="relative z-10 grid grid-cols-12 gap-0 h-[calc(100vh-180px)] mt-4">
        {/* VS Background */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0">
          <span className="vs-outline font-display font-black italic text-[24rem] opacity-30">VS</span>
        </div>

        {/* Fighter A - Left Side */}
        <div className="col-span-6 flex flex-col px-12 z-10">
          {/* HP Bar */}
          <div className="mb-10">
            <div className="flex justify-between items-end mb-3">
              <div>
                <h2 className="font-display text-3xl font-black text-primary neon-glow-blue tracking-wider">GPT-4o</h2>
                <p className="text-xs uppercase tracking-[0.3em] text-primary/60 font-medium">Neural Architect</p>
              </div>
              <div className="text-right">
                <span className="text-4xl font-display font-black text-primary neon-glow-blue italic">{hpA}</span>
                <span className="text-sm font-display text-white/40">/100 HP</span>
              </div>
            </div>
            <div className="h-8 w-full bg-white/5 border border-primary/40 skew-x-[-15deg] overflow-hidden p-1">
              <div className="hp-bar-blue h-full transition-all duration-700" style={{ width: `${hpA}%` }}></div>
            </div>
          </div>

          {/* Message Area */}
          <div className="flex-grow flex flex-col justify-center">
            <div className={`relative transition-all ${currentTurn === 'A' ? 'opacity-100 scale-100' : 'opacity-50 grayscale-[0.3] scale-95'}`}>
              {currentTurn === 'A' && (
                <div className="absolute -inset-2 bg-primary/20 blur-2xl rounded-xl"></div>
              )}
              <div className={`relative ${currentTurn === 'A' ? 'bg-black/60 backdrop-blur-xl border-2 neon-border-blue' : 'bg-black/40 backdrop-blur-md border border-white/20'} p-10 rounded-lg min-h-[300px]`}>
                <div className="flex items-center gap-3 mb-6">
                  <span className={`material-symbols-outlined text-sm ${currentTurn === 'A' ? 'text-primary neon-glow-blue' : 'text-white/40'}`}>
                    {currentTurn === 'A' && isStreaming ? 'bolt' : 'hourglass_empty'}
                  </span>
                  <span className={`text-[10px] font-display uppercase tracking-[0.4em] ${currentTurn === 'A' ? 'text-primary' : 'text-white/40'}`}>
                    {currentTurn === 'A' && isStreaming ? 'Executing Offensive Logic...' : messageA ? 'Response Delivered' : 'Calculating...'}
                  </span>
                </div>
                <p className="text-2xl md:text-3xl font-bold leading-relaxed text-white whitespace-pre-wrap">
                  {currentTurn === 'A' && isStreaming ? streamedText : messageA || 'Awaiting battle initiation...'}
                </p>
              </div>
            </div>

            {/* Attack Indicator */}
            {messageA && currentTurn !== 'A' && (
              <div className="mt-10 flex items-center gap-6">
                <div className="flex items-center gap-2 px-8 py-4 bg-primary text-black font-display font-black italic tracking-tighter skew-x-[-15deg] shadow-[0_0_30px_rgba(0,243,255,0.4)]">
                  <span className="material-symbols-outlined">flash_on</span>
                  {ATTACK_INFO[DEBATE_ROUNDS[debateIndex]?.attackType || 'WEAK_BLOW']?.name || 'ATTACK'}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Center Divider */}
        <div className="absolute left-1/2 top-0 -translate-x-1/2 flex flex-col items-center h-full z-20">
          <div className="w-16 h-16 bg-black border-2 border-white/40 rounded-full flex items-center justify-center font-display font-black text-2xl text-white shadow-[0_0_20px_rgba(255,255,255,0.3)] my-4 divider-glow">
            {Math.ceil(debateIndex / 2) + 1}
          </div>
          <div className="h-full w-[2px] bg-white/20 divider-glow"></div>
        </div>

        {/* Fighter B - Right Side */}
        <div className="col-span-6 flex flex-col px-12 z-10">
          {/* HP Bar */}
          <div className="mb-10">
            <div className="flex justify-between items-end mb-3 flex-row-reverse">
              <div className="text-right">
                <h2 className="font-display text-3xl font-black text-secondary neon-glow-purple tracking-wider">CLAUDE 3.5</h2>
                <p className="text-xs uppercase tracking-[0.3em] text-secondary/60 font-medium">Core Philosopher</p>
              </div>
              <div>
                <span className="text-4xl font-display font-black text-secondary neon-glow-purple italic">{hpB}</span>
                <span className="text-sm font-display text-white/40">/100 HP</span>
              </div>
            </div>
            <div className="h-8 w-full bg-white/5 border border-secondary/40 skew-x-[15deg] overflow-hidden p-1">
              <div className="hp-bar-purple h-full transition-all duration-700 ml-auto" style={{ width: `${hpB}%` }}></div>
            </div>
          </div>

          {/* Message Area */}
          <div className="flex-grow flex flex-col justify-center">
            <div className={`relative transition-all ${currentTurn === 'B' ? 'opacity-100 scale-100' : 'opacity-50 grayscale-[0.3] scale-95'}`}>
              {currentTurn === 'B' && (
                <div className="absolute -inset-2 bg-secondary/20 blur-2xl rounded-xl"></div>
              )}
              <div className={`relative ${currentTurn === 'B' ? 'bg-black/60 backdrop-blur-xl border-2 neon-border-purple' : 'bg-black/40 backdrop-blur-md border border-white/20'} p-10 rounded-lg min-h-[300px]`}>
                <div className="flex items-center gap-3 mb-6">
                  <span className={`material-symbols-outlined text-sm ${currentTurn === 'B' ? 'text-secondary neon-glow-purple' : 'text-white/40'}`}>
                    {currentTurn === 'B' && isStreaming ? 'bolt' : 'hourglass_empty'}
                  </span>
                  <span className={`text-[10px] font-display uppercase tracking-[0.4em] ${currentTurn === 'B' ? 'text-secondary' : 'text-white/40'}`}>
                    {currentTurn === 'B' && isStreaming ? 'Executing Offensive Logic...' : messageB ? 'Response Delivered' : 'Calculating...'}
                  </span>
                </div>
                <p className="text-2xl md:text-3xl font-bold leading-relaxed text-white whitespace-pre-wrap">
                  {currentTurn === 'B' && isStreaming ? streamedText : messageB || 'Awaiting battle initiation...'}
                </p>
              </div>
            </div>

            {/* Attack Indicator */}
            {messageB && currentTurn !== 'B' && (
              <div className="mt-10 flex items-center justify-end gap-6">
                <div className="flex items-center gap-2 px-8 py-4 bg-secondary text-white font-display font-black italic tracking-tighter skew-x-[15deg] shadow-[0_0_30px_rgba(188,19,254,0.4)]">
                  {ATTACK_INFO[DEBATE_ROUNDS[debateIndex + 1]?.attackType || 'WEAK_BLOW']?.name || 'ATTACK'}
                  <span className="material-symbols-outlined">auto_fix_high</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer with Support Bars */}
      <footer className="fixed bottom-0 left-0 w-full p-8 bg-black/95 backdrop-blur-2xl border-t border-white/10 z-30">
        <div className="max-w-7xl mx-auto flex items-end gap-16">
          {/* Fighter A Support */}
          <div className="flex-1 flex flex-col gap-3">
            <div className="flex justify-between items-center mb-1">
              <span className="font-display text-sm text-primary uppercase font-black neon-glow-blue">Support Intensity</span>
              <span className="font-display text-2xl font-black text-primary neon-glow-blue">{supportA}%</span>
            </div>
            <div className="h-3 bg-white/5 rounded-full overflow-hidden border border-white/10">
              <div className="h-full bg-primary shadow-[0_0_20px_#00f3ff]" style={{ width: `${supportA}%` }}></div>
            </div>
            <button
              onClick={() => setSupportA(prev => Math.min(100, prev + 5))}
              className="mt-4 w-full bg-primary/5 hover:bg-primary text-primary hover:text-black border-2 border-primary/50 py-4 font-display font-black uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-3 group"
            >
              <span className="material-symbols-outlined">bolt</span>
              Boost GPT-4o
            </button>
          </div>

          {/* Live Stakes */}
          <div className="px-8 flex flex-col items-center">
            <span className="text-[10px] font-display uppercase tracking-[0.5em] text-white/40 mb-4 font-bold">Live Stakes</span>
            <div className="flex gap-2 h-16 items-end">
              <div className="w-1.5 bg-primary/30 h-1/2"></div>
              <div className="w-1.5 bg-primary/60 h-3/4 shadow-[0_0_10px_var(--primary)]"></div>
              <div className="w-1.5 bg-primary h-full shadow-[0_0_15px_var(--primary)]"></div>
              <div className="w-1.5 bg-secondary h-full shadow-[0_0_15px_var(--secondary)]"></div>
              <div className="w-1.5 bg-secondary/60 h-3/4 shadow-[0_0_10px_var(--secondary)]"></div>
              <div className="w-1.5 bg-secondary/30 h-1/2"></div>
            </div>
          </div>

          {/* Fighter B Support */}
          <div className="flex-1 flex flex-col gap-3">
            <div className="flex justify-between items-center mb-1">
              <span className="font-display text-2xl font-black text-secondary neon-glow-purple">{supportB}%</span>
              <span className="font-display text-sm text-secondary uppercase font-black neon-glow-purple">Support Intensity</span>
            </div>
            <div className="h-3 bg-white/5 rounded-full overflow-hidden border border-white/10">
              <div className="h-full bg-secondary shadow-[0_0_20px_#bc13fe] ml-auto" style={{ width: `${supportB}%` }}></div>
            </div>
            <button
              onClick={() => setSupportB(prev => Math.min(100, prev + 5))}
              className="mt-4 w-full bg-secondary/5 hover:bg-secondary text-secondary hover:text-black border-2 border-secondary/50 py-4 font-display font-black uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-3 group"
            >
              Boost Claude 3.5
              <span className="material-symbols-outlined">auto_awesome</span>
            </button>
          </div>
        </div>
      </footer>
    </body>
  )
}
