import { useEffect, useMemo, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  GoogleMap,
  useJsApiLoader,
  HeatmapLayer,
  Marker,
  InfoWindow,
} from '@react-google-maps/api'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Cell,
} from 'recharts'
import {
  Filter,
  MapPinned,
  TrendingUp,
  Activity,
  Radar,
  ZoomIn,
  ZoomOut,
  RotateCcw,
} from 'lucide-react'
import GlassCard from '../components/GlassCard'
import regionSales from '../datasets/region_sales.json'
import productReviews from '../datasets/product_reviews.json'
import competitorData from '../datasets/competitor_data.json'

const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY

const mapContainerStyle = {
  width: '100%',
  height: '100%',
  borderRadius: '12px',
}

const center = {
  lat: 20.5937,
  lng: 78.9629,
}

const timeRanges = ['Q1 2026', 'Q2 2026']

const regionOrder = ['Delhi NCR', 'Maharashtra', 'Telangana', 'Karnataka', 'Tamil Nadu']

// Region coordinates for heatmap
const regionCoordinates = {
  'Delhi NCR': [
    { lat: 28.7041, lng: 77.1025, weight: 45 }, // Delhi center
    { lat: 28.6139, lng: 77.209, weight: 35 },  // Noida
    { lat: 28.5355, lng: 77.391, weight: 28 },  // Ghaziabad
  ],
  Maharashtra: [
    { lat: 19.0759, lng: 72.8776, weight: 38 }, // Mumbai 
    { lat: 19.8762, lng: 75.3433, weight: 22 }, // Aurangabad
    { lat: 18.5204, lng: 73.8567, weight: 20 }, // Pune
  ],
  Telangana: [
    { lat: 17.3850, lng: 78.4867, weight: 40 }, // Hyderabad
    { lat: 17.6869, lng: 78.4734, weight: 25 }, // Secunderabad
    { lat: 17.8591, lng: 78.5679, weight: 18 }, // Kompally
  ],
  Karnataka: [
    { lat: 12.9716, lng: 77.5946, weight: 42 }, // Bangalore
    { lat: 13.3339, lng: 74.7421, weight: 28 }, // Mangalore
    { lat: 14.4426, lng: 75.9243, weight: 22 }, // Mysore
  ],
  'Tamil Nadu': [
    { lat: 13.0827, lng: 80.2707, weight: 40 }, // Chennai
    { lat: 11.0066, lng: 76.9969, weight: 32 }, // Coimbatore
    { lat: 10.9467, lng: 76.2339, weight: 24 }, // Kottayam
  ],
}

// Region center points for regional markers
const regionCenters = {
  'Delhi NCR': { lat: 28.7041, lng: 77.1025 },
  Maharashtra: { lat: 19.0759, lng: 72.8776 },
  Telangana: { lat: 17.3850, lng: 78.4867 },
  Karnataka: { lat: 12.9716, lng: 77.5946 },
  'Tamil Nadu': { lat: 13.0827, lng: 80.2707 },
}

// City coordinates mapping for accurate city markers
const cityCoordinates = {
  // Delhi NCR cities
  'Delhi': { lat: 28.7041, lng: 77.1025, region: 'Delhi NCR' },
  'Noida': { lat: 28.5917, lng: 77.3910, region: 'Delhi NCR' },
  'Ghaziabad': { lat: 28.6692, lng: 77.4538, region: 'Delhi NCR' },
  'Gurugram': { lat: 28.4595, lng: 77.0266, region: 'Delhi NCR' },
  'Faridabad': { lat: 28.4089, lng: 77.3178, region: 'Delhi NCR' },
  
  // Maharashtra cities
  'Mumbai': { lat: 19.0760, lng: 72.8777, region: 'Maharashtra' },
  'Pune': { lat: 18.5204, lng: 73.8567, region: 'Maharashtra' },
  'Nagpur': { lat: 21.1458, lng: 79.0882, region: 'Maharashtra' },
  'Aurangabad': { lat: 19.8762, lng: 75.3433, region: 'Maharashtra' },
  'Nashik': { lat: 19.9975, lng: 73.7898, region: 'Maharashtra' },
  
  // Telangana cities
  'Hyderabad': { lat: 17.3850, lng: 78.4867, region: 'Telangana' },
  'Secunderabad': { lat: 17.3700, lng: 78.5000, region: 'Telangana' },
  'Warangal': { lat: 17.9689, lng: 79.5941, region: 'Telangana' },
  'Nizamabad': { lat: 19.2740, lng: 78.1329, region: 'Telangana' },
  'Karimnagar': { lat: 18.4386, lng: 79.1288, region: 'Telangana' },
  
  // Karnataka cities
  'Bangalore': { lat: 12.9716, lng: 77.5946, region: 'Karnataka' },
  'Mangalore': { lat: 12.8628, lng: 74.8558, region: 'Karnataka' },
  'Mysore': { lat: 12.2958, lng: 76.6394, region: 'Karnataka' },
  'Belgaum': { lat: 15.8497, lng: 75.6499, region: 'Karnataka' },
  'Hubli': { lat: 15.3647, lng: 75.0891, region: 'Karnataka' },
  
  // Tamil Nadu cities
  'Chennai': { lat: 13.0827, lng: 80.2707, region: 'Tamil Nadu' },
  'Coimbatore': { lat: 11.0066, lng: 76.9969, region: 'Tamil Nadu' },
  'Madurai': { lat: 9.9252, lng: 78.1198, region: 'Tamil Nadu' },
  'Salem': { lat: 11.6643, lng: 78.1460, region: 'Tamil Nadu' },
  'Tiruchirappalli': { lat: 10.7905, lng: 78.7047, region: 'Tamil Nadu' },
}

const numberFmt = new Intl.NumberFormat('en-IN')

function groupAndSort(rows, key, valueKey, strategy = 'sum') {
  const grouped = rows.reduce((acc, row) => {
    const id = row[key]
    if (!acc[id]) {
      acc[id] = { name: id, total: 0, count: 0 }
    }
    acc[id].total += row[valueKey]
    acc[id].count += 1
    return acc
  }, {})

  return Object.values(grouped)
    .map((item) => ({
      name: item.name,
      value: strategy === 'avg' ? Math.round(item.total / item.count) : item.total,
    }))
    .sort((a, b) => b.value - a.value)
}

function getPerformanceColor(score) {
  if (score >= 72) return '#22c55e'
  if (score >= 52) return '#facc15'
  return '#ef4444'
}

// Build city marker data from datasets
function buildCityMarkers(salesData, regionFilter = 'All Regions') {
  const cityMap = {}
  
  salesData.forEach((row) => {
    if (regionFilter !== 'All Regions' && row.region !== regionFilter) return
    
    const key = `${row.region}-${row.city}`
    if (!cityMap[key]) {
      const coords = cityCoordinates[row.city] || { 
        lat: regionCenters[row.region]?.lat || 20, 
        lng: regionCenters[row.region]?.lng || 78 
      }
      cityMap[key] = {
        city: row.city,
        region: row.region,
        lat: coords.lat,
        lng: coords.lng,
        totalSales: 0,
        totalRevenue: 0,
        avgSentiment: 0,
        products: {},
        count: 0,
      }
    }
    
    const record = cityMap[key]
    record.totalSales += row.sales
    record.totalRevenue += row.revenue
    record.avgSentiment += row.sentiment
    record.count += 1
    
    if (!record.products[row.product]) {
      record.products[row.product] = 0
    }
    record.products[row.product] += row.sales
  })

  return Object.values(cityMap).map((city) => ({
    ...city,
    avgSentiment: Math.round(city.avgSentiment / city.count),
    topProduct: Object.entries(city.products).sort(([, a], [, b]) => b - a)[0]?.[0] || 'N/A',
  }))
}

export default function MarketRadar() {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: googleMapsApiKey,
    libraries: ['visualization'],
  })

  const [selectedProduct, setSelectedProduct] = useState('All Products')
  const [selectedTime, setSelectedTime] = useState('Q2 2026')
  const [selectedCategory, setSelectedCategory] = useState('All Categories')
  const [selectedRegionFilter, setSelectedRegionFilter] = useState('All Regions')
  const [drillLevel, setDrillLevel] = useState('State')
  const [selectedCity, setSelectedCity] = useState('All Cities')
  const [showCompetitors, setShowCompetitors] = useState(true)
  const [activeRegion, setActiveRegion] = useState('Karnataka')
  const [mapZoom, setMapZoom] = useState(5)
  const [selectedMarker, setSelectedMarker] = useState(null)
  const [hoveredMarker, setHoveredMarker] = useState(null)
  const mapRef = useRef(null)
  const infoWindowRef = useRef(null)

  const categories = useMemo(
    () => ['All Categories', ...new Set(regionSales.map((item) => item.category))],
    []
  )

  const products = useMemo(
    () => ['All Products', ...new Set(regionSales.map((item) => item.product))],
    []
  )

  const regions = useMemo(
    () => ['All Regions', ...regionOrder.filter((region) => regionSales.some((item) => item.region === region))],
    []
  )

  const preFilteredRows = useMemo(() => {
    return regionSales.filter((row) => {
      const matchesTime = row.timeRange === selectedTime
      const matchesCategory = selectedCategory === 'All Categories' || row.category === selectedCategory
      const matchesProduct = selectedProduct === 'All Products' || row.product === selectedProduct
      const matchesRegion =
        selectedRegionFilter === 'All Regions' || row.region === selectedRegionFilter
      const matchesCompetitor = showCompetitors ? true : row.companyType === 'your'
      return (
        matchesTime &&
        matchesCategory &&
        matchesProduct &&
        matchesRegion &&
        matchesCompetitor
      )
    })
  }, [selectedTime, selectedCategory, selectedProduct, selectedRegionFilter, showCompetitors])

  const availableCities = useMemo(() => {
    const regionToUse = selectedRegionFilter === 'All Regions' ? activeRegion : selectedRegionFilter
    const list = regionSales
      .filter((row) => row.region === regionToUse && row.timeRange === selectedTime)
      .map((row) => row.city)
    return ['All Cities', ...new Set(list)]
  }, [activeRegion, selectedRegionFilter, selectedTime])

  useEffect(() => {
    const validRegions = new Set(preFilteredRows.map((row) => row.region))
    if (selectedRegionFilter !== 'All Regions') {
      setActiveRegion(selectedRegionFilter)
      return
    }

    if (!validRegions.has(activeRegion)) {
      const fallback = regionOrder.find((region) => validRegions.has(region))
      if (fallback) {
        setActiveRegion(fallback)
      }
    }
  }, [selectedRegionFilter, preFilteredRows, activeRegion])

  useEffect(() => {
    setSelectedCity('All Cities')
  }, [drillLevel, selectedRegionFilter, selectedTime])

  const effectiveRows = useMemo(() => {
    if (drillLevel !== 'City' || selectedCity === 'All Cities') {
      return preFilteredRows
    }
    return preFilteredRows.filter((row) => row.city === selectedCity)
  }, [preFilteredRows, drillLevel, selectedCity])

  const regionRows = useMemo(() => {
    return effectiveRows.filter((row) => row.region === activeRegion)
  }, [effectiveRows, activeRegion])

  const regionRowsAllBrands = useMemo(() => {
    return regionSales.filter((row) => {
      const sameRegion = row.region === activeRegion
      const sameTime = row.timeRange === selectedTime
      const sameCategory = selectedCategory === 'All Categories' || row.category === selectedCategory
      const sameProduct = selectedProduct === 'All Products' || row.product === selectedProduct
      const sameCity = drillLevel !== 'City' || selectedCity === 'All Cities' || row.city === selectedCity
      return sameRegion && sameTime && sameCategory && sameProduct && sameCity
    })
  }, [activeRegion, selectedTime, selectedCategory, selectedProduct, drillLevel, selectedCity])

  const regionPerformance = useMemo(() => {
    const byRegion = regionOrder.map((region) => {
      const rows = effectiveRows.filter((row) => row.region === region)
      if (!rows.length) {
        return { region, score: 0, sales: 0 }
      }
      const totalSales = rows.reduce((sum, row) => sum + row.sales, 0)
      const avgSentiment = rows.reduce((sum, row) => sum + row.sentiment, 0) / rows.length
      return { region, sales: totalSales, score: Math.round(avgSentiment) }
    })

    const maxSales = Math.max(...byRegion.map((item) => item.sales), 1)

    return byRegion.map((item) => {
      const salesIndex = (item.sales / maxSales) * 100
      const weighted = Math.round(salesIndex * 0.5 + item.score * 0.5)
      return {
        ...item,
        weighted,
        color: getPerformanceColor(weighted),
      }
    })
  }, [effectiveRows])

  const cityMarkers = useMemo(() => {
    return buildCityMarkers(effectiveRows, activeRegion)
  }, [effectiveRows, activeRegion])

  const marketShareData = useMemo(() => {
    const baseRows = showCompetitors ? regionRowsAllBrands : regionRows
    return groupAndSort(baseRows, 'brand', 'marketShare', 'avg').map((item) => ({
      ...item,
      share: item.value,
    }))
  }, [regionRowsAllBrands, regionRows, showCompetitors])

  const sentimentData = useMemo(() => {
    return groupAndSort(regionRowsAllBrands, 'brand', 'sentiment', 'avg')
  }, [regionRowsAllBrands])

  const topProducts = useMemo(() => {
    const baseRows = showCompetitors ? regionRowsAllBrands : regionRows
    return groupAndSort(baseRows, 'product', 'sales').slice(0, 3)
  }, [regionRowsAllBrands, regionRows, showCompetitors])

  const totalSales = regionRows.reduce((sum, row) => sum + row.sales, 0)
  const totalRevenue = regionRows.reduce((sum, row) => sum + row.revenue, 0)
  const avgSentiment =
    regionRows.length > 0
      ? Math.round(regionRows.reduce((sum, row) => sum + row.sentiment, 0) / regionRows.length)
      : 0

  const growthData = useMemo(() => {
    return timeRanges.map((range) => {
      const rows = regionSales.filter((row) => {
        const sameRegion = row.region === activeRegion
        const sameTime = row.timeRange === range
        const sameCategory = selectedCategory === 'All Categories' || row.category === selectedCategory
        const sameProduct = selectedProduct === 'All Products' || row.product === selectedProduct
        const sameCity = drillLevel !== 'City' || selectedCity === 'All Cities' || row.city === selectedCity
        const competitorFilter = showCompetitors ? true : row.companyType === 'your'
        return sameRegion && sameTime && sameCategory && sameProduct && sameCity && competitorFilter
      })

      return {
        time: range,
        sales: rows.reduce((sum, row) => sum + row.sales, 0),
        revenue: Math.round(rows.reduce((sum, row) => sum + row.revenue, 0) / 1000),
      }
    })
  }, [activeRegion, selectedCategory, selectedProduct, drillLevel, selectedCity, showCompetitors])

  const vibraniumShare = marketShareData.find((item) => item.name === 'Vibranium')?.share || 0
  const topCompetitorShare = Math.max(
    ...marketShareData.filter((item) => item.name !== 'Vibranium').map((item) => item.share),
    0
  )

  const marketPosition =
    vibraniumShare >= topCompetitorShare
      ? 'Leading'
      : vibraniumShare >= Math.round(topCompetitorShare * 0.65)
      ? 'Emerging'
      : 'Trailing'

  const reviewSnippet = productReviews.find((entry) => entry.region === activeRegion)
  const competitorSnippet = competitorData.find((entry) => entry.region === activeRegion)

  const performanceForActive = regionPerformance.find((item) => item.region === activeRegion)

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.45 }}
      className="container mx-auto px-4 md:px-6 py-10"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-200 via-pink-200 to-purple-200 bg-clip-text text-transparent mb-3">
          Vibranium Market Radar
        </h1>
        <p className="text-slate-300 text-base md:text-lg max-w-3xl">
          Interactive geographic intelligence dashboard for regional product performance, competitor pressure,
          and AI-generated market opportunities.
        </p>
      </motion.div>

      <GlassCard hoverable={false} className="mb-8 p-5 md:p-6">
        <div className="flex items-center gap-2 text-purple-300 mb-4 text-sm uppercase tracking-[0.14em] font-semibold">
          <Filter size={16} /> Filters
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-6 gap-3">
          <select
            value={selectedProduct}
            onChange={(e) => setSelectedProduct(e.target.value)}
            className="px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-slate-200"
          >
            {products.map((item) => (
              <option key={item} value={item} className="bg-gray-900">
                {item}
              </option>
            ))}
          </select>

          <select
            value={selectedTime}
            onChange={(e) => setSelectedTime(e.target.value)}
            className="px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-slate-200"
          >
            {timeRanges.map((item) => (
              <option key={item} value={item} className="bg-gray-900">
                {item}
              </option>
            ))}
          </select>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-slate-200"
          >
            {categories.map((item) => (
              <option key={item} value={item} className="bg-gray-900">
                {item}
              </option>
            ))}
          </select>

          <select
            value={selectedRegionFilter}
            onChange={(e) => setSelectedRegionFilter(e.target.value)}
            className="px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-slate-200"
          >
            {regions.map((item) => (
              <option key={item} value={item} className="bg-gray-900">
                {item}
              </option>
            ))}
          </select>

          <select
            value={drillLevel}
            onChange={(e) => setDrillLevel(e.target.value)}
            className="px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-slate-200"
          >
            <option value="Country" className="bg-gray-900">Country</option>
            <option value="State" className="bg-gray-900">State</option>
            <option value="City" className="bg-gray-900">City</option>
          </select>

          <div className="flex gap-2">
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              disabled={drillLevel !== 'City'}
              className="flex-1 px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-slate-200 disabled:opacity-40"
            >
              {availableCities.map((item) => (
                <option key={item} value={item} className="bg-gray-900">
                  {item}
                </option>
              ))}
            </select>
            <button
              onClick={() => setShowCompetitors((prev) => !prev)}
              className={`px-3 py-2.5 rounded-lg border text-xs font-semibold tracking-[0.08em] uppercase transition-all ${
                showCompetitors
                  ? 'bg-purple-500/20 border-purple-400/60 text-purple-200'
                  : 'bg-white/5 border-white/10 text-slate-300'
              }`}
            >
              Competitors
            </button>
          </div>
        </div>
      </GlassCard>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 mb-8">
        <GlassCard hoverable={false} className="xl:col-span-8 p-5 md:p-6 relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <MapPinned size={20} className="text-purple-300" />
              Regional Heatmap
            </h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setMapZoom((value) => Math.min(12, value + 1))}
                className="p-2 rounded-lg bg-white/5 border border-white/10 text-purple-200"
                aria-label="Zoom in"
              >
                <ZoomIn size={16} />
              </button>
              <button
                onClick={() => setMapZoom((value) => Math.max(3, value - 1))}
                className="p-2 rounded-lg bg-white/5 border border-white/10 text-purple-200"
                aria-label="Zoom out"
              >
                <ZoomOut size={16} />
              </button>
              <button
                onClick={() => {
                  setMapZoom(5)
                  if (mapRef.current) {
                    mapRef.current.panTo(center)
                  }
                }}
                className="p-2 rounded-lg bg-white/5 border border-white/10 text-purple-200"
                aria-label="Reset zoom"
              >
                <RotateCcw size={16} />
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-3 md:p-4">
            <div className="w-full h-[360px] md:h-[420px] rounded-xl bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.16),rgba(15,15,30,0.9))] border border-white/10 overflow-hidden">
              {isLoaded && (
                <GoogleMap
                  mapContainerStyle={mapContainerStyle}
                  center={center}
                  zoom={mapZoom}
                  ref={mapRef}
                  options={{
                    styles: [
                      { elementType: 'geometry', stylers: [{ color: '#1a1a2e' }] },
                      { elementType: 'labels.text.stroke', stylers: [{ color: '#1a1a2e' }] },
                      { elementType: 'labels.text.fill', stylers: [{ color: '#a1a1a1' }] },
                      {
                        featureType: 'water',
                        elementType: 'geometry',
                        stylers: [{ color: '#0d47a1' }],
                      },
                      {
                        featureType: 'water',
                        elementType: 'labels.text.fill',
                        stylers: [{ color: '#4dd0e1' }],
                      },
                      {
                        featureType: 'administrative.country',
                        elementType: 'geometry.stroke',
                        stylers: [{ color: '#6a00ff' }],
                      },
                      {
                        featureType: 'administrative.province',
                        elementType: 'geometry.stroke',
                        stylers: [{ color: '#9c27b0' }],
                      },
                      {
                        featureType: 'administrative.locality',
                        elementType: 'labels.text.fill',
                        stylers: [{ color: '#b39ddb' }],
                      },
                      {
                        featureType: 'road',
                        elementType: 'geometry',
                        stylers: [{ color: '#2a2a3e' }],
                      },
                      {
                        featureType: 'road',
                        elementType: 'geometry.stroke',
                        stylers: [{ color: '#212129' }],
                      },
                      {
                        featureType: 'road.highway',
                        elementType: 'geometry',
                        stylers: [{ color: '#3a3a5e' }],
                      },
                      {
                        featureType: 'road.highway',
                        elementType: 'geometry.stroke',
                        stylers: [{ color: '#463a7c' }],
                      },
                      {
                        featureType: 'poi',
                        elementType: 'labels.icon',
                        stylers: [{ visibility: 'off' }],
                      },
                      {
                        featureType: 'poi.business',
                        stylers: [{ visibility: 'off' }],
                      },
                    ],
                    disableDefaultUI: true,
                    zoomControl: false,
                    fullscreenControl: false,
                    streetViewControl: false,
                  }}
                >
                  {/* Enhanced Heatmap layer with sales performance data */}
                  {mapZoom > 6 && cityMarkers.length > 0 && (
                    <HeatmapLayer
                      data={cityMarkers.map((city) => {
                        const weight = Math.min(city.totalSales / 100, 10)
                        return {
                          location: new window.google.maps.LatLng(city.lat, city.lng),
                          weight: weight,
                        }
                      })}
                      options={{
                        radius: 50,
                        opacity: 0.6,
                        dissipating: true,
                        gradient: [
                          'rgba(102, 0, 204, 0)',
                          'rgba(102, 0, 204, 0.4)',
                          'rgba(102, 0, 204, 0.6)',
                          'rgba(168, 85, 247, 0.8)',
                          'rgba(236, 72, 153, 1)',
                        ],
                        maxIntensity: 100,
                      }}
                    />
                  )}

                  {/* Regional performance markers - visible at all zoom levels */}
                  {regionPerformance && regionPerformance.length > 0 && regionPerformance.map((region) => {
                    const center = regionCenters[region.region]
                    if (!center) return null
                    const isActive = region.region === activeRegion
                    return (
                      <Marker
                        key={region.region}
                        position={center}
                        title={`${region.region}: ${numberFmt.format(region.sales || 0)} sales`}
                        onClick={() => setActiveRegion(region.region)}
                        icon={{
                          path: window.google.maps.SymbolPath.CIRCLE,
                          scale: isActive ? 18 : 14,
                          fillColor: region.color || '#a855f7',
                          fillOpacity: isActive ? 0.95 : 0.75,
                          strokeColor: isActive ? '#ffffff' : '#e9d5ff',
                          strokeWeight: isActive ? 3 : 2,
                        }}
                      />
                    )
                  })}

                  {/* City-level markers with InfoWindows */}
                  {mapZoom > 7 && cityMarkers.length > 0 &&
                    cityMarkers.map((city) => {
                      const performanceScore = city.avgSentiment
                      const markerColor = getPerformanceColor(performanceScore)
                      const isSelected = selectedMarker?.city === city.city
                      const isHovered = hoveredMarker?.city === city.city
                      
                      return (
                        <Marker
                          key={`marker-${city.city}`}
                          position={{ lat: city.lat, lng: city.lng }}
                          title={city.city}
                          onClick={() => setSelectedMarker(city)}
                          onMouseOver={() => setHoveredMarker(city)}
                          onMouseOut={() => setHoveredMarker(null)}
                          icon={{
                            path: window.google.maps.SymbolPath.CIRCLE,
                            scale: isSelected ? 12 : isHovered ? 10 : 8,
                            fillColor: markerColor,
                            fillOpacity: isSelected ? 1 : isHovered ? 0.85 : 0.7,
                            strokeColor: isSelected ? '#ffffff' : '#e9d5ff',
                            strokeWeight: isSelected ? 3 : 2,
                          }}
                        >
                          {isSelected && (
                            <InfoWindow 
                              onCloseClick={() => setSelectedMarker(null)}
                              ref={infoWindowRef}
                              options={{
                                pixelOffset: new window.google.maps.Size(0, -40),
                              }}
                            >
                              <div className="bg-gradient-to-br from-purple-900/90 to-pink-900/90 text-white rounded-lg p-3 border border-purple-400/50 text-xs min-w-[240px] backdrop-blur-sm">
                                <h3 className="font-bold text-sm mb-2 text-purple-200">{city.city}</h3>
                                <div className="space-y-1 text-gray-200">
                                  <p><span className="text-purple-300 font-semibold">Region:</span> {city.region}</p>
                                  <p><span className="text-purple-300 font-semibold">Sales Volume:</span> {numberFmt.format(city.totalSales)} units</p>
                                  <p><span className="text-purple-300 font-semibold">Revenue:</span> ₹{numberFmt.format(city.totalRevenue)}</p>
                                  <p><span className="text-purple-300 font-semibold">Sentiment:</span> {city.avgSentiment}%</p>
                                  <p><span className="text-purple-300 font-semibold">Top Product:</span> {city.topProduct}</p>
                                </div>
                              </div>
                            </InfoWindow>
                          )}
                        </Marker>
                      )
                    })
                  }
                </GoogleMap>
              )}
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-slate-300">
            <div className="flex items-center gap-2 px-3 py-2 bg-white/5 rounded-lg border border-white/10">
              <span className="font-semibold text-purple-300">Regional Performance:</span>
            </div>
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-full bg-green-500 border border-green-400" />
              <span>High Sales</span>
            </span>
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-full bg-yellow-400 border border-yellow-300" />
              <span>Moderate Sales</span>
            </span>
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-full bg-red-500 border border-red-400" />
              <span>Low Sales</span>
            </span>
            {activeRegion && (
              <span className="ml-auto text-purple-200 tracking-[0.1em] uppercase font-semibold">
                Selected: {activeRegion}
              </span>
            )}
          </div>
        </GlassCard>

        <GlassCard hoverable={false} className="xl:col-span-4 p-5 md:p-6">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Radar size={20} className="text-pink-300" />
            Region Intelligence
          </h2>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeRegion}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.35 }}
            >
              <p className="text-sm text-purple-200 uppercase tracking-[0.14em] mb-3">Region: {activeRegion}</p>

              <div className="space-y-2 text-sm text-slate-200 mb-5">
                <div className="flex justify-between"><span>Sales Volume</span><span>{numberFmt.format(totalSales)}</span></div>
                <div className="flex justify-between"><span>Revenue</span><span>INR {numberFmt.format(totalRevenue)}</span></div>
                <div className="flex justify-between"><span>Sentiment Score</span><span>{avgSentiment}</span></div>
                <div className="flex justify-between"><span>Market Position</span><span>{marketPosition}</span></div>
                <div className="flex justify-between"><span>Performance Tier</span><span>{performanceForActive?.weighted || 0}/100</span></div>
              </div>

              <div className="mb-5">
                <p className="text-xs uppercase tracking-[0.14em] text-slate-400 mb-2">Top Selling Products</p>
                <div className="space-y-2">
                  {topProducts.map((item) => (
                    <div key={item.name} className="flex justify-between text-sm text-slate-200 bg-white/5 rounded-lg px-3 py-2">
                      <span>{item.name}</span>
                      <span>{numberFmt.format(item.value)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mb-5">
                <p className="text-xs uppercase tracking-[0.14em] text-slate-400 mb-2">Market Share</p>
                <div className="space-y-1.5 text-sm text-slate-200">
                  {marketShareData.slice(0, 4).map((item) => (
                    <div key={item.name} className="flex justify-between">
                      <span>{item.name}</span>
                      <span>{item.share}%</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs uppercase tracking-[0.14em] text-slate-400 mb-2">Sentiment Scores</p>
                <div className="space-y-1.5 text-sm text-slate-200">
                  {sentimentData.slice(0, 4).map((item) => (
                    <div key={item.name} className="flex justify-between">
                      <span>{item.name}</span>
                      <span>{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 mb-8">
        <GlassCard hoverable={false} className="xl:col-span-6 p-5 md:p-6">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Activity size={18} className="text-purple-300" /> Market Share Comparison
          </h3>
          <ResponsiveContainer width="100%" height={290}>
            <BarChart data={marketShareData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(168,85,247,0.2)" />
              <XAxis dataKey="name" stroke="#cbd5e1" />
              <YAxis stroke="#cbd5e1" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(10, 10, 24, 0.95)',
                  border: '1px solid rgba(168,85,247,0.5)',
                  borderRadius: '10px',
                }}
                formatter={(value) => `${value}%`}
              />
              <Bar dataKey="share" radius={[8, 8, 0, 0]}>
                {marketShareData.map((entry) => (
                  <Cell
                    key={entry.name}
                    fill={entry.name === 'Vibranium' ? '#a855f7' : '#64748b'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </GlassCard>

        <GlassCard hoverable={false} className="xl:col-span-6 p-5 md:p-6">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <TrendingUp size={18} className="text-pink-300" /> Revenue and Sales Trend
          </h3>
          <ResponsiveContainer width="100%" height={290}>
            <LineChart data={growthData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(168,85,247,0.2)" />
              <XAxis dataKey="time" stroke="#cbd5e1" />
              <YAxis yAxisId="left" stroke="#cbd5e1" />
              <YAxis yAxisId="right" orientation="right" stroke="#94a3b8" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(10, 10, 24, 0.95)',
                  border: '1px solid rgba(236,72,153,0.5)',
                  borderRadius: '10px',
                }}
              />
              <Legend />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="sales"
                stroke="#a855f7"
                strokeWidth={3}
                dot={{ r: 4 }}
                name="Sales Volume"
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="revenue"
                stroke="#ec4899"
                strokeWidth={3}
                dot={{ r: 4 }}
                name="Revenue (INR x1k)"
              />
            </LineChart>
          </ResponsiveContainer>
        </GlassCard>
      </div>

      <GlassCard hoverable={false} className="p-6 md:p-7 bg-gradient-to-br from-purple-900/20 to-pink-900/20">
        <h3 className="text-xl font-bold text-white mb-5">AI Insight Engine</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <p className="text-xs uppercase tracking-[0.14em] text-purple-300 mb-2">Insight</p>
            <p className="text-slate-200">
              {reviewSnippet?.summary || `Regional demand in ${activeRegion} is moving toward value-focused devices with strong performance.`}
            </p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <p className="text-xs uppercase tracking-[0.14em] text-purple-300 mb-2">Opportunity</p>
            <p className="text-slate-200">
              {reviewSnippet?.opportunity || `Low competitor presence detected in Tier-2 locations near ${activeRegion}.`}
            </p>
            {reviewSnippet?.lowCompetitorCity && (
              <p className="text-xs mt-2 text-emerald-300">Low competitor presence: {reviewSnippet.lowCompetitorCity}</p>
            )}
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <p className="text-xs uppercase tracking-[0.14em] text-purple-300 mb-2">Recommendation</p>
            <p className="text-slate-200">
              {reviewSnippet?.recommendation || `Increase marketing investment with localized campaigns in ${activeRegion}.`}
            </p>
          </div>
        </div>

        <div className="mt-5 text-sm text-slate-300">
          <p>
            Competitor Strength: {competitorSnippet?.leaderBrand || 'Samsung'} leads with{' '}
            {competitorSnippet?.leaderStrength || 'strong retail execution and consistent pricing strategy.'}
          </p>
          <p className="mt-1">
            Vibranium Status: <span className="text-purple-200 font-semibold">{competitorSnippet?.vibraniumStatus || marketPosition}</span>
          </p>
        </div>
      </GlassCard>
    </motion.main>
  )
}
