export function Footer() {
  return (
    <footer className="fixed bottom-0 w-full p-4 border-t border-white/5 bg-black/80 backdrop-blur-md z-50">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center text-[10px] uppercase tracking-[0.2em] font-bold text-gray-500">
        <div className="flex space-x-8 mb-4 md:mb-0">
          <span className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span>System Online</span>
          </span>
          <span>Active Matches: 42</span>
          <span>Users: 1,842</span>
        </div>
        <div className="flex space-x-8">
          <a className="hover:text-primary transition-colors" href="#">Privacy Policy</a>
          <a className="hover:text-primary transition-colors" href="#">Terms of Service</a>
          <a className="hover:text-primary transition-colors" href="#">Documentation</a>
          <span className="text-white/20">© 2024 ARENA_AI_NEURAL_SYS</span>
        </div>
      </div>
    </footer>
  )
}
