import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore'
import { useAuth } from '../context/AuthContext'
import { db } from '../firebase/firebaseConfig'
import { getSaaSProducts } from '../firebase/firestoreService'
import GlassCard from '../components/GlassCard'
import AnalyticsCard from '../components/AnalyticsCard'
import LoadingOverlay from '../components/LoadingOverlay'
import PrimaryButton from '../components/PrimaryButton'
import { ArrowRight, Zap, BarChart3, TrendingUp, Brain, Plus, Globe, Target } from 'lucide-react'

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
  const [saasProducts, setSaasProducts] = useState([])
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalAnalyses: 0,
    avgSentiment: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return

    const fetchData = async () => {
      try {
        // Fetch SaaS products
        const products = await getSaaSProducts(user.uid)
        setSaasProducts(products)

        // Fetch analysis results
        const q = query(
          collection(db, 'analysis_results'),
          where('userId', '==', user.uid),
          orderBy('createdAt', 'desc'),
          limit(5)
        )
        const querySnapshot = await getDocs(q)
        const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))

        setAnalyses(data)

        // Calculate stats
        const totalProducts = products.length
        const totalAnalyses = data.length
        const avgSentiment = totalAnalyses && data[0]?.sentimentScore
          ? Math.round(
              data.reduce((sum, a) => sum + (a.sentimentScore || 0), 0) / totalAnalyses
            )
          : 0

        setStats({ totalProducts, totalAnalyses, avgSentiment })
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
      title: 'Market Analysis',
      description: 'AI-powered SaaS market intelligence and insights',
      path: '/market-intelligence',
    },
    {
      icon: BarChart3,
      title: 'Competitor Discovery',
      description: 'Find and analyze your SaaS competitors',
      path: '/competitor-discovery',
    },
    {
      icon: TrendingUp,
      title: 'Product Health',
      description: 'Monitor key product metrics and KPIs',
      path: '/product-health',
    },
    {
      icon: Brain,
      title: 'AI Assistant',
      description: 'Chat with AI for strategic insights',
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
            Your AI-powered SaaS intelligence platform
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
                title="SaaS Products"
                value={stats.totalProducts}
                subtitle="Products configured"
                Icon={Target}
              />
            </motion.div>
            <motion.div variants={itemVariants}>
              <AnalyticsCard
                title="Total Analyses"
                value={stats.totalAnalyses}
                subtitle="Intelligence reports generated"
                Icon={BarChart3}
              />
            </motion.div>
            <motion.div variants={itemVariants}>
              <AnalyticsCard
                title="Market Health"
                value={`${stats.avgSentiment}%`}
                subtitle="Average market sentiment"
                Icon={TrendingUp}
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
                Recent Intelligence Reports
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

          {/* SaaS Products Section */}
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
                  Your SaaS Products
                </h2>
                <p className="text-slate-400 text-sm">
                  Manage and analyze your SaaS product portfolio
                </p>
              </div>
              <PrimaryButton
                onClick={() => navigate('/saas-product-setup')}
                className="text-sm"
              >
                <Plus size={16} /> Add SaaS Product
              </PrimaryButton>
            </motion.div>

            {saasProducts.length === 0 ? (
              <motion.div variants={itemVariants}>
                <GlassCard className="p-8 text-center">
                  <div className="mb-4">
                    <Target className="w-16 h-16 mx-auto text-purple-400 opacity-50" />
                  </div>
                  <h3 className="text-slate-200 text-lg font-semibold mb-2">
                    No SaaS Products Yet
                  </h3>
                  <p className="text-slate-400 text-sm mb-6">
                    Add your first SaaS product to start AI-powered market intelligence analysis
                  </p>
                  <PrimaryButton
                    onClick={() => navigate('/saas-product-setup')}
                  >
                    Add Your First Product
                  </PrimaryButton>
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
                {saasProducts.map((product) => (
                  <motion.div
                    key={product.id}
                    variants={itemVariants}
                    onClick={() => navigate(`/market-intelligence/${product.id}`)}
                    className="cursor-pointer hover:scale-105 hover:shadow-purple-500/30 hover:shadow-lg transition-all duration-300"
                  >
                    <GlassCard className="p-6 h-full flex flex-col">
                      <div className="flex items-start justify-between mb-4">
                        <h3 className="text-lg font-bold text-white">{product.productName}</h3>
                        <Globe className="text-purple-400" size={20} />
                      </div>
                      
                      {product.website && (
                        <a
                          href={product.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-xs text-purple-300 hover:text-purple-200 mb-4 truncate"
                        >
                          {product.website}
                        </a>
                      )}

                      <div className="space-y-2 text-sm flex-grow">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Category</span>
                          <span className="text-slate-200">{product.category || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Business Model</span>
                          <span className="text-slate-200">{product.businessModel || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Pricing</span>
                          <span className="text-purple-300 font-semibold">
                            {product.pricingTierRange || 'Not set'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Customer Segment</span>
                          <span className="text-slate-200">{product.targetCustomerSegment || 'N/A'}</span>
                        </div>
                      </div>

                      <button className="mt-4 w-full px-4 py-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 hover:from-purple-500/30 hover:to-pink-500/30 text-purple-300 rounded-lg transition-all text-sm font-medium flex items-center justify-center gap-2">
                        Analyze Product with Vibranium AI <ArrowRight size={16} />
                      </button>
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

