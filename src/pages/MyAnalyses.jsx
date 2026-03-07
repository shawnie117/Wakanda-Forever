import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore'
import { useAuth } from '../context/AuthContext'
import { db } from '../firebase/firebaseConfig'
import GlassCard from '../components/GlassCard'
import { Calendar, BarChart3, TrendingUp, Eye, Loader } from 'lucide-react'

export default function MyAnalyses() {
  const { user } = useAuth()
  const [analyses, setAnalyses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!user) return

    const fetchAnalyses = async () => {
      try {
        const q = query(
          collection(db, 'analyses'),
          where('userId', '==', user.uid),
          orderBy('createdAt', 'desc')
        )
        const querySnapshot = await getDocs(q)
        const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
        setAnalyses(data)
      } catch (err) {
        setError('Failed to fetch analyses')
        console.error('Error fetching analyses:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchAnalyses()
  }, [user])

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  }

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto px-4 md:px-6 py-12"
    >
      {/* Header */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="mb-12"
      >
        <motion.div variants={itemVariants}>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-200 via-pink-200 to-purple-200 bg-clip-text text-transparent mb-4">
            My Analyses
          </h1>
          <p className="text-gray-300 text-lg">
            View all your saved product analyses and insights
          </p>
        </motion.div>
      </motion.div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-12 h-12 border-4 border-purple-500/20 border-t-purple-500 rounded-full"
          />
        </div>
      ) : error ? (
        <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300">
          {error}
        </div>
      ) : analyses.length === 0 ? (
        <GlassCard hoverable={false} className="p-12 text-center">
          <BarChart3 className="text-purple-400 mx-auto mb-4" size={48} />
          <h3 className="text-2xl font-bold text-white mb-2">No analyses yet</h3>
          <p className="text-gray-400 mb-6">Start by creating your first product analysis</p>
          <a
            href="/analyze"
            className="inline-block px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:shadow-lg transition-all"
          >
            Create Analysis
          </a>
        </GlassCard>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {analyses.map((analysis) => (
            <motion.div key={analysis.id} variants={itemVariants}>
              <GlassCard hoverable={true} className="p-6 h-full flex flex-col">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white mb-1">
                      {analysis.productName}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <Calendar size={16} />
                      {new Date(analysis.createdAt.toDate()).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="space-y-3 mb-6 flex-grow">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-purple-500/20">
                      <TrendingUp size={16} className="text-purple-300" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Sentiment Score</p>
                      <p className="text-lg font-bold text-purple-300">
                        {analysis.sentimentScore}%
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-pink-500/20">
                      <BarChart3 size={16} className="text-pink-300" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Competitor Score</p>
                      <p className="text-lg font-bold text-pink-300">
                        {analysis.competitorScore}%
                      </p>
                    </div>
                  </div>
                </div>

                {/* View Button */}
                <motion.button
                  whileHover={{ boxShadow: '0 0 20px rgba(168, 85, 247, 0.4)' }}
                  className="w-full py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-purple-300 font-semibold flex items-center justify-center gap-2 transition-all"
                >
                  <Eye size={16} />
                  View Full Report
                </motion.button>
              </GlassCard>
            </motion.div>
          ))}
        </motion.div>
      )}
    </motion.main>
  )
}
