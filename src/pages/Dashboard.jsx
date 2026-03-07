import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore'
import { useAuth } from '../context/AuthContext'
import { db } from '../firebase/firebaseConfig'
import { getCompanyProfile, getProductsByCompany } from '../firebase/firestoreService'
import GlassCard from '../components/GlassCard'
import AnalyticsCard from '../components/AnalyticsCard'
import LoadingOverlay from '../components/LoadingOverlay'
import { ArrowRight, Zap, BarChart3, TrendingUp, Brain, Plus } from 'lucide-react'

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

export default function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [analyses, setAnalyses] = useState([])
  const [products, setProducts] = useState([])
  const [company, setCompany] = useState(null)
  const [stats, setStats] = useState({
    totalAnalyses: 0,
    avgSentiment: 0,
    avgCompetitor: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return

    const fetchData = async () => {
      try {
        const companyProfile = await getCompanyProfile(user.uid)
        setCompany(companyProfile)

        if (companyProfile?.id) {
          const companyProducts = await getProductsByCompany(companyProfile.id)
          setProducts(companyProducts)
        } else {
          setProducts([])
        }

        const q = query(
          collection(db, 'analyses'),
          where('userId', '==', user.uid),
          orderBy('createdAt', 'desc'),
          limit(5)
        )
        const querySnapshot = await getDocs(q)
        const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))

        setAnalyses(data)

        // Calculate stats
        const totalAnalyses = data.length
        const avgSentiment = totalAnalyses
          ? Math.round(
              data.reduce((sum, a) => sum + a.sentimentScore, 0) / totalAnalyses
            )
          : 0
        const avgCompetitor = totalAnalyses
          ? Math.round(
              data.reduce((sum, a) => sum + a.competitorScore, 0) / totalAnalyses
            )
          : 0

        setStats({ totalAnalyses, avgSentiment, avgCompetitor })
      } catch (err) {
        console.error('Error fetching data:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [user])

  const features = [
    {
      icon: Zap,
      title: 'Product Analysis',
      description: 'Analyze customer sentiment and get market insights',
      path: '/analyze',
    },
    {
      icon: BarChart3,
      title: 'Competitor Comparison',
      description: 'Compare your product with competitors',
      path: '/compare',
    },
    {
      icon: TrendingUp,
      title: 'Strategic Insights',
      description: 'Get AI-powered recommendations',
      path: '/insights',
    },
    {
      icon: Brain,
      title: 'AI Assistant',
      description: 'Chat with our AI for detailed analysis',
      path: '/assistant',
    },
  ]

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="relative container mx-auto px-4 md:px-6 py-12"
    >
      {/* Soft background glow behind header */}
      <div className="pointer-events-none absolute -top-10 left-1/2 -translate-x-1/2 w-[420px] h-[260px] bg-purple-600/20 blur-3xl rounded-full" />

      {/* Welcome Section */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="mb-16 relative z-10"
      >
        <motion.div variants={itemVariants}>
          <h1 className="font-neo tracking-[0.08em] text-xs uppercase text-slate-400 mb-2">
            Welcome back
          </h1>
          <h2 className="font-neo tracking-[0.08em] text-3xl md:text-4xl text-slate-50 mb-2">
            {user?.email?.split('@')[0]}
          </h2>
          <p className="text-slate-400 text-sm md:text-base max-w-xl">
            Your AI powered product intelligence dashboard
          </p>
        </motion.div>
      </motion.div>

      {loading ? (
        <div className="relative min-h-[320px]">
          <LoadingOverlay subtitle="LOADING DASHBOARD DATA" />
        </div>
      ) : (
        <>
          {/* Stats Cards */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16"
          >
            <motion.div variants={itemVariants}>
              <AnalyticsCard
                title="Total Analyses"
                value={stats.totalAnalyses}
                subtitle="Product analyses created"
                Icon={BarChart3}
              />
            </motion.div>
            <motion.div variants={itemVariants}>
              <AnalyticsCard
                title="Avg Sentiment"
                value={`${stats.avgSentiment}%`}
                subtitle="Average sentiment score"
                Icon={TrendingUp}
              />
            </motion.div>
            <motion.div variants={itemVariants}>
              <AnalyticsCard
                title="Avg Competitor"
                value={`${stats.avgCompetitor}%`}
                subtitle="Average competitor score"
                Icon={BarChart3}
              />
            </motion.div>
          </motion.div>

          {/* Features Grid */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            className="mb-16"
          >
            <motion.h2
              variants={itemVariants}
            className="font-neo tracking-[0.08em] text-sm uppercase text-slate-400 mb-3"
            >
            What would you like to do?
            </motion.h2>
          <p className="text-slate-400 text-sm md:text-base mb-8 max-w-xl">
            Jump into analysis, compare competitors, or explore AI powered insights.
          </p>
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              {features.map((feature, idx) => (
                <motion.div key={idx} variants={itemVariants}>
                  <Link to={feature.path}>
                    <GlassCard
                      hoverable={true}
                      className="h-full flex flex-col group cursor-pointer"
                    >
                      <div className="p-4 rounded-2xl bg-purple-600/10 w-fit mb-4 group-hover:bg-purple-600/20 group-hover:shadow-[0_0_25px_rgba(147,51,234,0.45)] transition-all">
                        <feature.icon
                          className="text-purple-300 group-hover:scale-110 transition-transform"
                          size={32}
                        />
                      </div>
                      <h3 className="font-neo tracking-[0.08em] text-sm uppercase text-slate-200 mb-2">
                        {feature.title}
                      </h3>
                      <p className="text-slate-400 flex-grow text-sm">
                        {feature.description}
                      </p>
                      <div className="flex items-center gap-2 text-purple-300 mt-4 font-semibold group-hover:text-purple-200 group-hover:translate-x-1 transition-all">
                        Go <ArrowRight size={16} />
                      </div>
                    </GlassCard>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* Recent Analyses */}
          {analyses.length > 0 && (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <motion.h2
                variants={itemVariants}
                className="font-neo tracking-[0.08em] text-sm uppercase text-slate-400 mb-8"
              >
                Recent analyses
              </motion.h2>
              <motion.div
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {analyses.map((analysis) => (
                  <motion.div key={analysis.id} variants={itemVariants}>
                    <GlassCard hoverable={true} className="p-6">
                      <h3 className="text-lg font-bold text-white mb-3">{analysis.product_name}</h3>
                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Sentiment Score</span>
                          <span className="text-purple-300 font-semibold">{analysis.sentiment_score}%</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Competitor Score</span>
                          <span className="text-pink-300 font-semibold">{analysis.competitor_score}%</span>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500">
                        {new Date(analysis.created_at).toLocaleDateString()}
                      </p>
                    </GlassCard>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          )}

          {/* Products Section */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="mt-16"
          >
            <motion.div variants={itemVariants} className="flex items-center justify-between mb-6">
              <div>
                <h2 className="font-neo tracking-[0.08em] text-sm uppercase text-slate-400 mb-2">
                  Products
                </h2>
                <p className="text-slate-400 text-sm">
                  {company?.companyName ? `Manage products for ${company.companyName}` : 'Manage your products'}
                </p>
              </div>
              <button
                onClick={() => navigate('/add-product')}
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white text-sm font-medium flex items-center gap-2"
              >
                <Plus size={16} /> Add Product
              </button>
            </motion.div>

            {products.length === 0 ? (
              <motion.div variants={itemVariants}>
                <GlassCard className="p-6 text-center">
                  <p className="text-slate-300 mb-2">No products added yet.</p>
                  <p className="text-slate-500 text-sm">Click "Add Product" to create your first product.</p>
                </GlassCard>
              </motion.div>
            ) : (
              <motion.div
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {products.map((product) => (
                  <motion.div
                    key={product.id}
                    variants={itemVariants}
                    onClick={() => navigate(`/analysis/${product.id}`)}
                    className="cursor-pointer hover:scale-105 hover:shadow-purple-500/30 hover:shadow-lg transition-all duration-300"
                  >
                    <GlassCard className="p-6 h-full">
                      <h3 className="text-lg font-bold text-white mb-2">{product.productName}</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Category</span>
                          <span className="text-slate-200">{product.category || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Primary Market</span>
                          <span className="text-slate-200">{product.primaryMarket || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Platforms</span>
                          <span className="text-purple-300 font-semibold">
                            {Array.isArray(product.platforms) ? product.platforms.length : 0}
                          </span>
                        </div>
                      </div>
                    </GlassCard>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </motion.div>
        </>
      )}
    </motion.main>
  )
}
