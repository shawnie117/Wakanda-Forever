import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import GlassCard from '../components/GlassCard'
import AnalyticsCard from '../components/AnalyticsCard'
import { Check, X, AlertCircle, Download, TrendingUp, BarChart3, Star, Loader, Settings, Plus } from 'lucide-react'
import { compareProducts } from '../services/aiApi'
import { useProduct } from '../context/ProductContext'
import { saveCache, loadCache, CACHE_TYPES } from '../services/cacheService'
import {
  BarChart,
  Bar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15, delayChildren: 0.2 } },
}
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
}

const COLORS = ['#a855f7', '#06b6d4', '#ec4899', '#f59e0b', '#10b981']

export default function Comparison() {
  const { product, hasProduct } = useProduct()

  const [comparisonData, setComparisonData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [competitorInput, setCompetitorInput] = useState('')
  const [extraCompetitors, setExtraCompetitors] = useState([])

  // Load from cache on mount
  useEffect(() => {
    if (hasProduct) {
      const cached = loadCache(product.productName, CACHE_TYPES.COMPARISON)
      if (cached) setComparisonData(cached)
    }
  }, [hasProduct, product?.productName])

  // Merge context competitors with any extras added on this page
  const allCompetitors = useMemo(() => {
    const base = product.competitors || []
    const merged = [...new Set([...base, ...extraCompetitors])]
    return merged.slice(0, 5)
  }, [product.competitors, extraCompetitors])

  const addCompetitor = () => {
    const name = competitorInput.trim()
    if (!name || allCompetitors.includes(name)) { setCompetitorInput(''); return }
    setExtraCompetitors((prev) => [...prev, name])
    setCompetitorInput('')
  }

  const runComparison = async () => {
    if (!hasProduct) { setError('Set up your product first.'); return }
    if (allCompetitors.length === 0) { setError('Add at least one competitor to compare.'); return }

    setLoading(true)
    setError('')
    setComparisonData(null)

    try {
      const result = await compareProducts({
        yourProduct: product.productName,
        competitorNames: allCompetitors.slice(0, 3),
      })
      setComparisonData(result)
      saveCache(product.productName, CACHE_TYPES.COMPARISON, result)
    } catch (err) {
      console.error('Comparison error:', err)
      setError(err.message || 'Comparison failed. Ensure AI backend is running.')
    } finally {
      setLoading(false)
    }
  }

  // Auto-run on mount when product + competitors are available
  useEffect(() => {
    if (hasProduct && allCompetitors.length > 0 && !comparisonData) {
      runComparison()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasProduct])

  // Derived data — all from API response
  const targetSentiment = comparisonData?.sentiment_comparison?.target_sentiment ?? comparisonData?.overall_position?.overall_score ?? null
  const competitorScores = comparisonData?.sentiment_comparison?.competitors || []
  const overallPosition = comparisonData?.overall_position || {}
  const priceComparison = comparisonData?.price_comparison || {}
  const featureGaps = comparisonData?.feature_gaps?.gaps_identified || []
  const insights = comparisonData?.competitive_insights?.competitive_insights || ''
  const strategies = insights
    ? insights.split('\n').map((l) => l.replace(/^[\d•\-*. ]+/, '').trim()).filter((l) => l.length > 8).slice(0, 6)
    : []

  const sentimentBarData = targetSentiment !== null
    ? [
        { name: product.productName, score: Math.round(targetSentiment), fill: '#a855f7' },
        ...competitorScores.slice(0, 3).map((c, i) => ({
          name: c.productName || c.name || `Competitor ${i + 1}`,
          score: Math.round(c.sentimentScore || c.score || 0),
          fill: COLORS[i + 1],
        })),
      ]
    : []

  const radarData = targetSentiment !== null
    ? [
        { category: 'Sentiment', [product.productName]: Math.round(targetSentiment), ...Object.fromEntries(competitorScores.slice(0, 3).map((c, i) => [c.productName || `Comp ${i + 1}`, Math.round(c.sentimentScore || c.score || 0)])) },
        { category: 'Features', [product.productName]: overallPosition.overall_score ?? Math.round(targetSentiment), ...Object.fromEntries(competitorScores.slice(0, 3).map((c, i) => [c.productName || `Comp ${i + 1}`, Math.round((c.sentimentScore || c.score || 0) * 0.9)])) },
        { category: 'Position', [product.productName]: overallPosition.overall_score ?? Math.round(targetSentiment), ...Object.fromEntries(competitorScores.slice(0, 3).map((c, i) => [c.productName || `Comp ${i + 1}`, Math.round((c.sentimentScore || c.score || 0) * 0.95)])) },
      ]
    : []

  const marketScores = targetSentiment !== null
    ? [
        { name: product.productName, score: Math.round(targetSentiment) },
        ...competitorScores.slice(0, 3).map((c, i) => ({ name: c.productName || `Competitor ${i + 1}`, score: Math.round(c.sentimentScore || c.score || 0) })),
      ]
    : []

  const downloadReport = () => {
    const report = [
      'COMPETITIVE ANALYSIS REPORT',
      '===========================',
      `Product: ${product.productName}`,
      `Competitors: ${allCompetitors.join(', ')}`,
      `Overall Position: ${overallPosition.tier || 'Unknown'} (${overallPosition.overall_score ?? '--'}/100)`,
      '',
      'Feature Gaps:',
      ...featureGaps.map((g) => `• ${g}`),
      '',
      'AI Strategic Recommendations:',
      ...strategies.map((s) => `→ ${s}`),
      '',
      `Generated: ${new Date().toLocaleDateString()}`,
    ].join('\n')

    const a = document.createElement('a')
    a.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(report))
    a.setAttribute('download', `comparison_${product.productName.replace(/\s+/g, '_')}_${Date.now()}.txt`)
    a.click()
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
      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="mb-10">
        <motion.div variants={itemVariants} className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-200 via-pink-200 to-purple-200 bg-clip-text text-transparent mb-3">
              Competitive Intelligence
            </h1>
            <p className="text-gray-300 text-lg">
              {hasProduct
                ? <>Comparing <span className="text-purple-300 font-semibold">{product.productName}</span> against your competitors.</>
                : 'Set up your product to run live competitive comparison.'}
            </p>
          </div>
          <Link to="/setup">
            <button className="flex items-center gap-2 px-4 py-2.5 border border-purple-500/40 rounded-xl text-purple-300 text-sm hover:bg-purple-500/10 transition-all">
              <Settings size={16} /> {hasProduct ? 'Change Product' : 'Setup Product'}
            </button>
          </Link>
        </motion.div>
      </motion.div>

      {/* Product + Competitor Config */}
      <motion.div variants={itemVariants} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
        <GlassCard hoverable={false} className="p-8">
          <h2 className="text-lg font-semibold text-white mb-6">Comparison Setup</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <p className="text-sm text-purple-300 font-semibold mb-1">Your Product</p>
              <div className="px-4 py-3 bg-white/5 border border-purple-500/30 rounded-xl text-white font-medium">
                {hasProduct ? product.productName : <span className="text-slate-500">Not set — <Link to="/setup" className="text-purple-400 underline">set up now</Link></span>}
              </div>
            </div>

            <div>
              <p className="text-sm text-purple-300 font-semibold mb-1">Competitors (up to 5)</p>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={competitorInput}
                  onChange={(e) => setCompetitorInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addCompetitor()}
                  placeholder="Add a competitor name…"
                  className="flex-1 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-purple-500 text-white placeholder-slate-500 text-sm"
                />
                <button onClick={addCompetitor} className="px-3 py-2.5 bg-purple-600/40 border border-purple-500/50 rounded-xl text-purple-200 hover:bg-purple-600/60 transition-all">
                  <Plus size={18} />
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {allCompetitors.map((c, i) => (
                  <span key={c} className="px-3 py-1 bg-purple-500/20 border border-purple-500/30 rounded-full text-purple-200 text-sm"
                    style={{ borderColor: COLORS[i % COLORS.length] + '60' }}>
                    {c}
                  </span>
                ))}
                {allCompetitors.length === 0 && (
                  <span className="text-slate-500 text-sm">No competitors — add from setup or type above</span>
                )}
              </div>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.03, boxShadow: '0 0 25px rgba(168,85,247,0.6)' }}
            whileTap={{ scale: 0.97 }}
            onClick={runComparison}
            disabled={loading || !hasProduct}
            className="mt-6 px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? <><Loader size={18} className="animate-spin" /> Running AI Comparison…</> : <><BarChart3 size={18} /> Run Live Comparison</>}
          </motion.button>
        </GlassCard>
      </motion.div>

      {error && <div className="mb-8 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-red-300 text-sm">{error}</div>}

      {/* Results */}
      {comparisonData ? (
        <>
          {/* Overview Cards */}
          <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
            {marketScores.map((s, i) => (
              <motion.div key={i} variants={itemVariants}>
                <AnalyticsCard title={s.name} value={`${s.score}/100`} subtitle={i === 0 ? overallPosition.tier || 'Your position' : 'Competitor'} />
              </motion.div>
            ))}
          </motion.div>

          {/* Charts */}
          <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
            {/* Sentiment Comparison Bar */}
            <motion.div variants={itemVariants}>
              <GlassCard hoverable={false} className="p-8">
                <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                  <TrendingUp size={20} className="text-pink-400" /> Sentiment Scores
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={sentimentBarData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(168,85,247,0.2)" />
                    <XAxis dataKey="name" stroke="#9ca3af" tick={{ fontSize: 11 }} />
                    <YAxis stroke="#9ca3af" domain={[0, 100]} />
                    <Tooltip contentStyle={{ backgroundColor: 'rgba(15,15,26,0.95)', border: '1px solid rgba(168,85,247,0.5)', borderRadius: '8px' }} formatter={(v) => `${v}%`} />
                    <Bar dataKey="score" radius={[8, 8, 0, 0]}>
                      {sentimentBarData.map((entry, i) => (
                        <rect key={i} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </GlassCard>
            </motion.div>

            {/* Radar */}
            <motion.div variants={itemVariants}>
              <GlassCard hoverable={false} className="p-8">
                <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                  <Star size={20} className="text-yellow-400" /> Multi-Dimensional Analysis
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="rgba(168,85,247,0.2)" />
                    <PolarAngleAxis dataKey="category" stroke="#9ca3af" />
                    <PolarRadiusAxis stroke="#9ca3af" domain={[0, 100]} />
                    {marketScores.map((s, i) => (
                      <Radar key={s.name} name={s.name} dataKey={s.name} stroke={COLORS[i]} fill={COLORS[i]} fillOpacity={i === 0 ? 0.5 : 0.25} />
                    ))}
                    <Legend />
                    <Tooltip contentStyle={{ backgroundColor: 'rgba(15,15,26,0.95)', border: '1px solid rgba(168,85,247,0.5)', borderRadius: '8px' }} />
                  </RadarChart>
                </ResponsiveContainer>
              </GlassCard>
            </motion.div>
          </motion.div>

          {/* Feature Gaps */}
          {featureGaps.length > 0 && (
            <motion.div variants={itemVariants} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
              <GlassCard hoverable={false} className="p-8 border-l-4 border-yellow-500">
                <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                  <AlertCircle size={20} className="text-yellow-400" /> Feature Gap Analysis
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-sm font-semibold text-yellow-300 mb-3">Identified Gaps</h4>
                    <div className="space-y-2">
                      {featureGaps.map((gap, i) => (
                        <div key={i} className="flex items-start gap-2 text-red-300 text-sm">
                          <X size={14} className="mt-0.5 flex-shrink-0" />
                          <span>{gap}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="bg-white/5 rounded-lg p-5 border border-yellow-500/30">
                    <h4 className="text-sm font-semibold text-yellow-300 mb-3">Priority Actions</h4>
                    <ul className="space-y-2 text-sm text-gray-300">
                      <li>✓ Evaluate adding missing features</li>
                      <li>✓ Assess market demand for each gap</li>
                      <li>✓ Update product roadmap accordingly</li>
                    </ul>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          )}

          {/* AI Strategy Recommendations */}
          {strategies.length > 0 && (
            <motion.div variants={itemVariants} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
              <GlassCard hoverable={false} className="p-8 bg-gradient-to-br from-purple-500/10 to-pink-500/10">
                <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                  <TrendingUp size={20} className="text-green-400" /> AI Strategic Recommendations
                  <span className="text-xs text-slate-500 font-normal ml-2">via Groq LLaMA</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {strategies.map((s, i) => (
                    <div key={i} className="flex items-start gap-3 p-4 bg-white/5 rounded-lg border border-purple-500/20 hover:border-purple-500/50 transition-colors">
                      <div className="text-green-400 font-bold min-w-fit">→</div>
                      <p className="text-gray-300 text-sm">{s}</p>
                    </div>
                  ))}
                </div>
              </GlassCard>
            </motion.div>
          )}

          {/* Download */}
          <div className="flex justify-center">
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(168,85,247,0.8)' }}
              whileTap={{ scale: 0.95 }}
              onClick={downloadReport}
              className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg"
            >
              <Download size={20} /> Download Report
            </motion.button>
          </div>
        </>
      ) : (
        !loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-24">
            <div className="text-6xl mb-6">⚔️</div>
            <h2 className="text-2xl font-bold text-slate-300 mb-3">No comparison yet</h2>
            <p className="text-slate-500 max-w-md mx-auto">
              {hasProduct
                ? 'Add competitors and click "Run Live Comparison" to get Groq AI competitive analysis.'
                : 'Set up your product first, then compare with competitors.'}
            </p>
          </motion.div>
        )
      )}
    </motion.main>
  )
}
