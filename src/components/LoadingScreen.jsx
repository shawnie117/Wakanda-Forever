
import { motion } from 'framer-motion'

const letters = 'VIBRANIUM'.split('')

const particles = Array.from({ length: 18 }, (_, i) => ({
  id: i,
  left: ((i * 37) % 100) + '%',
  top: ((i * 53) % 100) + '%',
  size: 2 + (i % 3),
  duration: 3 + (i % 5),
  delay: i * 0.12,
}))

const neuralLines = [
  { x1: '6%', y1: '22%', x2: '28%', y2: '38%', delay: 0.1 },
  { x1: '18%', y1: '70%', x2: '42%', y2: '52%', delay: 0.3 },
  { x1: '35%', y1: '28%', x2: '58%', y2: '36%', delay: 0.5 },
  { x1: '48%', y1: '74%', x2: '71%', y2: '62%', delay: 0.7 },
  { x1: '62%', y1: '30%', x2: '84%', y2: '44%', delay: 0.9 },
  { x1: '74%', y1: '72%', x2: '94%', y2: '58%', delay: 1.1 },
]

export default function LoadingScreen() {
  return (
    <motion.div
      key="loading-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.55, ease: 'easeInOut' }}
      className="relative min-h-screen overflow-hidden bg-black flex items-center justify-center"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.18),transparent_58%)]" />

      <div className="pointer-events-none absolute inset-0 opacity-30 bg-[linear-gradient(rgba(168,85,247,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(168,85,247,0.12)_1px,transparent_1px)] bg-[size:42px_42px]" />

      <svg className="pointer-events-none absolute inset-0 w-full h-full opacity-35" viewBox="0 0 100 100" preserveAspectRatio="none">
        {neuralLines.map((line, idx) => (
          <motion.line
            key={idx}
            x1={line.x1}
            y1={line.y1}
            x2={line.x2}
            y2={line.y2}
            stroke="rgba(167,139,250,0.6)"
            strokeWidth="0.12"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: [0, 0.6, 0.25] }}
            transition={{ duration: 1.6, delay: line.delay, ease: 'easeOut' }}
          />
        ))}
      </svg>

      <div className="pointer-events-none absolute inset-0">
        {particles.map((particle) => (
          <motion.span
            key={particle.id}
            className="absolute rounded-full bg-purple-300/80"
            style={{
              left: particle.left,
              top: particle.top,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              boxShadow: '0 0 14px rgba(168, 85, 247, 0.8)',
            }}
            animate={{
              y: [0, -12, 0],
              opacity: [0.2, 0.85, 0.2],
            }}
            transition={{
              duration: particle.duration,
              delay: particle.delay,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>

      <motion.div
        initial={{ y: 12, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="relative z-10 text-center px-6"
      >
        <motion.h1
          animate={{
            textShadow: [
              '0 0 16px rgba(168,85,247,0.5), 0 0 38px rgba(168,85,247,0.35)',
              '0 0 24px rgba(168,85,247,0.85), 0 0 58px rgba(168,85,247,0.55)',
              '0 0 16px rgba(168,85,247,0.5), 0 0 38px rgba(168,85,247,0.35)',
            ],
          }}
          transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
          className="font-neo tracking-[0.26em] text-4xl sm:text-5xl md:text-7xl text-purple-200"
        >
          {letters.map((letter, idx) => (
            <motion.span
              key={`${letter}-${idx}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: idx * 0.08, ease: 'easeOut' }}
              className="inline-block"
            >
              {letter}
            </motion.span>
          ))}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, letterSpacing: '0.22em' }}
          animate={{ opacity: [0.35, 0.85, 0.35], letterSpacing: ['0.22em', '0.26em', '0.22em'] }}
          transition={{ duration: 2.2, delay: 0.9, repeat: Infinity, ease: 'easeInOut' }}
          className="mt-6 font-neo text-xs sm:text-sm text-purple-300/90"
        >
          AI PRODUCT INTELLIGENCE
        </motion.p>
      </motion.div>
    </motion.div>
  )
}
