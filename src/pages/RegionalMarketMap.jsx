import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Globe, TrendingUp, MapPin, Target, Zap, RefreshCw, Brain, CheckCircle, AlertCircle, Settings } from 'lucide-react'
import { Link } from 'react-router-dom'
import GlassCard from '../components/GlassCard'
import { useProduct } from '../context/ProductContext'
import { saveCache, loadCache, CACHE_TYPES } from '../services/cacheService'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'

const AI_BASE = import.meta.env.VITE_AI_API_URL
  ? import.meta.env.VITE_AI_API_URL.replace(/\/+$/, '')
  : 'http://localhost:8000/api/v1'

async function chatGroq(message, context = '') {
  const res = await fetch(`${AI_BASE}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, history: [], context }),
  })
  const data = await res.json()
  return data.reply || ''
}

const STATUS_COLORS = {
  High: { bg: 'bg-green-500/10 border-green-400/30', text: 'text-green-300', badge: 'bg-green-500/20 text-green-300', bar: '#10b981' },
  Medium: { bg: 'bg-yellow-500/10 border-yellow-400/30', text: 'text-yellow-300', badge: 'bg-yellow-500/20 text-yellow-300', bar: '#f59e0b' },
  Low: { bg: 'bg-red-500/10 border-red-400/30', text: 'text-red-300', badge: 'bg-red-500/20 text-red-300', bar: '#ef4444' },
}

export default function RegionalMarketMap() {
  const navigate = useNavigate()
  const { product, hasProduct } = useProduct()
  const [loading, setLoading] = useState(false)
  const [regions, setRegions] = useState([])
  const [selectedRegion, setSelectedRegion] = useState(null)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('overview')

  // Load from cache on mount
  useEffect(() => {
    if (hasProduct) {
      const cached = loadCache(product.productName, CACHE_TYPES.REGIONAL)
      if (cached) {
        setRegions(cached)
        setSelectedRegion(cached[0] || null)
      }
    }
  }, [hasProduct, product?.productName])

  // Auto-run if no cache
  useEffect(() => {
    if (hasProduct && regions.length === 0) {
      runAnalysis()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasProduct])

  const buildContext = () => [
    `SaaS Product: ${product.productName}`,
    product.category ? `Category: ${product.category}` : '',
    product.businessModel ? `Business Model: ${product.businessModel}` : '',
    product.pricingRange ? `Pricing: ${product.pricingRange}` : '',
    product.coreProblem ? `Core Problem: ${product.coreProblem}` : '',
    product.uvp ? `UVP: ${product.uvp}` : '',
    product.customerSegments?.length ? `Customer Segments: ${product.customerSegments.join(', ')}` : '',
    product.targetIndustries?.length ? `Target Industries: ${product.targetIndustries.join(', ')}` : '',
    product.marketRegion ? `Primary Market: ${product.marketRegion}` : '',
    product.competitors?.length ? `Competitors: ${product.competitors.join(', ')}` : '',
  ].filter(Boolean).join('\n')

  const runAnalysis = async () => {
    if (!hasProduct) return
    setLoading(true)
    setError('')

    const context = buildContext()

    try {
      const reply = await chatGroq(
        `You are a SaaS market expert. Analyze the regional market opportunity for "${product.productName}" across 6 key geographic markets.
        
For EACH region, provide:
REGION: <region name e.g. North America, Europe, South Asia, Southeast Asia, Middle East & Africa, Latin America>
OPPORTUNITY: High, Medium, or Low
ADOPTION: <0-100 adoption score>
GROWTH: <growth rate e.g. +15%>
SEGMENT: <best customer segment there e.g. Enterprise, SMB, Startup>
INSIGHT: <2-sentence specific market insight about this region for this product>
STRATEGY: <1 sentence GTM recommendation>

Be specific and data-driven. Use real market knowledge.`,
        context
      )

      const blocks = reply.split(/(?=REGION:)/g).filter(b => b.includes('REGION:'))
      const parsedRegions = blocks.slice(0, 6).map((block, idx) => {
        const get = (label) => {
          const rx = new RegExp(`${label}:\\s*(.+)`, 'i')
          return (block.match(rx)?.[1] || '').trim()
        }
        const adoption = parseInt(get('ADOPTION') || '50', 10)
        const opportunity = get('OPPORTUNITY') || 'Medium'
        return {
          id: idx,
          name: get('REGION') || `Region ${idx + 1}`,
          opportunity,
          adoption: Math.min(100, Math.max(0, adoption)),
          growth: get('GROWTH') || '+10%',
          segment: get('SEGMENT') || 'SMB',
          insight: get('INSIGHT') || 'Market data being analyzed.',
          strategy: get('STRATEGY') || 'Expand marketing presence in this region.',
        }
      })

      // Fallback if parsing fails
      const finalRegions = parsedRegions.length > 0 ? parsedRegions : [
        { id: 0, name: product.marketRegion || 'Global', opportunity: 'High', adoption: 65, growth: '+18%', segment: product.customerSegments?.[0] || 'SMB', insight: 'Primary market with highest intent buyers.', strategy: 'Focus GTM efforts here first.' },
      ]

      setRegions(finalRegions)
      setSelectedRegion(finalRegions[0])
      saveCache(product.productName, CACHE_TYPES.REGIONAL, finalRegions)
    } catch (err) {
      console.error('Regional analysis error:', err)
      setError('AI regional analysis failed. Make sure the backend is running.')
    } finally {
      setLoading(false)
    }
  }

  if (!hasProduct) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <GlassCard className="p-10 text-center max-w-lg">
          <Globe className="w-16 h-16 mx-auto text-purple-400 mb-4 opacity-60" />
          <h2 className="text-2xl font-bold text-white mb-2">No Product Configured</h2>
          <p className="text-gray-400 mb-6">Set up your product to get AI-powered regional market intelligence.</p>
          <Link to="/setup">
            <button className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl inline-flex items-center gap-2">
              <Settings size={18} /> Set Up Product
            </button>
          </Link>
        </GlassCard>
      </div>
    )
  }

  const chartData = regions.map(r => ({
    name: r.name.replace('&', '&').split(' ').slice(0, 2).join(' '),
    adoption: r.adoption,
    fill: STATUS_COLORS[r.opportunity]?.bar || '#6366f1',
  }))

  return (
    <motion.main
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}
      className="container mx-auto px-4 md:px-6 py-12"
    >
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4 mb-10">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Globe className="text-purple-400" size={32} />
            <h1 className="text-4xl font-bold text-slate-100">Regional Market Intelligence</h1>
          </div>
          <p className="text-slate-400">
            AI-powered geographic analysis for <span className="text-purple-300 font-semibold">{product.productName}</span>
          </p>
          {product.marketRegion && (
            <span className="inline-flex items-center gap-1 mt-2 px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm">
              <MapPin size={12} /> Primary: {product.marketRegion}
            </span>
          )}
        </div>
        <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
          onClick={runAnalysis} disabled={loading}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl text-sm disabled:opacity-50">
          {loading ? <><RefreshCw size={16} className="animate-spin" /> Analyzing…</> : <><Brain size={16} /> {regions.length ? 'Re-analyze' : 'Run Analysis'}</>}
        </motion.button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-300 text-sm">{error}</div>
      )}

      {loading && (
        <div className="flex items-center justify-center gap-3 py-20 text-purple-300">
          <RefreshCw size={24} className="animate-spin" />
          <span className="text-lg font-medium">Groq AI is analyzing regional markets for {product.productName}…</span>
        </div>
      )}

      {!loading && regions.length > 0 && (
        <>
          {/* Adoption chart */}
          <GlassCard hoverable={false} className="p-8 mb-8">
            <h2 className="text-xl font-bold text-white mb-5">Regional Adoption Scores</h2>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(168,85,247,0.1)" />
                <XAxis dataKey="name" stroke="#9ca3af" tick={{ fontSize: 11 }} />
                <YAxis stroke="#9ca3af" domain={[0, 100]} />
                <Tooltip contentStyle={{ backgroundColor: 'rgba(15,15,26,0.9)', border: '1px solid rgba(168,85,247,0.5)', borderRadius: '8px' }} formatter={v => `${v}%`} />
                <Bar dataKey="adoption" radius={[6, 6, 0, 0]} maxBarSize={60}>
                  {chartData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </GlassCard>

          {/* Region cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
            {regions.map((region) => {
              const style = STATUS_COLORS[region.opportunity] || STATUS_COLORS.Medium
              return (
                <motion.button key={region.id} onClick={() => setSelectedRegion(region)}
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  className={`text-left p-5 rounded-xl border transition-all ${selectedRegion?.id === region.id ? `${style.bg} ${style.badge.split(' ')[0]}/30` : 'bg-white/5 border-white/10 hover:bg-white/10'}`}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <MapPin size={16} className="text-purple-400 flex-shrink-0" />
                      <h3 className="font-bold text-white">{region.name}</h3>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full font-bold ${style.badge}`}>
                      {region.opportunity}
                    </span>
                  </div>
                  <div className="flex gap-4 text-sm mb-2">
                    <span className="text-gray-400">Adoption: <span className={`font-bold ${style.text}`}>{region.adoption}%</span></span>
                    <span className="text-gray-400">Growth: <span className="text-green-300 font-semibold">{region.growth}</span></span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-1.5 mb-2">
                    <div className="h-1.5 rounded-full" style={{ width: `${region.adoption}%`, backgroundColor: style.bar }} />
                  </div>
                  <p className="text-xs text-gray-500">Best segment: {region.segment}</p>
                </motion.button>
              )
            })}
          </div>

          {/* Selected region detail */}
          {selectedRegion && (() => {
            const style = STATUS_COLORS[selectedRegion.opportunity] || STATUS_COLORS.Medium
            return (
              <GlassCard hoverable={false} className={`p-8 border ${style.bg}`}>
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Globe size={22} className="text-purple-400" />
                      <h2 className="text-2xl font-bold text-white">{selectedRegion.name}</h2>
                    </div>
                    <span className={`text-xs px-3 py-1 rounded-full font-bold ${style.badge}`}>
                      {selectedRegion.opportunity} Opportunity
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-white">{selectedRegion.adoption}%</p>
                    <p className="text-sm text-gray-400">Adoption Score</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-5 mb-5">
                  <div className="p-4 bg-white/5 rounded-xl">
                    <p className="text-gray-500 text-xs mb-1">Market Growth</p>
                    <p className="text-2xl font-bold text-green-300">{selectedRegion.growth}</p>
                  </div>
                  <div className="p-4 bg-white/5 rounded-xl">
                    <p className="text-gray-500 text-xs mb-1">Best Segment</p>
                    <p className="text-2xl font-bold text-white">{selectedRegion.segment}</p>
                  </div>
                  <div className="p-4 bg-white/5 rounded-xl">
                    <p className="text-gray-500 text-xs mb-1">Competitors Active</p>
                    <p className="text-2xl font-bold text-white">{(product.competitors || []).length}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="p-4 bg-blue-500/10 border border-blue-400/30 rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <Brain size={16} className="text-blue-300" />
                      <h4 className="text-sm font-semibold text-blue-300">AI Market Insight</h4>
                    </div>
                    <p className="text-gray-300 text-sm leading-relaxed">{selectedRegion.insight}</p>
                  </div>
                  <div className="p-4 bg-purple-500/10 border border-purple-400/30 rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <Zap size={16} className="text-purple-300" />
                      <h4 className="text-sm font-semibold text-purple-300">GTM Strategy</h4>
                    </div>
                    <p className="text-gray-300 text-sm">{selectedRegion.strategy}</p>
                  </div>
                </div>
              </GlassCard>
            )
          })()}
        </>
      )}

      {!loading && regions.length === 0 && !error && (
        <GlassCard hoverable={false} className="p-12 text-center">
          <Globe className="w-20 h-20 mx-auto text-purple-400 mb-6 opacity-40" />
          <h2 className="text-2xl font-bold text-white mb-3">Starting Regional Analysis…</h2>
          <p className="text-gray-400">AI will analyze geographic market opportunities for {product.productName}.</p>
        </GlassCard>
      )}
    </motion.main>
  )
}
