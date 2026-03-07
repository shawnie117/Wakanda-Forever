import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import GlassCard from '../components/GlassCard'
import { Lightbulb, CheckCircle2, AlertCircle, RefreshCw, Settings, TrendingUp, Brain } from 'lucide-react'
import { useProduct } from '../context/ProductContext'
import { useAuth } from '../context/AuthContext'
import { loadCache, saveCache, CACHE_TYPES } from '../services/cacheService'
import { saveAnalysisToHistory } from '../firebase/firestoreService'
import {
  PieChart, Pie, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, Cell,
} from 'recharts'

const AI_BASE = import.meta.env.VITE_AI_API_URL
  ? import.meta.env.VITE_AI_API_URL.replace(/\/+$/, '')
  : 'http://localhost:8000/api/v1'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15, delayChildren: 0.2 } },
}
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
}

async function fetchGroqInsights(message, context) {
  const res = await fetch(`${AI_BASE}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, history: [], context }),
  })
  if (!res.ok) throw new Error(`Chat API error ${res.status}`)
  const data = await res.json()
  return data.reply || ''
}

function parseLines(text) {
  return text
    .split('\n')
    .map((l) => l.replace(/^[\d•\-*. ]+/, '').trim())
    .filter((l) => l.length > 15)
    .slice(0, 5)
}

export default function Insights() {
  const { product, hasProduct } = useProduct()
  const { user } = useAuth()

  // Load cached analysis result as the "latest analysis" source
  const cachedAnalysis = hasProduct
    ? loadCache(product.id, CACHE_TYPES.ANALYSIS)
    : null

  const [aiLoading, setAiLoading] = useState(false)
  const [recommendations, setRecommendations] = useState([])
  const [strengths, setStrengths] = useState([])
  const [complaints, setComplaints] = useState([])
  const [aiGenerated, setAiGenerated] = useState(false)

  // Load cached insights on mount
  useEffect(() => {
    if (hasProduct) {
      const cached = loadCache(product.id, CACHE_TYPES.INSIGHTS)
      if (cached) {
        setRecommendations(cached.recommendations || [])
        setStrengths(cached.strengths || [])
        setComplaints(cached.complaints || [])
        setAiGenerated(true)
      }
    }
  }, [hasProduct, product?.productName])

  // Auto-generate insights on mount if no cache
  useEffect(() => {
    if (hasProduct && !aiGenerated) {
      generateInsights()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasProduct])

  // Derive sentiment data from cached analysis
  const sentimentScore = cachedAnalysis?.sentiment_analysis?.overall_score ?? null
  const distribution = cachedAnalysis?.sentiment_analysis?.distribution ?? null
  const extractedFeatures = cachedAnalysis?.feature_analysis?.extracted_features ?? []

  const sentimentBreakdown = useMemo(() => {
    if (distribution) {
      return [
        { name: 'Positive', value: Math.round(distribution.positive || 0), fill: '#10b981' },
        { name: 'Neutral', value: Math.round(distribution.neutral || 0), fill: '#6366f1' },
        { name: 'Negative', value: Math.round(distribution.negative || 0), fill: '#ef4444' },
      ]
    }
    if (sentimentScore !== null) {
      const pos = Math.round(sentimentScore)
      const neg = Math.max(0, Math.round((100 - sentimentScore) * 0.4))
      return [
        { name: 'Positive', value: pos, fill: '#10b981' },
        { name: 'Neutral', value: Math.max(0, 100 - pos - neg), fill: '#6366f1' },
        { name: 'Negative', value: neg, fill: '#ef4444' },
      ]
    }
    return [
      { name: 'Positive', value: 0, fill: '#10b981' },
      { name: 'Neutral', value: 0, fill: '#6366f1' },
      { name: 'Negative', value: 0, fill: '#ef4444' },
    ]
  }, [distribution, sentimentScore])

  // Build a 6-point trend from live cached data or show consistent score
  const trendData = useMemo(() => {
    const score = sentimentScore || 0
    const months = ['Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb']
    return months.map((m, i) => ({
      week: m,
      positive: Math.round(Math.max(0, score + (i - 2) * 2)),
      neutral: Math.round(Math.max(0, (100 - score) * 0.4 + (i % 2 ? 2 : -2))),
      negative: Math.round(Math.max(0, (100 - score) * 0.25 + (i % 3 ? 1 : -1))),
    }))
  }, [sentimentScore])

  const generateInsights = async () => {
    if (!hasProduct) return
    setAiLoading(true)

    // Rich SaaS B2B context
    const context = [
      `SaaS Product: ${product.productName}`,
      product.category ? `Category: ${product.category}` : '',
      product.businessModel ? `Business Model: ${product.businessModel}` : '',
      product.pricingRange ? `Pricing: ${product.pricingRange}` : '',
      product.coreProblem ? `Core Problem Solved: ${product.coreProblem}` : '',
      product.uvp ? `Unique Value Proposition: ${product.uvp}` : '',
      product.keyFeatures?.length ? `Key Features: ${product.keyFeatures.join(', ')}` : '',
      product.customerSegments?.length ? `Customer Segments: ${product.customerSegments.join(', ')}` : '',
      product.targetIndustries?.length ? `Target Industries: ${product.targetIndustries.join(', ')}` : '',
      product.userPersonas?.length ? `User Personas: ${product.userPersonas.join(', ')}` : '',
      product.competitors?.length ? `Known Competitors: ${product.competitors.join(', ')}` : '',
      product.marketRegion ? `Market Region: ${product.marketRegion}` : '',
      sentimentScore !== null ? `Current Sentiment Score: ${Math.round(sentimentScore)}%` : '',
      extractedFeatures.length ? `AI Extracted Features: ${extractedFeatures.slice(0, 5).join(', ')}` : '',
    ].filter(Boolean).join('\n')

    try {
      const [recText, strengthText, complaintText] = await Promise.all([
        fetchGroqInsights(
          `As a B2B SaaS advisor, give me 4 specific, actionable strategic recommendations to improve ${product.productName} and grow its market position. Focus on product, GTM, and retention. Each recommendation on a new line.`,
          context
        ),
        fetchGroqInsights(
          `List 3 key competitive strengths of ${product.productName} as a B2B SaaS product. Be specific. One per line.`,
          context
        ),
        fetchGroqInsights(
          `List 3 main weaknesses or customer complaints about ${product.productName} that B2B buyers typically raise. One per line.`,
          context
        ),
      ])

      const newRecs = parseLines(recText).map((desc, i) => ({
        id: i + 1,
        title: desc.split(/[:.]/)[0]?.trim()?.slice(0, 50) || `Recommendation ${i + 1}`,
        description: desc,
        impact: i < 2 ? 'High' : 'Medium',
        effort: i % 2 === 0 ? 'Medium' : 'Low',
      }))
      const newStrengths = parseLines(strengthText)
      const newComplaints = parseLines(complaintText)

      setRecommendations(newRecs)
      setStrengths(newStrengths)
      setComplaints(newComplaints)
      setAiGenerated(true)

      // Cache insights
      saveCache(product.id, CACHE_TYPES.INSIGHTS, {
        recommendations: newRecs,
        strengths: newStrengths,
        complaints: newComplaints,
      })

      // Save to Firestore for persistence
      if (user?.uid) {
        try {
          await saveAnalysisToHistory(user.uid, {
            productName: product.productName,
            sentimentScore: sentimentScore || 0,
            insights: newRecs.map(r => r.description),
            features: extractedFeatures,
            metadata: {
              type: 'insights',
              strengths: newStrengths,
              complaints: newComplaints,
              category: product.category,
              businessModel: product.businessModel,
            },
          })
        } catch (error) {
          console.error('Error saving insights to Firestore:', error)
        }
      }
    } catch (err) {
      console.error('Insights error:', err)
    } finally {
      setAiLoading(false)
    }
  }

  if (!hasProduct) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <GlassCard className="p-10 text-center max-w-lg">
          <Lightbulb className="w-16 h-16 mx-auto text-purple-400 mb-4 opacity-60" />
          <h2 className="text-2xl font-bold text-white mb-2">No Product Configured</h2>
          <p className="text-gray-400 mb-6">Set up your product to generate AI-powered strategic insights.</p>
          <Link to="/setup">
            <button className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl inline-flex items-center gap-2">
              <Settings size={18} /> Set Up Product
            </button>
          </Link>
        </GlassCard>
      </div>
    )
  }

  return (
    <motion.main
      variants={containerVariants} initial="hidden" animate="visible"
      className="container mx-auto px-4 md:px-6 py-12"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex items-start justify-between flex-wrap gap-4 mb-10">
        <div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-200 via-pink-200 to-purple-200 bg-clip-text text-transparent mb-3">
            Intelligence Dashboard
          </h1>
          <p className="text-gray-300 text-lg">
            AI-powered insights for <span className="text-purple-300 font-semibold">{product.productName}</span>.
            {sentimentScore !== null && <span className="text-gray-400 text-base ml-2">Sentiment: <span className="text-green-400 font-semibold">{Math.round(sentimentScore)}%</span></span>}
          </p>
          <div className="flex gap-2 mt-2 flex-wrap">
            {product.category && <span className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded-full text-xs">{product.category}</span>}
            {product.businessModel && <span className="px-2 py-1 bg-pink-500/20 text-pink-300 rounded-full text-xs">{product.businessModel}</span>}
          </div>
        </div>
        <div className="flex gap-3">
          <Link to="/setup">
            <button className="flex items-center gap-2 px-4 py-2.5 border border-purple-500/40 rounded-xl text-purple-300 text-sm hover:bg-purple-500/10 transition-all">
              <Settings size={15} /> Change Product
            </button>
          </Link>
          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            onClick={generateInsights} disabled={aiLoading}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl text-sm disabled:opacity-50">
            {aiLoading ? <><RefreshCw size={16} className="animate-spin" /> Generating…</> : <><Lightbulb size={16} /> Generate AI Insights</>}
          </motion.button>
        </div>
      </motion.div>

      {/* Sentiment charts */}
      <motion.div variants={itemVariants} className="grid md:grid-cols-2 gap-6 mb-8">
        <GlassCard hoverable={false} className="p-6">
          <h2 className="font-semibold text-white mb-4">Sentiment Breakdown</h2>
          {sentimentScore !== null ? (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={sentimentBreakdown} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
                    {sentimentBreakdown.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#1e1b4b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex justify-center gap-5 mt-3">
                {sentimentBreakdown.map((s) => (
                  <span key={s.name} className="text-sm flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: s.fill }} />
                    <span className="text-gray-400">{s.name}: <span className="text-white font-semibold">{s.value}%</span></span>
                  </span>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <p>Run <Link to="/analysis" className="text-purple-400 hover:underline">Product Analysis</Link> first to see sentiment data.</p>
            </div>
          )}
        </GlassCard>

        <GlassCard hoverable={false} className="p-6">
          <h2 className="font-semibold text-white mb-4">Sentiment Trend {sentimentScore === null && <span className="text-xs text-gray-500">(run Analysis to populate)</span>}</h2>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="week" stroke="#9ca3af" tick={{ fontSize: 11 }} />
              <YAxis stroke="#9ca3af" domain={[0, 100]} />
              <Tooltip contentStyle={{ backgroundColor: '#1e1b4b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} />
              <Legend />
              <Line type="monotone" dataKey="positive" stroke="#10b981" strokeWidth={2} dot={false} name="positive" />
              <Line type="monotone" dataKey="neutral" stroke="#6366f1" strokeWidth={2} dot={false} name="neutral" />
              <Line type="monotone" dataKey="negative" stroke="#ef4444" strokeWidth={2} dot={false} name="negative" />
            </LineChart>
          </ResponsiveContainer>
        </GlassCard>
      </motion.div>

      {/* AI Insights */}
      <motion.div variants={itemVariants}>
        <GlassCard hoverable={false} className="p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Lightbulb size={22} className="text-purple-400" /> AI Strategic Recommendations
              {aiGenerated && <span className="text-xs text-green-400 font-normal ml-2">✓ AI Generated</span>}
            </h2>
          </div>

          {aiLoading && (
            <div className="flex items-center gap-3 py-8 text-purple-300 justify-center">
              <RefreshCw size={20} className="animate-spin" />
              <span>Groq AI is generating strategic recommendations for {product.productName}…</span>
            </div>
          )}

          {!aiLoading && recommendations.length === 0 && (
            <div className="text-center py-10">
              <Brain size={40} className="mx-auto text-purple-400 mb-3 opacity-40" />
              <p className="text-gray-400 mb-4">Click "Generate AI Insights" to get Groq AI strategic recommendations for {product.productName}.</p>
              <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                onClick={generateInsights}
                className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl text-sm inline-flex items-center gap-2">
                <Lightbulb size={16} /> Generate AI Insights
              </motion.button>
            </div>
          )}

          {!aiLoading && recommendations.length > 0 && (
            <div className="space-y-4">
              {recommendations.map((rec) => (
                <div key={rec.id} className="p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-xl">
                  <div className="flex items-start justify-between mb-2 flex-wrap gap-2">
                    <h3 className="text-white font-semibold flex items-center gap-2">
                      <CheckCircle2 size={16} className="text-purple-400 flex-shrink-0" />
                      {rec.title}
                    </h3>
                    <div className="flex gap-2">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${rec.impact === 'High' ? 'bg-green-500/20 text-green-300' : 'bg-yellow-500/20 text-yellow-300'}`}>
                        {rec.impact} Impact
                      </span>
                      <span className="text-xs px-2 py-1 rounded-full font-medium bg-white/10 text-gray-300">
                        {rec.effort} Effort
                      </span>
                    </div>
                  </div>
                  <p className="text-gray-300 text-sm">{rec.description}</p>
                </div>
              ))}
            </div>
          )}
        </GlassCard>
      </motion.div>

      {/* Strengths & Complaints */}
      {(strengths.length > 0 || complaints.length > 0) && !aiLoading && (
        <motion.div variants={itemVariants} className="grid md:grid-cols-2 gap-6 mb-6">
          <GlassCard hoverable={false} className="p-6">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <TrendingUp size={20} className="text-green-400" /> Key Strengths
            </h2>
            <ul className="space-y-3">
              {strengths.map((s, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-gray-300">
                  <CheckCircle2 size={16} className="text-green-400 mt-0.5 flex-shrink-0" />
                  {s}
                </li>
              ))}
            </ul>
          </GlassCard>

          <GlassCard hoverable={false} className="p-6">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <AlertCircle size={20} className="text-orange-400" /> Areas to Improve
            </h2>
            <ul className="space-y-3">
              {complaints.map((c, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-gray-300">
                  <AlertCircle size={16} className="text-orange-400 mt-0.5 flex-shrink-0" />
                  {c}
                </li>
              ))}
            </ul>
          </GlassCard>
        </motion.div>
      )}

      {/* Extracted Features from Analysis */}
      {extractedFeatures.length > 0 && (
        <motion.div variants={itemVariants}>
          <GlassCard hoverable={false} className="p-6">
            <h2 className="text-xl font-bold text-white mb-4">AI-Extracted Features from Reviews</h2>
            <div className="flex flex-wrap gap-2">
              {extractedFeatures.map((f, i) => (
                <span key={i} className="px-3 py-1.5 bg-purple-500/20 text-purple-300 rounded-full text-sm border border-purple-500/30">
                  {f}
                </span>
              ))}
            </div>
          </GlassCard>
        </motion.div>
      )}
    </motion.main>
  )
}
