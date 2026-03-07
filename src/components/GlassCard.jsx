export default function GlassCard({ children, className = '', hoverable = true }) {
  return (
    <div
      className={`bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6 shadow-lg transition ${hoverable ? 'card-glow hover:border-purple-400/60 hover:bg-white/10' : ''} ${className}`}
    >
      {children}
    </div>
  )
}

