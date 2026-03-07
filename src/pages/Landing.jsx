import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Zap, BarChart3, TrendingUp, ArrowRight } from 'lucide-react'
import GlassCard from '../components/GlassCard'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.3,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8 },
  },
}

export default function Landing() {
  const features = [
    {
      icon: Zap,
      title: 'Sentiment Intelligence',
      description: 'Analyze customer emotions and feedback patterns with AI-powered precision',
    },
    {
      icon: BarChart3,
      title: 'Competitor Benchmarking',
      description: 'Compare performance metrics and features against market competitors',
    },
    {
      icon: TrendingUp,
      title: 'Strategic Recommendations',
      description: 'Get AI-driven insights to optimize your product strategy',
    },
  ]

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Hero Section */}
      <section className="container mx-auto px-4 md:px-6 py-20 md:py-32 min-h-screen flex flex-col justify-center">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="text-center"
        >
          {/* Main Heading */}
          <motion.h1
            variants={itemVariants}
            className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-purple-200 via-pink-200 to-purple-300 bg-clip-text text-transparent"
          >
            VIBRANIUM
          </motion.h1>

          {/* Subtitle */}
          <motion.h2
            variants={itemVariants}
            className="text-xl md:text-3xl font-semibold text-purple-200 mb-6"
          >
            AI Powered Product Intelligence Engine
          </motion.h2>

          {/* Description */}
          <motion.p
            variants={itemVariants}
            className="text-gray-300 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Unlock comprehensive product intelligence by analyzing customer sentiment, monitoring 
            competitor strategies, and accessing real-time market data. Make data-driven decisions with 
            confidence using our advanced AI analytics platform.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col md:flex-row gap-4 justify-center mb-20"
          >
            <Link to="/analyze">
              <motion.button
                whileHover={{ boxShadow: '0 0 40px rgba(168, 85, 247, 0.8)', scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="group glow-button flex items-center gap-2 mx-auto"
              >
                Start Analysis
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </motion.button>
            </Link>
            <motion.button
              whileHover={{ borderColor: '#ec4899', backgroundColor: 'rgba(236, 72, 153, 0.1)' }}
              whileTap={{ scale: 0.95 }}
              className="glow-button-outline"
            >
              View Demo
            </motion.button>
          </motion.div>
        </motion.div>

        {/* Decorative Elements */}
        <div className="absolute top-32 left-0 w-72 h-72 bg-purple-600/10 rounded-full blur-3xl -z-10"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-pink-600/10 rounded-full blur-3xl -z-10"></div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 md:px-6 py-20">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true, margin: '-100px' }}
        >
          <h2 className="section-title text-center mb-16">
            Enterprise-Grade Analytics Platform
          </h2>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {features.map((feature, idx) => (
              <motion.div key={idx} variants={itemVariants}>
                <GlassCard hoverable={true}>
                  <div className="flex flex-col h-full">
                    <div className="p-4 rounded-xl bg-gradient-to-br from-purple-500/30 to-pink-500/30 w-fit mb-4">
                      <feature.icon className="text-purple-300" size={28} />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                    <p className="text-gray-400 flex-grow">{feature.description}</p>
                    <motion.div
                      whileHover={{ x: 5 }}
                      className="flex items-center gap-2 text-purple-300 mt-4 font-semibold cursor-pointer"
                    >
                      Learn More <ArrowRight size={16} />
                    </motion.div>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 md:px-6 py-20">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="glass p-12 md:p-16 rounded-3xl text-center relative overflow-hidden group"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-pink-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Ready to Transform Your Product Strategy?
            </h2>
            <p className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto">
              Join enterprise companies using VIBRANIUM to drive product innovation and market success.
            </p>
            <Link to="/analyze">
              <motion.button
                whileHover={{ boxShadow: '0 0 40px rgba(168, 85, 247, 0.8)', scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="glow-button text-lg"
              >
                Start Your Analysis Today
              </motion.button>
            </Link>
          </div>
        </motion.div>
      </section>
    </motion.main>
  )
}
