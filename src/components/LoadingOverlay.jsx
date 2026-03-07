import { motion } from 'framer-motion'

const letters = 'VIBRANIUM'.split('')

export default function LoadingOverlay({ fullscreen = false, subtitle = 'INITIALIZING INTELLIGENCE' }) {
  const containerClass = fullscreen
    ? 'fixed inset-0 z-[120]'
    : 'absolute inset-0 z-40 rounded-2xl'

  return (
    <div className={`${containerClass} flex items-center justify-center bg-transparent`}>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        className="relative z-10 text-center px-4"
      >
        <motion.h2
          animate={{
            textShadow: [
              '0 0 10px rgba(168,85,247,0.4), 0 0 24px rgba(168,85,247,0.25)',
              '0 0 18px rgba(168,85,247,0.8), 0 0 36px rgba(168,85,247,0.45)',
              '0 0 10px rgba(168,85,247,0.4), 0 0 24px rgba(168,85,247,0.25)',
            ],
          }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
          className="font-neo tracking-[0.2em] text-xl md:text-3xl text-purple-200"
        >
          {letters.map((letter, index) => (
            <motion.span
              key={`${letter}-${index}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: index * 0.06 }}
              className="inline-block"
            >
              {letter}
            </motion.span>
          ))}
        </motion.h2>

        <motion.p
          animate={{ opacity: [0.45, 1, 0.45] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
          className="mt-3 text-[10px] md:text-xs tracking-[0.28em] text-purple-300/90 font-neo"
        >
          {subtitle}
        </motion.p>
      </motion.div>
    </div>
  )
}
