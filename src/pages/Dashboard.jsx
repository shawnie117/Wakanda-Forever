import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useProduct } from '../context/ProductContext'
import { loadCache, CACHE_TYPES } from '../services/cacheService'
import GlassCard from '../components/GlassCard'
import AnalyticsCard from '../components/AnalyticsCard'
import {
  ArrowRight, Zap, BarChart3, TrendingUp, Brain, Settings,
  Globe, Search, CheckCircle, Star, Target,
} from 'lucide-react'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
}
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
}

function getDisplayName(user) {
  if (!user) return ''
  if (user.displayName) return user.displayName
  // Turn "shawnarakal2006@gmail.com" → "Shawnarakal"
  const local = (user.email || '').split('@')[0]
  const stripped = local.replace(/[\d_.\-]+$/g, '')
  return stripped.charAt(0).toUpperCase() + stripped.slice(1) || local
}

export default function Dashboard() {
  const { user } = useAuth()
  const { product, hasProduct } = useProduct()

  // Derive live stats from localStorage cache (no Firestore)
  const stats = useMemo(() => {
    if (!hasProduct) return { totalAnalyses: 0, avgSentiment: 0, avgCompetitor: 0, topFeatures: [], competitors: [] }

    const analysis = loadCache(product.productName, CACHE_TYPES.ANALYSIS)
    const comparison = loadCache(product.productName, CACHE_TYPES.COMPARISON)
    const mi = loadCache(product.productName, CACHE_TYPES.MARKET_INTELLIGENCE)

    const sentimentScore =
      analysis?.sentiment_analysis?.overall_score ??
      mi?.sentimentScore ??
      null

    const competitorScore =
      comparison?.overall_position?.overall_score ??
      mi?.competitorScore ??
      (sentimentScore !== null ? Math.max(0, sentimentScore - 5) : null)

    const features = analysis?.feature_analysis?.extracted_features || mi?.featureMatrix?.map(f => f.feature) || []

    const completedAnalyses = [
      analysis ? 1 : 0,
      comparison ? 1 : 0,
      mi ? 1 : 0,
      loadCache(product.productName, CACHE_TYPES.INSIGHTS) ? 1 : 0,
      loadCache(product.productName, CACHE_TYPES.COMPETITOR_DISCOVERY) ? 1 : 0,
    ].reduce((a, b) => a + b, 0)

    return {
      totalAnalyses: completedAnalyses,
      avgSentiment: sentimentScore !== null ? Math.round(sentimentScore) : 0,
      avgCompetitor: competitorScore !== null ? Math.round(Math.min(99, competitorScore)) : 0,
      topFeatures: features.slice(0, 3),
      competitors: product.competitors || [],
    }
  }, [hasProduct, product])

  const features = [
    { icon: Zap, title: 'Product Analysis', description: 'Analyze customer sentiment with live Groq AI', path: '/analysis', color: 'text-purple-300' },
    { icon: BarChart3, title: 'Competitor Comparison', description: 'Compare against competitors with live AI', path: '/comparison', color: 'text-blue-300' },
    { icon: TrendingUp, title: 'Strategic Insights', description: 'AI recommendations from Groq LLaMA 3.3', path: '/insights', color: 'text-pink-300' },
    { icon: Brain, title: 'AI Assistant', description: 'Chat with LLaMA 3.3 70B about your product', path: '/assistant', color: 'text-green-300' },
    { icon: Globe, title: 'Regional Map', description: 'Geographic market opportunity analysis', path: '/regional-map', color: 'text-cyan-300' },
    { icon: Search, title: 'Competitor Discovery', description: 'Discover real SaaS competitors with AI', path: '/competitor-discovery', color: 'text-orange-300' },
  ]

  const displayName = getDisplayName(user)

  return (
    <motion.main
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="relative container mx-auto px-4 md:px-6 py-12"
    >
      <div className="pointer-events-none absolute -top-10 left-1/2 -translate-x-1/2 w-[420px] h-[260px] bg-purple-600/20 blur-3xl rounded-full" />

      {/* Welcome */}
      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="mb-10 relative z-10">
        <motion.div variants={itemVariants}>
          <h1 className="font-neo tracking-[0.08em] text-xs uppercase text-slate-400 mb-2">Welcome back</h1>
          <h2 className="font-neo tracking-[0.08em] text-3xl md:text-4xl text-slate-50 mb-2">{displayName}</h2>
          <p className="text-slate-400 text-sm md:text-base max-w-xl">Your AI-powered SaaS intelligence platform</p>
        </motion.div>
      </motion.div>

      {/* Setup prompt */}
      {!hasProduct && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="mb-8 p-5 rounded-xl border border-yellow-500/40 bg-yellow-500/10 flex items-center justify-between flex-wrap gap-4">
          <div>
            <p className="text-yellow-200 font-semibold">⚡ Set up your SaaS product to enable live AI analysis</p>
            <p className="text-yellow-400/70 text-sm mt-0.5">Enter your product details once — all pages will use them for live Groq AI.</p>
          </div>
          <Link to="/setup">
            <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
              className="flex items-center gap-2 px-5 py-2.5 bg-yellow-500/20 border border-yellow-400/50 rounded-xl text-yellow-200 font-semibold text-sm">
              <Settings size={16} /> Set Up Now
            </motion.button>
          </Link>
        </motion.div>
      )}

      {/* Product pill */}
      {hasProduct && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-8 flex items-center gap-3 flex-wrap">
          <span className="px-4 py-2 bg-purple-500/20 border border-purple-500/30 rounded-full text-purple-200 text-sm font-medium flex items-center gap-2">
            <Target size={14} /> {product.productName}
            {product.category && <span className="text-purple-400 text-xs">· {product.category}</span>}
          </span>
          {product.businessModel && (
            <span className="px-3 py-1.5 bg-pink-500/15 border border-pink-500/25 rounded-full text-pink-300 text-xs">{product.businessModel}</span>
          )}
          <Link to="/setup" className="text-xs text-slate-500 hover:text-purple-400 transition-colors">Change →</Link>
        </motion.div>
      )}

      {/* Stats — from localStorage cache */}
      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
        <motion.div variants={itemVariants}>
          <AnalyticsCard
            title="AI Analyses Run"
            value={stats.totalAnalyses}
            subtitle={stats.totalAnalyses === 0 ? 'Navigate to any page to auto-generate' : `${stats.totalAnalyses} of 5 analyses completed`}
            Icon={BarChart3}
          />
        </motion.div>
        <motion.div variants={itemVariants}>
          <AnalyticsCard
            title="Sentiment Score"
            value={stats.avgSentiment > 0 ? `${stats.avgSentiment}%` : '—'}
            subtitle={stats.avgSentiment > 0 ? 'Live from Groq AI analysis' : 'Run Analysis page to generate'}
            Icon={TrendingUp}
          />
        </motion.div>
        <motion.div variants={itemVariants}>
          <AnalyticsCard
            title="Market Position"
            value={stats.avgCompetitor > 0 ? `${stats.avgCompetitor}%` : '—'}
            subtitle={stats.avgCompetitor > 0 ? 'vs competitor baseline' : 'Run Comparison to generate'}
            Icon={BarChart3}
          />
        </motion.div>
      </motion.div>

      {/* Live snapshot (shows if we have cache data) */}
      {hasProduct && (stats.topFeatures.length > 0 || stats.competitors.length > 0) && (
        <motion.div variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true }} className="mb-12">
          <motion.h2 variants={itemVariants} className="font-neo tracking-[0.08em] text-sm uppercase text-slate-400 mb-6">
            Product Snapshot
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {stats.topFeatures.length > 0 && (
              <motion.div variants={itemVariants}>
                <GlassCard hoverable={false} className="p-5">
                  <h3 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
                    <Star size={14} className="text-yellow-400" /> AI-Extracted Features
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {stats.topFeatures.map((f, i) => (
                      <span key={i} className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-xs border border-purple-500/30">{f}</span>
                    ))}
                  </div>
                </GlassCard>
              </motion.div>
            )}
            {stats.competitors.length > 0 && (
              <motion.div variants={itemVariants}>
                <GlassCard hoverable={false} className="p-5">
                  <h3 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
                    <CheckCircle size={14} className="text-green-400" /> Tracked Competitors
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {stats.competitors.slice(0, 5).map((c, i) => (
                      <span key={i} className="px-3 py-1 bg-slate-700 text-slate-300 rounded-full text-xs">{c}</span>
                    ))}
                  </div>
                </GlassCard>
              </motion.div>
            )}
          </div>
        </motion.div>
      )}

      {/* Feature cards */}
      <motion.div variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-100px' }} className="mb-16">
        <motion.h2 variants={itemVariants} className="font-neo tracking-[0.08em] text-sm uppercase text-slate-400 mb-3">
          What would you like to do?
        </motion.h2>
        <p className="text-slate-400 text-sm md:text-base mb-8 max-w-xl">
          Jump into analysis, compare competitors, or explore AI powered insights.
        </p>
        <motion.div variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, idx) => (
            <motion.div key={idx} variants={itemVariants}>
              <Link to={feature.path}>
                <GlassCard hoverable className="h-full flex flex-col group cursor-pointer">
                  <div className="p-4 rounded-2xl bg-purple-600/10 w-fit mb-4 group-hover:bg-purple-600/20 group-hover:shadow-[0_0_25px_rgba(147,51,234,0.45)] transition-all">
                    <feature.icon className={`${feature.color} group-hover:scale-110 transition-transform`} size={32} />
                  </div>
                  <h3 className="font-neo tracking-[0.08em] text-sm uppercase text-slate-200 mb-2">{feature.title}</h3>
                  <p className="text-slate-400 flex-grow text-sm">{feature.description}</p>
                  <div className="flex items-center gap-2 text-purple-300 mt-4 font-semibold group-hover:text-purple-200 group-hover:translate-x-1 transition-all">
                    Go <ArrowRight size={16} />
                  </div>
                </GlassCard>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </motion.main>
  )
}
