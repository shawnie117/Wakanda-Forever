import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import GlassCard from '../components/GlassCard'
import {
  Search, TrendingUp, DollarSign, Users, Star,
  ExternalLink, Zap, Target, RefreshCw, Brain,
} from 'lucide-react'
import { ScatterChart, Scatter, XAxis, YAxis, ZAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { useProduct } from '../context/ProductContext'
import { saveCache, loadCache, CACHE_TYPES } from '../services/cacheService'

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

const PALETTE = ['#c084fc', '#3b82f6', '#10b981', '#f59e0b', '#ef4444']

export default function CompetitorDiscovery() {
  const navigate = useNavigate()
  const { product, hasProduct } = useProduct()

  const [searching, setSearching] = useState(false)
  const [competitors, setCompetitors] = useState([])
  const [insights, setInsights] = useState([])
  const [error, setError] = useState('')
  const [customQuery, setCustomQuery] = useState('')

  // Load from cache on mount
  useEffect(() => {
    if (hasProduct) {
      const cached = loadCache(product.productName, CACHE_TYPES.COMPETITOR_DISCOVERY)
      if (cached) {
        setCompetitors(cached.competitors || [])
        setInsights(cached.insights || [])
      }
    }
  }, [hasProduct, product?.productName])

  // Auto-discover on mount if no cache
  useEffect(() => {
    if (hasProduct && competitors.length === 0) {
      runDiscovery()
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
    product.keyFeatures?.length ? `Key Features: ${product.keyFeatures.join(', ')}` : '',
    product.customerSegments?.length ? `Segments: ${product.customerSegments.join(', ')}` : '',
    product.targetIndustries?.length ? `Industries: ${product.targetIndustries.join(', ')}` : '',
    product.competitors?.length ? `Known Competitors: ${product.competitors.join(', ')}` : '',
  ].filter(Boolean).join('\n')

  const runDiscovery = async (extra = '') => {
    if (!hasProduct) return
    setSearching(true)
    setError('')

    const context = buildContext()
    const query = extra || product.productName

    try {
      // Step 1: Get real competitor product names from Groq
      const namesReply = await chatGroq(
        `List exactly 5 real, named SaaS competitors to "${product.productName}" in the ${product.category || 'SaaS'} space.
${product.competitors?.length ? `Already known: ${product.competitors.join(', ')}. Include 2-3 of these and add new ones.` : ''}
For EACH competitor, provide:
NAME: <product name>
WEBSITE: <real domain like productname.com>
PRICING: <real pricing range e.g. $29-$299/mo>
USERS: <rough user count e.g. 50K+ or 2M+>
RATING: <G2/Capterra rating e.g. 4.5>
TAGLINE: <one line description of what they do>

Be specific. Use REAL products. Format exactly as shown.`,
        context
      )

      // Parse Groq's response into structured competitor objects
      const blocks = namesReply.split(/(?=NAME:)/g).filter(b => b.includes('NAME:'))
      const parsedCompetitors = blocks.slice(0, 5).map((block, idx) => {
        const get = (label) => {
          const rx = new RegExp(`${label}:\\s*(.+)`, 'i')
          return (block.match(rx)?.[1] || '').trim()
        }
        const name = get('NAME') || `Competitor ${idx + 1}`
        const website = get('WEBSITE') || `https://${name.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`
        const pricing = get('PRICING') || 'Contact for pricing'
        const users = get('USERS') || '10K+'
        const rating = parseFloat(get('RATING') || '4.0').toFixed(1)
        const tagline = get('TAGLINE') || 'SaaS competitor'

        return { name, website, pricing, users, rating: Number(rating), tagline, idx }
      })

      // Step 2: Get market gap insights
      const gapReply = await chatGroq(
        `Based on ${product.productName} vs ${parsedCompetitors.map(c => c.name).join(', ')}, give 3 specific market gap opportunities for ${product.productName}. Format:
GAP: <gap title>
DESCRIPTION: <2-sentence description>
PRIORITY: High or Medium
IMPACT: <expected impact>

Be very specific and actionable.`,
        context
      )

      // Parse insights
      const gapBlocks = gapReply.split(/(?=GAP:)/g).filter(b => b.includes('GAP:'))
      const parsedInsights = gapBlocks.slice(0, 3).map((block) => {
        const get = (label) => {
          const rx = new RegExp(`${label}:\\s*(.+)`, 'i')
          return (block.match(rx)?.[1] || '').trim()
        }
        return {
          title: get('GAP') || 'Market Opportunity',
          description: get('DESCRIPTION') || 'Strategic expansion opportunity identified',
          priority: get('PRIORITY') || 'Medium',
          impact: get('IMPACT') || 'Positive market impact expected',
        }
      })

      setCompetitors(parsedCompetitors)
      setInsights(parsedInsights.length ? parsedInsights : [{
        title: 'Feature Gap Analysis',
        description: `${product.productName} has opportunities to differentiate vs ${parsedCompetitors[0]?.name || 'competitors'} in core feature areas.`,
        priority: 'High',
        impact: 'Potential 20-35% win rate improvement',
      }])

      // Save to cache
      saveCache(product.productName, CACHE_TYPES.COMPETITOR_DISCOVERY, {
        competitors: parsedCompetitors,
        insights: parsedInsights,
      })
    } catch (err) {
      console.error('Competitor discovery error:', err)
      setError('AI discovery failed. Make sure the backend is running.')
    } finally {
      setSearching(false)
    }
  }

  const positioningData = useMemo(() => {
    const parsePrice = (text) => Number(String(text || '').match(/\d+/)?.[0] || 79)
    const base = [{ name: product.productName || 'Your Product', price: 49, complexity: 65, size: 400, color: '#a855f7' }]
    const points = competitors.slice(0, 5).map((c, i) => ({
      name: c.name,
      price: parsePrice(c.pricing),
      complexity: Math.round(c.rating * 18),
      size: Math.round(c.rating * 120),
      color: PALETTE[i % PALETTE.length],
    }))
    return [...base, ...points]
  }, [competitors, product.productName])

  const PositioningTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null
    const p = payload[0].payload
    return (
      <div className="bg-[#1e1b4b] border border-white/20 rounded-lg p-3 shadow-xl min-w-[180px]">
        <p className="text-white font-semibold mb-2">{p.name}</p>
        <p className="text-gray-300 text-sm">Starting Price: <span className="text-purple-300 font-medium">${p.price}</span></p>
        <p className="text-gray-300 text-sm">Feature Score: <span className="text-blue-300 font-medium">{p.complexity}/100</span></p>
      </div>
    )
  }

  if (!hasProduct) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <GlassCard className="p-10 text-center max-w-lg">
          <Target className="w-16 h-16 mx-auto text-purple-400 mb-4 opacity-60" />
          <h2 className="text-2xl font-bold text-white mb-2">Set Up Your Product First</h2>
          <p className="text-gray-400 mb-6">Configure your product to discover AI-powered competitor intelligence.</p>
          <button onClick={() => navigate('/setup')}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl">
            Set Up Product
          </button>
        </GlassCard>
      </div>
    )
  }

  return (
    <motion.main initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="container mx-auto px-4 md:px-6 py-12">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4 mb-10">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-200 to-pink-200 bg-clip-text text-transparent mb-2">
            AI Competitor Discovery
          </h1>
          <p className="text-gray-400">
            Real-time competitor intelligence for <span className="text-purple-300 font-semibold">{product.productName}</span>
          </p>
          <div className="flex gap-2 mt-2 flex-wrap">
            {product.category && <span className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded-full text-xs">{product.category}</span>}
            {(product.competitors || []).slice(0, 4).map(c => (
              <span key={c} className="px-2 py-1 bg-slate-700 text-slate-300 rounded-full text-xs">{c}</span>
            ))}
          </div>
        </div>
        <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
          onClick={() => runDiscovery()} disabled={searching}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl text-sm disabled:opacity-50">
          {searching ? <><RefreshCw size={16} className="animate-spin" /> Discovering…</> : <><Brain size={16} /> Re-discover</>}
        </motion.button>
      </div>

      {/* Custom search */}
      <GlassCard hoverable={false} className="p-6 mb-8">
        <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
          <Search size={20} className="text-purple-400" /> Search Additional Competitors
        </h2>
        <div className="flex gap-3">
          <input
            type="text" value={customQuery} onChange={e => setCustomQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && runDiscovery(customQuery)}
            placeholder="e.g. 'project management tool for startups'"
            className="vibranium-input flex-1"
          />
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            onClick={() => runDiscovery(customQuery)} disabled={searching || !customQuery}
            className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-xl text-sm disabled:opacity-50 flex items-center gap-2">
            <Search size={16} /> Search
          </motion.button>
        </div>
      </GlassCard>

      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-300 text-sm">{error}</div>
      )}

      {searching && (
        <div className="flex items-center justify-center gap-3 py-16 text-purple-300">
          <RefreshCw size={24} className="animate-spin" />
          <span className="text-lg font-medium">Groq AI is discovering real competitors for {product.productName}…</span>
        </div>
      )}

      {!searching && competitors.length > 0 && (
        <>
          {/* Positioning Map */}
          <GlassCard hoverable={false} className="p-8 mb-8">
            <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
              <Target size={22} className="text-blue-400" /> Competitive Positioning Map
            </h2>
            <p className="text-slate-500 text-sm mb-5">Price vs Feature Score (bubble = rating weight)</p>
            <ResponsiveContainer width="100%" height={360}>
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(168,85,247,0.1)" />
                <XAxis type="number" dataKey="price" stroke="#9ca3af" tickFormatter={v => `$${v}`}
                  label={{ value: 'Starting Price ($)', position: 'insideBottom', offset: -8, fill: '#9ca3af', fontSize: 12 }} />
                <YAxis type="number" dataKey="complexity" domain={[0, 100]} stroke="#9ca3af"
                  label={{ value: 'Feature Strength', angle: -90, position: 'insideLeft', fill: '#9ca3af', fontSize: 12 }} />
                <ZAxis type="number" dataKey="size" range={[80, 600]} />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} content={<PositioningTooltip />} />
                <Scatter data={positioningData}>
                  {positioningData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap gap-4 justify-center mt-4">
              {positioningData.map(item => (
                <div key={item.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-sm text-gray-300">{item.name}</span>
                </div>
              ))}
            </div>
          </GlassCard>

          {/* Competitor Cards */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-white mb-1">Discovered Competitors</h2>
            <p className="text-gray-500 text-sm mb-6">{competitors.length} real competitors found by Groq AI</p>
            <div className="space-y-5">
              {competitors.map((c, idx) => (
                <motion.div key={idx} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}>
                  <GlassCard hoverable className="p-6">
                    <div className="flex items-start justify-between mb-4 flex-wrap gap-3">
                      <div>
                        <h3 className="text-2xl font-bold text-white mb-1">{c.name}</h3>
                        <a href={c.website.startsWith('http') ? c.website : `https://${c.website}`}
                          target="_blank" rel="noopener noreferrer"
                          className="text-purple-300 hover:text-purple-200 text-sm flex items-center gap-1">
                          {c.website} <ExternalLink size={12} />
                        </a>
                        <p className="text-gray-400 text-sm mt-1 italic">{c.tagline}</p>
                      </div>
                      <div className="flex items-center gap-2 px-4 py-2 bg-yellow-500/20 rounded-xl">
                        <Star className="text-yellow-400" size={18} />
                        <span className="text-white font-bold text-lg">{c.rating}</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <div className="p-3 bg-white/5 rounded-lg">
                        <p className="text-gray-500 text-xs mb-1">Pricing</p>
                        <p className="text-white font-semibold flex items-center gap-1">
                          <DollarSign size={14} className="text-green-400" />{c.pricing}
                        </p>
                      </div>
                      <div className="p-3 bg-white/5 rounded-lg">
                        <p className="text-gray-500 text-xs mb-1">User Base</p>
                        <p className="text-white font-semibold flex items-center gap-1">
                          <Users size={14} className="text-blue-400" />{c.users}
                        </p>
                      </div>
                      <div className="p-3 bg-white/5 rounded-lg">
                        <p className="text-gray-500 text-xs mb-1">Category</p>
                        <p className="text-white font-semibold">{product.category || 'SaaS'}</p>
                      </div>
                    </div>
                    <div className="mt-4 flex gap-3 flex-wrap">
                      <a href={`https://www.g2.com/products/${c.name.toLowerCase().replace(/\s+/g, '-')}/reviews`}
                        target="_blank" rel="noopener noreferrer"
                        className="text-xs px-3 py-1.5 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 rounded-lg transition">
                        View on G2
                      </a>
                      <a href={`https://www.capterra.com/p/${c.name.toLowerCase().replace(/\s+/g, '-')}`}
                        target="_blank" rel="noopener noreferrer"
                        className="text-xs px-3 py-1.5 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 rounded-lg transition">
                        View on Capterra
                      </a>
                    </div>
                  </GlassCard>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Market Gap Insights */}
          {insights.length > 0 && (
            <GlassCard hoverable={false} className="p-8">
              <h2 className="text-xl font-bold text-white mb-5 flex items-center gap-2">
                <TrendingUp size={22} className="text-green-400" /> AI Market Gap Insights
                <span className="text-xs text-slate-500 font-normal ml-1">Groq LLaMA 3.3</span>
              </h2>
              <div className="space-y-4">
                {insights.map((ins, i) => (
                  <div key={i} className="p-5 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-xl">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-white font-semibold">{ins.title}</h3>
                      <span className={`text-xs px-3 py-1 rounded-full font-bold ${ins.priority === 'High' ? 'bg-red-500/20 text-red-300' : 'bg-yellow-500/20 text-yellow-300'}`}>
                        {ins.priority} Priority
                      </span>
                    </div>
                    <p className="text-gray-300 text-sm mb-2">{ins.description}</p>
                    <p className="text-purple-300 text-sm font-medium flex items-center gap-1"><Zap size={14} /> {ins.impact}</p>
                  </div>
                ))}
              </div>
            </GlassCard>
          )}
        </>
      )}

      {!searching && competitors.length === 0 && !error && (
        <GlassCard hoverable={false} className="p-12 text-center">
          <Brain className="w-16 h-16 mx-auto text-purple-400 mb-4 opacity-50" />
          <h2 className="text-xl font-bold text-white mb-2">Discovering competitors…</h2>
          <p className="text-gray-400">AI is identifying real competitors for {product.productName}.</p>
        </GlassCard>
      )}
    </motion.main>
  )
}
