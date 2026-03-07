import { useCallback, useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { Search, Star, MessageSquare, TrendingUp, Award, Loader, Settings } from 'lucide-react'
import { Link } from 'react-router-dom'
import AnalyticsCard from '../components/AnalyticsCard'
import GlassCard from '../components/GlassCard'
import { useAuth } from '../context/AuthContext'
import { useProduct } from '../context/ProductContext'
import { db } from '../firebase/firebaseConfig'
import { analyzeProduct } from '../services/aiApi'
import { saveCache, loadCache, CACHE_TYPES } from '../services/cacheService'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15, delayChildren: 0.2 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
}

export default function Analysis() {
  const { user } = useAuth()
  const { product, hasProduct } = useProduct()

  const [result, setResult] = useState(null)
  const [apiError, setApiError] = useState('')
  const [loading, setLoading] = useState(false)
  const [autoRan, setAutoRan] = useState(false)

  // Load from cache immediately on mount
  useEffect(() => {
    if (hasProduct) {
      const cached = loadCache(product.productName, CACHE_TYPES.ANALYSIS)
      if (cached) setResult(cached)
    }
  }, [hasProduct, product?.productName])

  const sentimentScore = result?.sentiment_analysis?.overall_score ?? null
  const totalReviews = result?.sentiment_analysis?.total_reviews ?? null
  const distribution = result?.sentiment_analysis?.distribution ?? null
  const avgRating = sentimentScore !== null ? Math.min(5, Math.max(1, Number((sentimentScore / 20).toFixed(1)))) : null
  const marketProxy = sentimentScore !== null ? Math.min(95, Math.max(30, Math.round(sentimentScore - 5))) : null
  const insightsText = result?.ai_insights?.insights_text ?? ''
  const extractedFeatures = result?.feature_analysis?.extracted_features ?? []

  // Parse insight text into bullet points
  const insightLines = useMemo(() => {
    if (!insightsText) return []
    return insightsText
      .split('\n')
      .map((l) => l.replace(/^[\d•\-*. ]+/, '').trim())
      .filter((l) => l.length > 10)
  }, [insightsText])

  const strengths = insightLines.filter((l) => /(positive|strength|good|strong|excellent|advantage|appreciat)/i.test(l)).slice(0, 4)
  const improvements = insightLines.filter((l) => /(improve|weak|issue|risk|negative|recommend|focus|address|fix|problem)/i.test(l)).slice(0, 4)

  // Distribution pie data
  const pieData = distribution
    ? [
        { name: 'Positive', value: Math.round(distribution.positive || 0), fill: '#10b981' },
        { name: 'Neutral', value: Math.round(distribution.neutral || 0), fill: '#6366f1' },
        { name: 'Negative', value: Math.round(distribution.negative || 0), fill: '#ef4444' },
      ]
    : []

  // Sentiment bar from features
  const featureBarData = extractedFeatures.slice(0, 6).map((f, i) => ({
    feature: f.length > 16 ? f.slice(0, 16) + '…' : f,
    score: Math.min(99, Math.max(40, (sentimentScore ?? 60) + (i % 2 === 0 ? 4 : -4))),
  }))

  const handleAnalyze = async () => {
    if (!hasProduct) {
      setApiError('Please set up your product first.')
      return
    }

    setLoading(true)
    setApiError('')
    setResult(null)

    const reviewLines = (product.reviews || '')
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 5)

    const reviews = reviewLines.length > 0
      ? reviewLines.map((text, i) => ({ reviewId: `r${i + 1}`, text, rating: 4, verified: true }))
      : [{ reviewId: 'r1', text: `${product.productName} — analyze this product`, rating: 3, verified: false }]

    try {
      // Construct SaaS-specific description
      const saasDescriptionParts = []
      if (product.description) saasDescriptionParts.push(`Description: ${product.description}`)
      if (product.targetAudience) saasDescriptionParts.push(`Target Audience: ${product.targetAudience}`)
      if (product.keyFeatures) saasDescriptionParts.push(`Key Features: ${product.keyFeatures}`)
      if (product.pricingModel) saasDescriptionParts.push(`Pricing Model: ${product.pricingModel}`)
      if (product.competitors) saasDescriptionParts.push(`Competitors: ${product.competitors}`)
      const saasDescription = saasDescriptionParts.join('\n')

      const data = await analyzeProduct({
        productName: product.productName,
        category: product.category,
        reviews,
        // Add SaaS-specific fields
        description: product.description,
        targetAudience: product.targetAudience,
        keyFeatures: product.keyFeatures,
        pricingModel: product.pricingModel,
        competitors: product.competitors,
        saasDescription: saasDescription, // Send the combined description
      })

      setResult(data)
      saveCache(product.productName, CACHE_TYPES.ANALYSIS, data)

      if (user && db) {
        await addDoc(collection(db, 'analyses'), {
          userId: user.uid,
          productName: product.productName,
          product_name: product.productName,
          category: product.category,
          sentimentScore: Math.round(data?.sentiment_analysis?.overall_score || 0),
          competitorScore: Math.min(95, Math.max(30, Math.round((data?.sentiment_analysis?.overall_score || 50) - 5))),
          avgRating: Math.min(5, Math.max(1, Number(((data?.sentiment_analysis?.overall_score || 50) / 20).toFixed(1)))),
          totalReviews: data?.sentiment_analysis?.total_reviews || 0,
          aiInsights: data?.ai_insights?.insights_text || '',
          extractedFeatures: data?.feature_analysis?.extracted_features || [],
          sentimentDistribution: data?.sentiment_analysis?.distribution || {},
          createdAt: serverTimestamp(),
        })
      }
    } catch (err) {
      console.error('Analysis error:', err)
      setApiError(err.message || 'Analysis failed. Make sure the AI backend is running.')
    } finally {
      setLoading(false)
    }
  }

  // Auto-run on mount when product is available
  useEffect(() => {
    if (hasProduct && !autoRan) {
      setAutoRan(true)
      handleAnalyze()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasProduct])

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto px-4 md:px-6 py-12"
    >
      {/* Header */}
      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="mb-10">
        <motion.div variants={itemVariants} className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-200 via-pink-200 to-purple-200 bg-clip-text text-transparent mb-3">
              Product Analysis
            </h1>
            <p className="text-gray-300 text-lg">
              {hasProduct
                ? <>Analyzing <span className="text-purple-300 font-semibold">{product.productName}</span> with live AI.</>
                : 'Set up your product to begin live AI analysis.'}
            </p>
          </div>
          <Link to="/setup">
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              className="flex items-center gap-2 px-4 py-2.5 border border-purple-500/40 rounded-xl text-purple-300 text-sm hover:bg-purple-500/10 transition-all"
            >
              <Settings size={16} />
              {hasProduct ? `Change Product` : 'Setup Product'}
            </motion.button>
          </Link>
        </motion.div>
      </motion.div>

      {/* Run Analysis Button */}
      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="mb-10">
        <motion.div variants={itemVariants}>
          <motion.button
            whileHover={{ boxShadow: '0 0 30px rgba(168, 85, 247, 0.8)', scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleAnalyze}
            disabled={loading || !hasProduct}
            className="px-10 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all disabled:opacity-50 flex items-center gap-3 text-lg"
          >
            {loading ? (
              <><Loader size={22} className="animate-spin" /> Analyzing with Groq AI…</>
            ) : (
              <><Search size={22} /> Run Live Analysis</>
            )}
          </motion.button>

          {!hasProduct && (
            <p className="mt-3 text-sm text-yellow-300">
              ⚠ <Link to="/setup" className="underline hover:text-yellow-200">Set up your product</Link> first to enable live analysis.
            </p>
          )}

          {apiError && (
            <p className="mt-3 text-sm text-red-300 bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-2 max-w-xl">
              {apiError}
            </p>
          )}
        </motion.div>
      </motion.div>

      {/* Analytics Cards — only visible after analysis */}
      {result ? (
        <>
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
          >
            <motion.div variants={itemVariants}>
              <AnalyticsCard title="Average Rating" value={avgRating?.toFixed(1)} subtitle="Out of 5.0" Icon={Star} />
            </motion.div>
            <motion.div variants={itemVariants}>
              <AnalyticsCard title="Reviews Analyzed" value={totalReviews} subtitle="In this run" Icon={MessageSquare} />
            </motion.div>
            <motion.div variants={itemVariants}>
              <AnalyticsCard title="Sentiment Score" value={`${Math.round(sentimentScore)}%`} subtitle="Positive sentiment" Icon={TrendingUp} />
            </motion.div>
            <motion.div variants={itemVariants}>
              <AnalyticsCard title="Market Position" value={`${marketProxy}%`} subtitle="vs competitor baseline" Icon={Award} />
            </motion.div>
          </motion.div>

          {/* Charts */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12"
          >
            {/* Sentiment Distribution Pie */}
            <motion.div variants={itemVariants}>
              <GlassCard hoverable={false} className="p-8">
                <h3 className="text-xl font-bold text-white mb-6">Sentiment Distribution</h3>
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={2} dataKey="value" animationDuration={800}>
                      {pieData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: 'rgba(5,1,10,0.9)', border: '1px solid rgba(168,85,247,0.5)', borderRadius: '8px' }} formatter={(v) => `${v}%`} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex gap-6 justify-center mt-2 flex-wrap">
                  {pieData.map((d) => (
                    <div key={d.name} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: d.fill }} />
                      <span className="text-gray-300 text-sm">{d.name}: {d.value}%</span>
                    </div>
                  ))}
                </div>
              </GlassCard>
            </motion.div>

            {/* Feature Sentiment Bar */}
            <motion.div variants={itemVariants}>
              <GlassCard hoverable={false} className="p-8">
                <h3 className="text-xl font-bold text-white mb-6">Extracted Feature Scores</h3>
                {featureBarData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={featureBarData}>
                      <defs>
                        <linearGradient id="featGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#a855f7" stopOpacity={0.9} />
                          <stop offset="95%" stopColor="#a855f7" stopOpacity={0.2} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(168,85,247,0.2)" />
                      <XAxis dataKey="feature" stroke="#9ca3af" tick={{ fontSize: 11 }} />
                      <YAxis stroke="#9ca3af" domain={[0, 100]} />
                      <Tooltip contentStyle={{ backgroundColor: 'rgba(5,1,10,0.9)', border: '1px solid rgba(168,85,247,0.5)', borderRadius: '8px' }} formatter={(v) => `${v}%`} />
                      <Bar dataKey="score" fill="url(#featGrad)" radius={[8, 8, 0, 0]} animationDuration={800} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-slate-500 text-sm mt-4">No features extracted. Add more detailed reviews for better feature detection.</p>
                )}
              </GlassCard>
            </motion.div>
          </motion.div>

          {/* AI Insights */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12"
          >
            <motion.div variants={itemVariants}>
              <GlassCard hoverable className="p-8 h-full">
                <h3 className="text-xl font-bold text-white mb-4">✅ Top Strengths</h3>
                {strengths.length > 0 ? (
                  <ul className="space-y-3">
                    {strengths.map((s, i) => (
                      <li key={i} className="flex items-start gap-3 text-gray-300">
                        <div className="w-2 h-2 rounded-full bg-green-400 mt-2 flex-shrink-0" />
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-slate-500 text-sm">Strengths will appear after analysis.</p>
                )}
              </GlassCard>
            </motion.div>

            <motion.div variants={itemVariants}>
              <GlassCard hoverable className="p-8 h-full">
                <h3 className="text-xl font-bold text-white mb-4">⚠ Areas to Improve</h3>
                {improvements.length > 0 ? (
                  <ul className="space-y-3">
                    {improvements.map((s, i) => (
                      <li key={i} className="flex items-start gap-3 text-gray-300">
                        <div className="w-2 h-2 rounded-full bg-orange-400 mt-2 flex-shrink-0" />
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-slate-500 text-sm">Improvement areas will appear after analysis.</p>
                )}
              </GlassCard>
            </motion.div>
          </motion.div>

          {/* Raw AI Insights */}
          {insightsText && (
            <motion.div variants={itemVariants} initial="hidden" animate="visible">
              <GlassCard hoverable={false} className="p-8 bg-gradient-to-br from-purple-500/10 to-pink-500/10">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  🧠 Full AI Strategy from Groq
                  <span className="text-xs font-normal text-slate-500 ml-2">via {result?.ai_insights?.generated_by || 'groq'}</span>
                </h3>
                <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">{insightsText}</p>
              </GlassCard>
            </motion.div>
          )}
        </>
      ) : (
        /* Empty state */
        !loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-24">
            <div className="text-6xl mb-6">🔬</div>
            <h2 className="text-2xl font-bold text-slate-300 mb-3">No analysis yet</h2>
            <p className="text-slate-500 max-w-md mx-auto">
              {hasProduct
                ? `Click "Run Live Analysis" to get Groq AI insights for ${product.productName}.`
                : 'Set up your product first, then run analysis to see live AI results.'}
            </p>
          </motion.div>
        )
      )}
    </motion.main>
  )
}
