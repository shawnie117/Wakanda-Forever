import { motion } from 'framer-motion'

export default function GlassCard({ children, className = '', hoverable = true }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      whileHover={
        hoverable
          ? {
              y: -4,
              scale: 1.02,
            }
          : {}
      }
      className={`glass p-6 cursor-pointer transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/20 hover:border-purple-400/60 hover:bg-white/10 ${className}`}
    >
      {children}
    </motion.div>
  )
}
