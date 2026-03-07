import { useEffect, useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate, Link } from 'react-router-dom'
import { GoogleMap, useLoadScript, Marker, InfoWindow } from '@react-google-maps/api'
import { Globe, TrendingUp, MapPin, Target, Zap, RefreshCw, Brain, Settings } from 'lucide-react'
import GlassCard from '../components/GlassCard'
import { useProduct } from '../context/ProductContext'
import { saveCache, loadCache, CACHE_TYPES } from '../services/cacheService'

const AI_BASE = import.meta.env.VITE_AI_API_URL
  ? import.meta.env.VITE_AI_API_URL.replace(/\/+$/, '')
  : 'http://localhost:8000/api/v1'

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''

async function chatAI(message, context = '') {
  const res = await fetch(`${AI_BASE}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, history: [], context }),
  })
  const data = await res.json()
  return data.reply || ''
}

const STATUS_COLORS = {
  High: { bg: 'bg-green-500/10 border-green-400/30', text: 'text-green-300', badge: 'bg-green-500/20 text-green-300', hex: '#10b981' },
  Medium: { bg: 'bg-yellow-500/10 border-yellow-400/30', text: 'text-yellow-300', badge: 'bg-yellow-500/20 text-yellow-300', hex: '#f59e0b' },
  Low: { bg: 'bg-red-500/10 border-red-400/30', text: 'text-red-300', badge: 'bg-red-500/20 text-red-300', hex: '#ef4444' },
}

const mapContainerStyle = { width: '100%', height: '100%', borderRadius: '16px' }
const defaultCenter = { lat: 20, lng: 0 } // center of world map roughly

const darkMapStyle = [
  { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
  { featureType: "administrative.locality", elementType: "labels.text.fill", stylers: [{ color: "#d59563" }] },
  { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#d59563" }] },
  { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#263c3f" }] },
  { featureType: "poi.park", elementType: "labels.text.fill", stylers: [{ color: "#6b9a76" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#38414e" }] },
  { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#212a37" }] },
  { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#9ca5b3" }] },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#746855" }] },
  { featureType: "road.highway", elementType: "geometry.stroke", stylers: [{ color: "#1f2835" }] },
  { featureType: "road.highway", elementType: "labels.text.fill", stylers: [{ color: "#f3d19c" }] },
  { featureType: "transit", elementType: "geometry", stylers: [{ color: "#2f3948" }] },
  { featureType: "transit.station", elementType: "labels.text.fill", stylers: [{ color: "#d59563" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#17263c" }] },
  { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#515c6d" }] },
  { featureType: "water", elementType: "labels.text.stroke", stylers: [{ color: "#17263c" }] },
]

export default function RegionalMarketMap() {
  const navigate = useNavigate()
  const { product, hasProduct } = useProduct()
  const [loading, setLoading] = useState(false)
  const [regions, setRegions] = useState([])
  const [selectedRegion, setSelectedRegion] = useState(null)
  const [error, setError] = useState('')

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
  })

  // Load from cache on mount
  useEffect(() => {
    if (hasProduct) {
      const cached = loadCache(product.id, CACHE_TYPES.REGIONAL)
      if (cached) {
        setRegions(cached)
      }
    }
  }, [hasProduct, product?.productName])

  // Auto-run if no cache
  useEffect(() => {
    if (hasProduct && regions.length === 0 && !loading) {
      runAnalysis()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasProduct])

  const buildContext = () => [
    `SaaS Product: ${product.productName}`,
    product.category ? `Category: ${product.category}` : '',
    product.businessModel ? `Business Model: ${product.businessModel}` : '',
    product.pricingRange ? `Pricing: ${product.pricingRange}` : '',
    product.targetAudience ? `Target Audience: ${product.targetAudience}` : '',
    product.coreProblem ? `Core Problem: ${product.coreProblem}` : '',
    product.uvp ? `UVP: ${product.uvp}` : '',
    product.marketRegion ? `Primary Market: ${product.marketRegion}` : '',
    product.competitors?.length ? `Competitors: ${product.competitors.join(', ')}` : '',
  ].filter(Boolean).join('\n')

  const runAnalysis = async () => {
    if (!hasProduct) return
    setLoading(true)
    setError('')
    setSelectedRegion(null)

    const context = buildContext()

    try {
      const reply = await chatAI(
        `You are a SaaS market expert. Analyze the regional market opportunity for "${product.productName}" across 5 specific key cities or regions globally. 
        YOU MUST provide real, accurate Latitude and Longitude coordinates so they can be plotted on a map.
        
For EACH region, provide format exactly like this:
REGION: <City, Country or Specific Region>
LAT: <latitude as number, e.g. 51.5074>
LNG: <longitude as number, e.g. -0.1278>
OPPORTUNITY: High, Medium, or Low
ADOPTION: <0-100 adoption score>
GROWTH: <growth rate e.g. +15%>
SEGMENT: <best customer segment there, e.g. Enterprise, SMB>
INSIGHT: <1-2 sentence specific market insight about this region for this product>
STRATEGY: <1 sentence GTM recommendation>

Be highly specific.`,
        context
      )

      const blocks = reply.split(/(?=REGION:)/g).filter(b => b.includes('REGION:'))
      const parsedRegions = blocks.slice(0, 5).map((block, idx) => {
        const get = (lbl) => (block.match(new RegExp(`${lbl}:\\s*(.+)`, 'i'))?.[1] || '').trim()
        
        const latStr = get('LAT')
        const lngStr = get('LNG')
        const lat = parseFloat(latStr) || (30 + (idx * 5))
        const lng = parseFloat(lngStr) || (-90 + (idx * 20))
        const adoption = parseInt(get('ADOPTION') || '50', 10)
        
        return {
          id: idx,
          name: get('REGION') || `Hub ${idx + 1}`,
          position: { lat, lng },
          opportunity: get('OPPORTUNITY') || 'Medium',
          adoption: Math.min(100, Math.max(0, adoption)),
          growth: get('GROWTH') || '+10%',
          segment: get('SEGMENT') || 'SMB',
          insight: get('INSIGHT') || 'Market data being analyzed.',
          strategy: get('STRATEGY') || 'Expand marketing presence.',
        }
      })

      const finalRegions = parsedRegions.length > 0 ? parsedRegions : [
        { id: 0, name: 'San Francisco, USA', position: { lat: 37.7749, lng: -122.4194 }, opportunity: 'High', adoption: 85, growth: '+20%', segment: 'Tech Startups', insight: 'Early adopters concentrated here.', strategy: 'Direct sales to Series A+.' },
        { id: 1, name: 'London, UK', position: { lat: 51.5074, lng: -0.1278 }, opportunity: 'High', adoption: 72, growth: '+15%', segment: 'Enterprise', insight: 'Gateway to EU markets.', strategy: 'Partner with local agencies.' },
        { id: 2, name: 'Singapore', position: { lat: 1.3521, lng: 103.8198 }, opportunity: 'Medium', adoption: 60, growth: '+25%', segment: 'SMB', insight: 'Fastest growing SaaS adoption hub.', strategy: 'Launch localized pricing.' }
      ]

      setRegions(finalRegions)
      saveCache(product.id, CACHE_TYPES.REGIONAL, finalRegions)
    } catch (err) {
      console.error('Regional analysis error:', err)
      setError('AI regional analysis failed. Make sure the backend is running.')
    } finally {
      setLoading(false)
    }
  }

  // Generate an SVG marker icon that's tinted based on Opportunity level
  const getMarkerIcon = (opportunity) => {
    const color = STATUS_COLORS[opportunity]?.hex || '#a855f7'
    return {
      path: `M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z`,
      fillColor: color,
      fillOpacity: 1,
      strokeColor: '#fff',
      strokeWeight: 2,
      scale: 1.6,
      anchor: new window.google.maps.Point(12, 22)
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

  return (
    <motion.main
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}
      className="container mx-auto px-4 md:px-6 py-12"
    >
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Globe className="text-purple-400" size={32} />
            <h1 className="text-4xl font-bold text-slate-100">Regional Market Intelligence</h1>
          </div>
          <p className="text-slate-400">
            Interactive AI geographic analysis for <span className="text-purple-300 font-semibold">{product.productName}</span>
          </p>
        </div>
        <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
          onClick={runAnalysis} disabled={loading}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl text-sm disabled:opacity-50">
          {loading ? <><RefreshCw size={16} className="animate-spin" /> Analyzing Maps…</> : <><Brain size={16} /> {regions.length ? 'Re-analyze Regions' : 'Run Map Analysis'}</>}
        </motion.button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-300 text-sm">{error}</div>
      )}

      {loading && (
        <div className="flex items-center justify-center gap-3 py-10 text-purple-300 bg-purple-900/10 border border-purple-500/20 rounded-2xl mb-8">
          <RefreshCw size={24} className="animate-spin" />
          <span className="text-lg font-medium">Vibranium AI is plotting global opportunities...</span>
        </div>
      )}

      {/* Main Content Layout */}
      {!loading && regions.length > 0 && (
        <div className="grid lg:grid-cols-3 gap-6">
          
          {/* Left Side: Map */}
          <GlassCard hoverable={false} className="lg:col-span-2 p-1 overflow-hidden h-[500px] lg:h-[700px]">
            {isLoaded ? (
              <GoogleMap
                mapContainerStyle={mapContainerStyle}
                zoom={2.2}
                center={defaultCenter}
                options={{
                  styles: darkMapStyle,
                  disableDefaultUI: true,
                  zoomControl: true,
                  backgroundColor: '#1E1E2F'
                }}
              >
                {regions.map((region) => (
                  <Marker
                    key={region.id}
                    position={region.position}
                    icon={getMarkerIcon(region.opportunity)}
                    onClick={() => setSelectedRegion(region)}
                    animation={window.google.maps.Animation.DROP}
                  />
                ))}

                {/* Info Window popup when clicking a pin on the map */}
                {selectedRegion && (
                  <InfoWindow
                    position={selectedRegion.position}
                    onCloseClick={() => setSelectedRegion(null)}
                    options={{ pixelOffset: new window.google.maps.Size(0, -35), maxWidth: 300 }}
                  >
                    <div className="p-1 text-slate-800">
                      <h3 className="font-bold text-lg mb-1">{selectedRegion.name}</h3>
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`px-2 py-0.5 rounded text-xs font-bold bg-${STATUS_COLORS[selectedRegion.opportunity]?.hex} text-white`} 
                              style={{ backgroundColor: STATUS_COLORS[selectedRegion.opportunity]?.hex }}>
                          {selectedRegion.opportunity} Opp
                        </span>
                        <span className="text-xs font-semibold text-slate-500">{selectedRegion.growth} Growth</span>
                      </div>
                      <p className="text-sm mb-1"><b>Score:</b> {selectedRegion.adoption}/100</p>
                      <p className="text-xs text-slate-600 line-clamp-3">{selectedRegion.insight}</p>
                    </div>
                  </InfoWindow>
                )}
              </GoogleMap>
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-slate-900 text-slate-500">
                {!GOOGLE_MAPS_API_KEY ? 'VITE_GOOGLE_MAPS_API_KEY is missing.' : 'Loading interactive map...'}
              </div>
            )}
          </GlassCard>

          {/* Right Side: Region List & Detailed Info */}
          <div className="flex flex-col gap-4 h-[500px] lg:h-[700px] overflow-y-auto pr-2 custom-scrollbar">
            <h2 className="text-lg font-bold text-white px-2">Top AI-Identified Markets</h2>
            
            {/* List of regions to click */}
            <div className="flex flex-col gap-3">
              {regions.map((region) => {
                const style = STATUS_COLORS[region.opportunity] || STATUS_COLORS.Medium
                const isSelected = selectedRegion?.id === region.id
                return (
                  <motion.button key={region.id} onClick={() => setSelectedRegion(region)}
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    className={`text-left p-4 rounded-xl border transition-all ${isSelected ? `${style.bg} border-${style.hex}` : 'bg-white/5 border-white/10 hover:bg-white/10'}`}>
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <MapPin size={16} className="text-purple-400 flex-shrink-0" />
                        <h3 className="font-bold text-white text-md">{region.name}</h3>
                      </div>
                      <span className={`text-[10px] uppercase px-2 py-0.5 rounded-full font-bold ${style.badge}`}>
                        {region.opportunity}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-400">Adoption: <span className="font-bold text-white">{region.adoption}%</span></span>
                      <span className="text-green-400 font-semibold">{region.growth}</span>
                    </div>
                  </motion.button>
                )
              })}
            </div>

            {/* Expanded details for selected region */}
            <AnimatePresence mode="wait">
              {selectedRegion && (
                <motion.div
                  key={selectedRegion.id}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4"
                >
                  <GlassCard hoverable={false} className="p-5 border border-purple-500/30 bg-purple-500/5">
                    <div className="flex items-center gap-2 mb-4 pb-3 border-b border-white/10">
                      <Target size={18} className="text-purple-400" />
                      <h4 className="font-bold text-white">Deep Dive: {selectedRegion.name}</h4>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Target Segment</p>
                        <p className="font-semibold text-slate-200">{selectedRegion.segment}</p>
                      </div>

                      <div className="p-3 bg-blue-500/10 rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <Brain size={14} className="text-blue-400" />
                          <span className="text-xs font-bold text-blue-400 uppercase">AI Insight</span>
                        </div>
                        <p className="text-sm text-gray-300">{selectedRegion.insight}</p>
                      </div>

                      <div className="p-3 bg-pink-500/10 rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <Zap size={14} className="text-pink-400" />
                          <span className="text-xs font-bold text-pink-400 uppercase">GTM Strategy</span>
                        </div>
                        <p className="text-sm text-gray-300">{selectedRegion.strategy}</p>
                      </div>
                    </div>
                  </GlassCard>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* CSS for custom scrollbar so the right sidebar looks clean */}
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(255, 255, 255, 0.02); border-radius: 8px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(168, 85, 247, 0.2); border-radius: 8px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(168, 85, 247, 0.4); }
      `}} />
    </motion.main>
  )
}
