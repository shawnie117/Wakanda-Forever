import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { getSaaSProducts } from '../firebase/firestoreService'
import GlassCard from '../components/GlassCard'
import PrimaryButton from '../components/PrimaryButton'
import {
  MapPin,
  TrendingUp,
  Users,
  Target,
  AlertCircle,
  CheckCircle,
  ArrowUp,
  ArrowDown,
  Filter,
  Search,
  Zap,
  Globe,
  Activity,
} from 'lucide-react'
import { GoogleMap, Marker, InfoWindow, Circle, useLoadScript } from '@react-google-maps/api'

// Mock regional data - in production, fetch from Firebase
const REGIONAL_DATA = {
  countries: [
    {
      id: 'IN',
      name: 'India',
      center: { lat: 20.5937, lng: 78.9629 },
      zoom: 5,
      regions: [
        {
          id: 'bangalore',
          name: 'Bangalore',
          state: 'Karnataka',
          lat: 12.9716,
          lng: 77.5946,
          adoptionScore: 92,
          popularityScore: 88,
          competitorDensity: 156,
          growthIndicator: 34,
          status: 'leading',
          topProducts: ['Slack', 'Asana', 'Figma', 'Notion'],
          insight: 'High SaaS adoption detected in Bangalore for productivity tools. Tech talent concentration drives platform selection.',
          marketOpportunity: 'Very High',
          timeline: 'Last 30 days',
        },
        {
          id: 'delhi',
          name: 'Delhi',
          state: 'Delhi',
          lat: 28.7041,
          lng: 77.1025,
          adoptionScore: 78,
          popularityScore: 82,
          competitorDensity: 98,
          growthIndicator: 28,
          status: 'emerging',
          topProducts: ['Monday.com', 'HubSpot', 'Zoom', 'Slack'],
          insight: 'Emerging startup ecosystem. Growing demand for enterprise solutions.',
          marketOpportunity: 'High',
          timeline: 'Last 30 days',
        },
        {
          id: 'mumbai',
          name: 'Mumbai',
          state: 'Maharashtra',
          lat: 19.0760,
          lng: 72.8777,
          adoptionScore: 85,
          popularityScore: 79,
          competitorDensity: 134,
          growthIndicator: 22,
          status: 'emerging',
          topProducts: ['Salesforce', 'HubSpot', 'Zendesk', 'Stripe'],
          insight: 'Financial services sector driving SaaS adoption. Healthcare IT expanding.',
          marketOpportunity: 'High',
          timeline: 'Last 30 days',
        },
        {
          id: 'hyderabad',
          name: 'Hyderabad',
          state: 'Telangana',
          lat: 17.3850,
          lng: 78.4867,
          adoptionScore: 88,
          popularityScore: 85,
          competitorDensity: 142,
          growthIndicator: 32,
          status: 'leading',
          topProducts: ['Figma', 'GitHub', 'VS Code', 'Jira'],
          insight: 'Tech hub for software development. Developer tools leading adoption.',
          marketOpportunity: 'Very High',
          timeline: 'Last 30 days',
        },
      ],
    },
    {
      id: 'US',
      name: 'United States',
      center: { lat: 37.0902, lng: -95.7129 },
      zoom: 4,
      regions: [
        {
          id: 'sf_bay',
          name: 'San Francisco Bay Area',
          state: 'California',
          lat: 37.7749,
          lng: -122.4194,
          adoptionScore: 98,
          popularityScore: 96,
          competitorDensity: 342,
          growthIndicator: 18,
          status: 'leading',
          topProducts: ['Slack', 'Figma', 'Stripe', 'GitHub'],
          insight: 'Saturated market with highest SaaS density. Innovation leader.',
          marketOpportunity: 'Medium',
          timeline: 'Last 30 days',
        },
        {
          id: 'seattle',
          name: 'Seattle',
          state: 'Washington',
          lat: 47.6062,
          lng: -122.3321,
          adoptionScore: 91,
          popularityScore: 89,
          competitorDensity: 198,
          growthIndicator: 21,
          status: 'leading',
          topProducts: ['Amazon services', 'Microsoft ecosystem', 'Adobe', 'Slack'],
          insight: 'Enterprise cloud adoption leader. Corporate SaaS spending high.',
          marketOpportunity: 'Medium-High',
          timeline: 'Last 30 days',
        },
        {
          id: 'austin',
          name: 'Austin',
          state: 'Texas',
          lat: 30.2672,
          lng: -97.7431,
          adoptionScore: 84,
          popularityScore: 81,
          competitorDensity: 167,
          growthIndicator: 38,
          status: 'emerging',
          topProducts: ['HubSpot', 'Figma', 'Asana', 'Notion'],
          insight: 'Fastest growing tech hub. Startups and enterprises expanding rapidly.',
          marketOpportunity: 'Very High',
          timeline: 'Last 30 days',
        },
        {
          id: 'denver',
          name: 'Denver',
          state: 'Colorado',
          lat: 39.7392,
          lng: -104.9903,
          adoptionScore: 76,
          popularityScore: 74,
          competitorDensity: 112,
          growthIndicator: 29,
          status: 'emerging',
          topProducts: ['Zoom', 'Slack', 'Asana', 'Monday.com'],
          insight: 'Energy tech and aerospace sector adoption. Emerging opportunity.',
          marketOpportunity: 'High',
          timeline: 'Last 30 days',
        },
      ],
    },
    {
      id: 'SG',
      name: 'Singapore',
      center: { lat: 1.3521, lng: 103.8198 },
      zoom: 10,
      regions: [
        {
          id: 'central_sg',
          name: 'Central Singapore',
          state: 'Singapore',
          lat: 1.3521,
          lng: 103.8198,
          adoptionScore: 94,
          popularityScore: 92,
          competitorDensity: 178,
          growthIndicator: 25,
          status: 'leading',
          topProducts: ['Stripe', 'HubSpot', 'Slack', 'Figma'],
          insight: 'SE Asia fintech hub. High adoption of payment and workflow tools.',
          marketOpportunity: 'High',
          timeline: 'Last 30 days',
        },
      ],
    },
  ],
}

// Color mapping for status
const STATUS_COLORS = {
  leading: { bg: 'bg-green-500/20', border: 'border-green-400/50', text: 'text-green-300', label: '🟢 Leading' },
  emerging: { bg: 'bg-yellow-500/20', border: 'border-yellow-400/50', text: 'text-yellow-300', label: '🟡 Emerging' },
  trailing: { bg: 'bg-red-500/20', border: 'border-red-400/50', text: 'text-red-300', label: '🔴 Trailing' },
}

export default function RegionalMarketMap() {
  const { user } = useAuth()
  const [products, setProducts] = useState([])
  const [selectedCountry, setSelectedCountry] = useState(REGIONAL_DATA.countries[0])
  const [selectedRegion, setSelectedRegion] = useState(REGIONAL_DATA.countries[0].regions[0])
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [mapRef, setMapRef] = useState(null)
  const [infoWindowOpen, setInfoWindowOpen] = useState(null)
  const [filters, setFilters] = useState({
    timeRange: '30days',
    category: 'all',
    competitor: 'all',
    segment: 'all',
  })
  const [searchTerm, setSearchTerm] = useState('')

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  })

  // Fetch user's products
  useEffect(() => {
    if (user) {
      const fetchProducts = async () => {
        try {
          const userProducts = await getSaaSProducts(user.uid)
          setProducts(userProducts)
          if (userProducts.length > 0) {
            setSelectedProduct(userProducts[0])
          }
        } catch (error) {
          console.error('Error fetching products:', error)
        }
      }
      fetchProducts()
    }
  }, [user])

  const handleCountrySelect = useCallback((country) => {
    setSelectedCountry(country)
    setSelectedRegion(country.regions[0])
    setInfoWindowOpen(null)
  }, [])

  const handleRegionSelect = useCallback((region) => {
    setSelectedRegion(region)
    setInfoWindowOpen(region.id)
    if (mapRef) {
      mapRef.panTo({ lat: region.lat, lng: region.lng })
    }
  }, [mapRef])

  const filteredRegions = selectedCountry.regions.filter((region) => {
    const matchesSearch =
      region.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      region.state.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  })

  const getMarkerColor = (status) => {
    switch (status) {
      case 'leading':
        return 'http://maps.google.com/mapfiles/ms/icons/green-dot.png'
      case 'emerging':
        return 'http://maps.google.com/mapfiles/ms/icons/yellow-dot.png'
      case 'trailing':
        return 'http://maps.google.com/mapfiles/ms/icons/red-dot.png'
      default:
        return 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png'
    }
  }

  const getCircleColor = (status) => {
    switch (status) {
      case 'leading':
        return '#22c55e'
      case 'emerging':
        return '#eab308'
      case 'trailing':
        return '#ef4444'
      default:
        return '#8b5cf6'
    }
  }

  if (loadError) return <div className="text-red-500 p-6">Error loading Google Maps</div>
  if (!isLoaded) return <div className="text-slate-400 p-6">Loading map...</div>

  return (
    <div className="min-h-screen vibranium-bg pt-24 pb-12">
      <div className="container mx-auto px-4 md:px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <Globe className="text-purple-400" size={32} />
            <h1 className="text-4xl font-bold text-slate-100">Regional Market Intelligence</h1>
          </div>
          <p className="text-slate-400">
            Visualize and analyze SaaS market performance across geographic regions in real-time
          </p>
        </motion.div>

        {/* Filters Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-6"
        >
          <GlassCard>
            <div className="flex items-center gap-2 mb-4">
              <Filter size={20} className="text-purple-400" />
              <h2 className="text-lg font-semibold text-slate-100">Filters</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm text-slate-400 mb-2">Time Range</label>
                <select
                  value={filters.timeRange}
                  onChange={(e) => setFilters({ ...filters, timeRange: e.target.value })}
                  className="vibranium-input w-full appearance-none bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-slate-100 focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 transition-all"
                >
                  <option value="7days">Last 7 days</option>
                  <option value="30days">Last 30 days</option>
                  <option value="90days">Last 90 days</option>
                  <option value="1year">Last 1 year</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-2">Product Category</label>
                <select
                  value={filters.category}
                  onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                  className="vibranium-input w-full appearance-none bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-slate-100 focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 transition-all"
                >
                  <option value="all">All Categories</option>
                  <option value="productivity">Productivity</option>
                  <option value="saas">SaaS</option>
                  <option value="analytics">Analytics</option>
                  <option value="collaboration">Collaboration</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-2">Competitor</label>
                <select
                  value={filters.competitor}
                  onChange={(e) => setFilters({ ...filters, competitor: e.target.value })}
                  className="vibranium-input w-full appearance-none bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-slate-100 focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 transition-all"
                >
                  <option value="all">All Competitors</option>
                  <option value="direct">Direct Competitors</option>
                  <option value="indirect">Indirect Competitors</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-2">Market Segment</label>
                <select
                  value={filters.segment}
                  onChange={(e) => setFilters({ ...filters, segment: e.target.value })}
                  className="vibranium-input w-full appearance-none bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-slate-100 focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 transition-all"
                >
                  <option value="all">All Segments</option>
                  <option value="enterprise">Enterprise</option>
                  <option value="smb">SMB</option>
                  <option value="startup">Startup</option>
                </select>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left: Map & Region Selector */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-3"
          >
            <GlassCard className="overflow-hidden">
              {/* Country Selector */}
              <div className="mb-4 pb-4 border-b border-white/10">
                <h3 className="text-sm font-semibold text-slate-300 mb-3">Select Region</h3>
                <div className="flex flex-wrap gap-2">
                  {REGIONAL_DATA.countries.map((country) => (
                    <button
                      key={country.id}
                      onClick={() => handleCountrySelect(country)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                        selectedCountry.id === country.id
                          ? 'bg-gradient-to-r from-purple-600 to-purple-500 text-white'
                          : 'bg-white/5 text-slate-300 hover:bg-white/10 border border-white/10'
                      }`}
                    >
                      {country.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Map Container */}
              <div className="mb-4 h-96 rounded-lg overflow-hidden border border-white/10">
                <GoogleMap
                  onLoad={setMapRef}
                  zoom={selectedCountry.zoom}
                  center={selectedCountry.center}
                  mapContainerStyle={{ width: '100%', height: '100%' }}
                  options={{
                    styles: [
                      {
                        elementType: 'geometry',
                        stylers: [{ color: '#0b0b15' }],
                      },
                      {
                        elementType: 'labels.text.stroke',
                        stylers: [{ color: '#0b0b15' }],
                      },
                      {
                        elementType: 'labels.text.fill',
                        stylers: [{ color: '#8b5cf6' }],
                      },
                      {
                        featureType: 'administrative',
                        elementType: 'geometry.stroke',
                        stylers: [{ color: '#8b5cf6' }],
                      },
                      {
                        featureType: 'water',
                        elementType: 'geometry.fill',
                        stylers: [{ color: '#1a1a2e' }],
                      },
                    ],
                  }}
                >
                  {filteredRegions.map((region) => (
                    <div key={region.id}>
                      <Circle
                        center={{ lat: region.lat, lng: region.lng }}
                        radius={15000}
                        options={{
                          fillColor: getCircleColor(region.status),
                          strokeColor: getCircleColor(region.status),
                          strokeOpacity: 0.3,
                          fillOpacity: 0.15,
                        }}
                      />
                      <Marker
                        position={{ lat: region.lat, lng: region.lng }}
                        title={region.name}
                        icon={getMarkerColor(region.status)}
                        onClick={() => handleRegionSelect(region)}
                      >
                        {infoWindowOpen === region.id && (
                          <InfoWindow onCloseClick={() => setInfoWindowOpen(null)}>
                            <div className="text-gray-800 p-2">
                              <h4 className="font-bold">{region.name}</h4>
                              <p className="text-sm">State: {region.state}</p>
                              <p className="text-sm">Adoption: {region.adoptionScore}%</p>
                              <p className="text-sm">Status: {region.status.toUpperCase()}</p>
                            </div>
                          </InfoWindow>
                        )}
                      </Marker>
                    </div>
                  ))}
                </GoogleMap>
              </div>

              {/* Region List */}
              <div>
                <div className="mb-3 flex items-center gap-2">
                  <Search size={16} className="text-purple-400" />
                  <input
                    type="text"
                    placeholder="Search regions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="vibranium-input flex-1 text-sm"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {filteredRegions.map((region) => (
                    <motion.button
                      key={region.id}
                      onClick={() => handleRegionSelect(region)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`p-3 rounded-lg text-left transition ${
                        selectedRegion.id === region.id
                          ? `${STATUS_COLORS[region.status].bg} border ${STATUS_COLORS[region.status].border}`
                          : 'bg-white/5 border border-white/10 hover:bg-white/10'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-semibold text-slate-100">{region.name}</h4>
                        <span className={`text-xs font-bold ${STATUS_COLORS[region.status].text}`}>
                          {STATUS_COLORS[region.status].label}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400">{region.state}</p>
                      <div className="flex gap-4 mt-2 text-xs">
                        <span>📈 Adoption: {region.adoptionScore}%</span>
                        <span>📊 Growth: +{region.growthIndicator}%</span>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>
            </GlassCard>
          </motion.div>

          {/* Right: Insights Panel */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <GlassCard>
              <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                {/* Region Header */}
                <div>
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="text-lg font-bold text-slate-100">{selectedRegion.name}</h3>
                      <p className="text-xs text-slate-400">{selectedRegion.state}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${STATUS_COLORS[selectedRegion.status].bg} ${STATUS_COLORS[selectedRegion.status].text}`}>
                      {STATUS_COLORS[selectedRegion.status].label}
                    </span>
                  </div>
                </div>

                {/* Key Metrics */}
                <div className="space-y-3 py-4 border-t border-b border-white/10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users size={16} className="text-purple-400" />
                      <span className="text-sm text-slate-400">Adoption Score</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-purple-300">{selectedRegion.adoptionScore}%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Target size={16} className="text-purple-400" />
                      <span className="text-sm text-slate-400">Popularity Score</span>
                    </div>
                    <span className="text-lg font-bold text-purple-300">{selectedRegion.popularityScore}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Activity size={16} className="text-purple-400" />
                      <span className="text-sm text-slate-400">Competitor Density</span>
                    </div>
                    <span className="text-lg font-bold text-purple-300">{selectedRegion.competitorDensity}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <TrendingUp size={16} className="text-purple-400" />
                      <span className="text-sm text-slate-400">Growth</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <ArrowUp size={16} className="text-green-400" />
                      <span className="text-lg font-bold text-green-300">+{selectedRegion.growthIndicator}%</span>
                    </div>
                  </div>
                </div>

                {/* Market Opportunity */}
                <div className="bg-yellow-500/10 border border-yellow-400/30 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap size={16} className="text-yellow-300" />
                    <h4 className="text-sm font-semibold text-yellow-300">Market Opportunity</h4>
                  </div>
                  <p className="text-xs text-slate-300">{selectedRegion.marketOpportunity}</p>
                </div>

                {/* AI Insight */}
                <div className="bg-blue-500/10 border border-blue-400/30 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle size={16} className="text-blue-300" />
                    <h4 className="text-sm font-semibold text-blue-300">AI Insight</h4>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">{selectedRegion.insight}</p>
                </div>

                {/* Top Products */}
                <div className="bg-purple-500/10 border border-purple-400/30 rounded-lg p-3">
                  <h4 className="text-sm font-semibold text-purple-300 mb-2">Top SaaS Products</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedRegion.topProducts.map((product, idx) => (
                      <span
                        key={idx}
                        className="text-xs bg-purple-500/30 text-purple-200 px-3 py-1 rounded-full"
                      >
                        {product}
                      </span>
                    ))}
                  </div>
                </div>

                {/* CTA Buttons */}
                <div className="flex gap-2 pt-2">
                  <PrimaryButton className="flex-1 text-xs py-1">
                    <CheckCircle size={14} className="inline mr-1" />
                    Expand
                  </PrimaryButton>
                </div>
              </div>
            </GlassCard>

            {/* Drill-Down Stats */}
            <GlassCard className="mt-4">
              <h3 className="text-sm font-semibold text-slate-300 mb-4">Regional Hierarchy</h3>
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2 text-slate-400">
                  <Globe size={14} className="text-purple-400" />
                  <span>{selectedCountry.name}</span>
                </div>
                <div className="ml-6 flex items-center gap-2 text-slate-400">
                  <MapPin size={14} className="text-purple-400" />
                  <span>{selectedRegion.name}</span>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        </div>

        {/* Drill-Down Levels Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          {[
            { level: 'Country', icon: Globe, desc: 'Select region' },
            { level: 'State', icon: MapPin, desc: 'Regional insights' },
            { level: 'City', icon: Target, desc: 'Drill deeper' },
            { level: 'District', icon: Zap, desc: 'Granular data' },
          ].map((item, idx) => (
            <GlassCard key={idx} hoverable={false}>
              <div className="text-center">
                <item.icon size={24} className="text-purple-400 mx-auto mb-2" />
                <h4 className="text-sm font-semibold text-slate-100 mb-1">{item.level}</h4>
                <p className="text-xs text-slate-400">{item.desc}</p>
              </div>
            </GlassCard>
          ))}
        </motion.div>
      </div>
    </div>
  )
}
