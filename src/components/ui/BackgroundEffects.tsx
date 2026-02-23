export function BackgroundEffects() {
  return (
    <>
      {/* Scanline Effect */}
      <div className="scanline pointer-events-none" />

      {/* Cyber Grid Background */}
      <div className="fixed inset-0 cyber-grid pointer-events-none z-0" />

      {/* Gradient Overlay */}
      <div className="fixed inset-0 bg-gradient-to-t from-black via-transparent to-black pointer-events-none z-0" />

      {/* Floating Particles */}
      <div className="fixed inset-0 pointer-events-none z-10 overflow-hidden">
        <div className="absolute top-[20%] left-[10%] w-[1px] h-[1px] bg-primary shadow-[0_0_10px_2px_rgba(0,243,255,0.8)] animate-pulse" />
        <div className="absolute top-[60%] left-[80%] w-[1px] h-[1px] bg-secondary shadow-[0_0_10px_2px_rgba(188,19,254,0.8)] animate-pulse animation-delay-700" />
        <div className="absolute top-[40%] left-[50%] w-[1px] h-[1px] bg-accent shadow-[0_0_10px_2px_rgba(255,157,0,0.8)] animate-pulse animation-delay-1000" />
      </div>
    </>
  )
}
