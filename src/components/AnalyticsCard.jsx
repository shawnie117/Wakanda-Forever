import { motion } from 'framer-motion'

export default function AnalyticsCard({ title, value, subtitle, Icon, className = '' }) {
  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      className={`glass p-6 rounded-2xl flex flex-col items-start justify-between h-full transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/20 hover:border-purple-400/60 hover:bg-white/10 ${className}`}
    >
      <div className="flex items-center gap-3 mb-4">
        {Icon && (
          <div className="p-3 rounded-xl bg-purple-500/15 group-hover:bg-purple-500/25 transition-all shadow-[0_0_18px_rgba(147,51,234,0.35)]">
            <Icon className="text-purple-300 group-hover:scale-110 transition-transform" size={24} />
          </div>
        )}
        <h3 className="font-neo tracking-[0.08em] text-xs uppercase text-slate-300">
          {title}
        </h3>
      </div>
      <div className="flex flex-col">
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="text-3xl md:text-4xl font-semibold text-slate-50"
        >
          {value}
        </motion.div>
        {subtitle && <p className="text-slate-400 text-xs mt-2">{subtitle}</p>}
      </div>
    </motion.div>
  )
}
