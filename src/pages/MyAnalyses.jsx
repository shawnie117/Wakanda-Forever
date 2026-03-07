import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore'
import { useAuth } from '../context/AuthContext'
import { db } from '../firebase/firebaseConfig'
import GlassCard from '../components/GlassCard'
import LoadingOverlay from '../components/LoadingOverlay'
import { Calendar, BarChart3, TrendingUp, Eye } from 'lucide-react'

export default function MyAnalyses() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [analyses, setAnalyses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const getDisplayDate = (analysis) => {
    const createdAt = analysis?.createdAt
    if (createdAt?.toDate) {
      return createdAt.toDate().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    }

    const legacyDate = analysis?.created_at || analysis?.date || analysis?.createdOn
    if (legacyDate) {
      const parsed = new Date(legacyDate)
      if (!Number.isNaN(parsed.getTime())) {
        return parsed.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        })
      }
    }

    return 'Recent'
  }

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
      className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900 p-8"
    >
      <div className="max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="mb-12"
      >
        <motion.div variants={itemVariants}>
          <button
            onClick={() => navigate('/dashboard')}
            className="text-gray-400 hover:text-white mb-4"
          >
            ← Back to Dashboard
          </button>
          <p className="font-neo tracking-[0.08em] text-xs uppercase text-slate-400 mb-2">
            Intelligence Archive
          </p>
          <h1 className="font-neo tracking-[0.08em] text-3xl md:text-4xl text-slate-50 mb-2">
            My Analyses
          </h1>
          <p className="text-slate-400 text-sm md:text-base">
            View saved intelligence reports and track product progress over time.
          </p>
        </motion.div>
      </motion.div>

      {loading ? (
        <div className="relative min-h-[320px]">
          <LoadingOverlay subtitle="SYNCING ANALYSES" />
        </div>
      ) : error ? (
        <GlassCard hoverable={false} className="p-6 border-red-500/40">
          <p className="text-red-300 text-sm">{error}</p>
        </GlassCard>
      ) : analyses.length === 0 ? (
        <GlassCard hoverable={false} className="p-12 text-center">
          <BarChart3 className="text-purple-400 mx-auto mb-4" size={48} />
          <h3 className="font-neo tracking-[0.08em] text-sm uppercase text-slate-200 mb-2">No analyses yet</h3>
          <p className="text-slate-400 mb-6 text-sm">Create a SaaS product first, then run Market Intelligence analysis.</p>
          <button
            onClick={() => navigate('/saas-product-setup')}
            className="inline-block px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:shadow-lg transition-all"
          >
            Add SaaS Product
          </button>
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
                      {analysis.productName || analysis.product_name || 'Untitled Product'}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-slate-400">
                      <Calendar size={16} />
                      {getDisplayDate(analysis)}
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
                      <p className="text-xs text-slate-400">Sentiment Score</p>
                      <p className="text-lg font-bold text-purple-300">
                        {Number(analysis.sentimentScore ?? analysis.sentiment_score ?? 0)}%
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-pink-500/20">
                      <BarChart3 size={16} className="text-pink-300" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">Competitor Score</p>
                      <p className="text-lg font-bold text-pink-300">
                        {Number(analysis.competitorScore ?? analysis.competitor_score ?? 0)}%
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
      </div>
    </motion.main>
  )
}


