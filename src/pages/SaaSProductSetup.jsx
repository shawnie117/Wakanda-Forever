import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import GlassCard from '../components/GlassCard'
import PrimaryButton from '../components/PrimaryButton'
import {
  Rocket,
  Globe,
  Target,
  Users,
  Zap,
  TrendingUp,
  Settings,
  FileText,
  Plus,
  X,
  CheckCircle,
} from 'lucide-react'
import {
  createSaaSProduct,
  saveProductFeatures,
  saveProductDistribution,
  saveCompetitorInputs,
  saveAnalysisPreferences,
} from '../firebase/firestoreService'

export default function SaaSProductSetup() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [currentSection, setCurrentSection] = useState(1)
  const [loading, setLoading] = useState(false)

  // Section 1: Product Information
  const [productName, setProductName] = useState('')
  const [website, setWebsite] = useState('')
  const [category, setCategory] = useState('')
  const [description, setDescription] = useState('')
  const [targetCustomerSegment, setTargetCustomerSegment] = useState('')

  // Section 2: Product Positioning
  const [coreProblem, setCoreProblem] = useState('')
  const [features, setFeatures] = useState([])
  const [featureInput, setFeatureInput] = useState('')
  const [uniqueValueProposition, setUniqueValueProposition] = useState('')
  const [businessModel, setBusinessModel] = useState('')
  const [pricingTierRange, setPricingTierRange] = useState('')

  // Section 3: Target Market
  const [targetMarketRegion, setTargetMarketRegion] = useState('')
  const [targetIndustries, setTargetIndustries] = useState([])
  const [industryInput, setIndustryInput] = useState('')
  const [targetCompanySize, setTargetCompanySize] = useState('')
  const [primaryUserPersona, setPrimaryUserPersona] = useState('')

  // Section 4: Competitor Discovery
  const [knownCompetitors, setKnownCompetitors] = useState([])
  const [competitorInput, setCompetitorInput] = useState('')
  const [competitorKeywords, setCompetitorKeywords] = useState([])
  const [keywordInput, setKeywordInput] = useState('')
  const [alternativeCategories, setAlternativeCategories] = useState([])
  const [categoryInput, setCategoryInput] = useState('')
  const [searchPlatforms, setSearchPlatforms] = useState([])

  // Section 5: Distribution Channels
  const [distributionPlatforms, setDistributionPlatforms] = useState([
    { platformName: '', productURL: '' },
  ])

  // Section 6: Analysis Preferences
  const [analysisPrefs, setAnalysisPrefs] = useState({
    compareFeatures: true,
    pricingBenchmark: true,
    sentimentAnalysis: true,
    marketGapDetection: true,
    featureOpportunityInsights: true,
    positioningRecommendations: true,
  })

  // Section 7: Output Preferences
  const [outputTypes, setOutputTypes] = useState([])

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  }

  // Helper functions for tag inputs
  const addFeature = () => {
    if (featureInput.trim() && !features.includes(featureInput.trim())) {
      setFeatures([...features, featureInput.trim()])
      setFeatureInput('')
    }
  }

  const removeFeature = (feature) => {
    setFeatures(features.filter((f) => f !== feature))
  }

  const addIndustry = () => {
    if (industryInput.trim() && !targetIndustries.includes(industryInput.trim())) {
      setTargetIndustries([...targetIndustries, industryInput.trim()])
      setIndustryInput('')
    }
  }

  const removeIndustry = (industry) => {
    setTargetIndustries(targetIndustries.filter((i) => i !== industry))
  }

  const addCompetitor = () => {
    if (competitorInput.trim() && !knownCompetitors.includes(competitorInput.trim())) {
      setKnownCompetitors([...knownCompetitors, competitorInput.trim()])
      setCompetitorInput('')
    }
  }

  const removeCompetitor = (competitor) => {
    setKnownCompetitors(knownCompetitors.filter((c) => c !== competitor))
  }

  const addKeyword = () => {
    if (keywordInput.trim() && !competitorKeywords.includes(keywordInput.trim())) {
      setCompetitorKeywords([...competitorKeywords, keywordInput.trim()])
      setKeywordInput('')
    }
  }

  const removeKeyword = (keyword) => {
    setCompetitorKeywords(competitorKeywords.filter((k) => k !== keyword))
  }

  const addAlternativeCategory = () => {
    if (categoryInput.trim() && !alternativeCategories.includes(categoryInput.trim())) {
      setAlternativeCategories([...alternativeCategories, categoryInput.trim()])
      setCategoryInput('')
    }
  }

  const removeAlternativeCategory = (cat) => {
    setAlternativeCategories(alternativeCategories.filter((c) => c !== cat))
  }

  const addDistributionPlatform = () => {
    setDistributionPlatforms([...distributionPlatforms, { platformName: '', productURL: '' }])
  }

  const removeDistributionPlatform = (index) => {
    setDistributionPlatforms(distributionPlatforms.filter((_, i) => i !== index))
  }

  const updateDistributionPlatform = (index, field, value) => {
    const updated = [...distributionPlatforms]
    updated[index][field] = value
    setDistributionPlatforms(updated)
  }

  const togglePlatform = (platform) => {
    setSearchPlatforms((prev) =>
      prev.includes(platform) ? prev.filter((p) => p !== platform) : [...prev, platform]
    )
  }

  const toggleOutputType = (type) => {
    setOutputTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    )
  }

  const handleSubmit = async () => {
    if (!productName || !website) {
      alert('Please fill in required fields: Product Name and Website')
      return
    }

    setLoading(true)
    try {
      // 1. Create the SaaS product
      const productId = await createSaaSProduct(user.uid, {
        productName,
        website,
        category,
        description,
        targetCustomerSegment,
        coreProblem,
        uniqueValueProposition,
        businessModel,
        pricingTierRange,
        targetMarketRegion,
        targetIndustries,
        targetCompanySize,
        primaryUserPersona,
      })

      // 2. Save features
      await saveProductFeatures(productId, features)

      // 3. Save distribution channels
      const validPlatforms = distributionPlatforms.filter(
        (p) => p.platformName.trim() && p.productURL.trim()
      )
      await saveProductDistribution(productId, validPlatforms)

      // 4. Save competitor inputs
      await saveCompetitorInputs(productId, {
        knownCompetitors,
        competitorSearchKeywords: competitorKeywords,
        alternativeCategories,
        searchPlatforms,
      })

      // 5. Save analysis preferences
      await saveAnalysisPreferences(productId, {
        ...analysisPrefs,
        outputTypes,
      })

      navigate('/dashboard')
    } catch (error) {
      console.error('Error creating SaaS product:', error)
      alert('Failed to create product. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const sections = [
    { number: 1, title: 'Product Info', icon: Rocket },
    { number: 2, title: 'Positioning', icon: Target },
    { number: 3, title: 'Target Market', icon: Users },
    { number: 4, title: 'Competitors', icon: TrendingUp },
    { number: 5, title: 'Distribution', icon: Globe },
    { number: 6, title: 'Analysis', icon: Settings },
    { number: 7, title: 'Output', icon: FileText },
  ]

  return (
    <motion.main
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900 p-8"
    >
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div variants={itemVariants} className="text-center mb-8">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mb-2">
            SaaS Product Setup
          </h1>
          <p className="text-gray-400">
            Configure your SaaS product for AI-powered intelligence analysis
          </p>
        </motion.div>

        {/* Progress Steps */}
        <motion.div variants={itemVariants} className="mb-8">
          <div className="flex justify-between items-center">
            {sections.map((section) => {
              const Icon = section.icon
              return (
                <div key={section.number} className="flex flex-col items-center flex-1">
                  <motion.button
                    onClick={() => setCurrentSection(section.number)}
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                      currentSection === section.number
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white scale-110'
                        : currentSection > section.number
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-white/5 text-gray-500'
                    }`}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Icon size={20} />
                  </motion.button>
                  <span className="text-xs text-gray-500 mt-2 hidden md:block">
                    {section.title}
                  </span>
                </div>
              )
            })}
          </div>
        </motion.div>

        {/* Form Sections */}
        <GlassCard>
          {/* Section 1: Product Information */}
          {currentSection === 1 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div className="flex items-center gap-3 mb-6">
                <Rocket className="text-purple-400" size={28} />
                <h2 className="text-2xl font-bold text-white">Product Information</h2>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Product Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  className="vibranium-input w-full"
                  placeholder="e.g., Vibranium Intelligence"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Product Website URL <span className="text-red-400">*</span>
                </label>
                <input
                  type="url"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  className="vibranium-input w-full"
                  placeholder="https://vibranium.ai"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Product Category / Industry
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="vibranium-input w-full"
                >
                  <option value="">Select category</option>
                  <option value="Analytics">Analytics</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Sales">Sales</option>
                  <option value="Product Management">Product Management</option>
                  <option value="Customer Success">Customer Success</option>
                  <option value="DevOps">DevOps</option>
                  <option value="Collaboration">Collaboration</option>
                  <option value="Finance">Finance</option>
                  <option value="HR">HR</option>
                  <option value="Design">Design</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Product Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="vibranium-input w-full"
                  placeholder="Describe what your SaaS product does..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Target Customer Segment
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {['Startup', 'SMB', 'Enterprise', 'Consumer'].map((segment) => (
                    <button
                      key={segment}
                      onClick={() => setTargetCustomerSegment(segment)}
                      className={`px-4 py-3 rounded-lg transition-all ${
                        targetCustomerSegment === segment
                          ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                          : 'bg-white/5 text-gray-400 hover:bg-white/10'
                      }`}
                    >
                      {segment}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Section 2: Product Positioning */}
          {currentSection === 2 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div className="flex items-center gap-3 mb-6">
                <Target className="text-purple-400" size={28} />
                <h2 className="text-2xl font-bold text-white">Product Positioning</h2>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Core Problem the Product Solves
                </label>
                <textarea
                  value={coreProblem}
                  onChange={(e) => setCoreProblem(e.target.value)}
                  rows={3}
                  className="vibranium-input w-full"
                  placeholder="What problem does your product solve?"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Key Features
                </label>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={featureInput}
                    onChange={(e) => setFeatureInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                    className="vibranium-input flex-1"
                    placeholder="Type a feature and press Enter"
                  />
                  <button
                    onClick={addFeature}
                    className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors"
                  >
                    <Plus size={20} />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {features.map((feature, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full flex items-center gap-2"
                    >
                      {feature}
                      <button onClick={() => removeFeature(feature)}>
                        <X size={14} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Unique Value Proposition
                </label>
                <textarea
                  value={uniqueValueProposition}
                  onChange={(e) => setUniqueValueProposition(e.target.value)}
                  rows={3}
                  className="vibranium-input w-full"
                  placeholder="What makes your product unique?"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Business Model
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {['Subscription', 'Freemium', 'Usage-based', 'One-time'].map((model) => (
                    <button
                      key={model}
                      onClick={() => setBusinessModel(model)}
                      className={`px-4 py-3 rounded-lg transition-all ${
                        businessModel === model
                          ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                          : 'bg-white/5 text-gray-400 hover:bg-white/10'
                      }`}
                    >
                      {model}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Pricing Tier Range
                </label>
                <input
                  type="text"
                  value={pricingTierRange}
                  onChange={(e) => setPricingTierRange(e.target.value)}
                  className="vibranium-input w-full"
                  placeholder="e.g., $49/mo - $499/mo"
                />
              </div>
            </motion.div>
          )}

          {/* Section 3: Target Market */}
          {currentSection === 3 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div className="flex items-center gap-3 mb-6">
                <Users className="text-purple-400" size={28} />
                <h2 className="text-2xl font-bold text-white">Target Market</h2>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Primary Market Region
                </label>
                <select
                  value={targetMarketRegion}
                  onChange={(e) => setTargetMarketRegion(e.target.value)}
                  className="vibranium-input w-full"
                >
                  <option value="">Select region</option>
                  <option value="North America">North America</option>
                  <option value="Europe">Europe</option>
                  <option value="Asia Pacific">Asia Pacific</option>
                  <option value="Latin America">Latin America</option>
                  <option value="Middle East">Middle East</option>
                  <option value="Africa">Africa</option>
                  <option value="Global">Global</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Target Industries
                </label>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={industryInput}
                    onChange={(e) => setIndustryInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addIndustry())}
                    className="vibranium-input flex-1"
                    placeholder="Add target industry"
                  />
                  <button
                    onClick={addIndustry}
                    className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors"
                  >
                    <Plus size={20} />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {targetIndustries.map((industry, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-pink-500/20 text-pink-300 rounded-full flex items-center gap-2"
                    >
                      {industry}
                      <button onClick={() => removeIndustry(industry)}>
                        <X size={14} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Target Company Size
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {['Startup', 'SMB', 'Mid-Market', 'Enterprise'].map((size) => (
                    <button
                      key={size}
                      onClick={() => setTargetCompanySize(size)}
                      className={`px-4 py-3 rounded-lg transition-all ${
                        targetCompanySize === size
                          ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                          : 'bg-white/5 text-gray-400 hover:bg-white/10'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Primary User Persona
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {['Marketer', 'Developer', 'Founder', 'Designer', 'Product Manager', 'Sales'].map(
                    (persona) => (
                      <button
                        key={persona}
                        onClick={() => setPrimaryUserPersona(persona)}
                        className={`px-4 py-3 rounded-lg transition-all ${
                          primaryUserPersona === persona
                            ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                            : 'bg-white/5 text-gray-400 hover:bg-white/10'
                        }`}
                      >
                        {persona}
                      </button>
                    )
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* Section 4: Competitor Discovery Inputs */}
          {currentSection === 4 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div className="flex items-center gap-3 mb-6">
                <TrendingUp className="text-purple-400" size={28} />
                <h2 className="text-2xl font-bold text-white">Competitor Discovery</h2>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Known Competitors
                </label>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={competitorInput}
                    onChange={(e) => setCompetitorInput(e.target.value)}
                    onKeyPress={(e) =>
                      e.key === 'Enter' && (e.preventDefault(), addCompetitor())
                    }
                    className="vibranium-input flex-1"
                    placeholder="Add competitor name"
                  />
                  <button
                    onClick={addCompetitor}
                    className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors"
                  >
                    <Plus size={20} />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {knownCompetitors.map((competitor, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-red-500/20 text-red-300 rounded-full flex items-center gap-2"
                    >
                      {competitor}
                      <button onClick={() => removeCompetitor(competitor)}>
                        <X size={14} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Keywords to Search Competitors
                </label>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={keywordInput}
                    onChange={(e) => setKeywordInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addKeyword())}
                    className="vibranium-input flex-1"
                    placeholder="Add search keyword"
                  />
                  <button
                    onClick={addKeyword}
                    className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors"
                  >
                    <Plus size={20} />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {competitorKeywords.map((keyword, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full flex items-center gap-2"
                    >
                      {keyword}
                      <button onClick={() => removeKeyword(keyword)}>
                        <X size={14} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Alternative Product Categories
                </label>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={categoryInput}
                    onChange={(e) => setCategoryInput(e.target.value)}
                    onKeyPress={(e) =>
                      e.key === 'Enter' && (e.preventDefault(), addAlternativeCategory())
                    }
                    className="vibranium-input flex-1"
                    placeholder="Add alternative category"
                  />
                  <button
                    onClick={addAlternativeCategory}
                    className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors"
                  >
                    <Plus size={20} />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {alternativeCategories.map((cat, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-green-500/20 text-green-300 rounded-full flex items-center gap-2"
                    >
                      {cat}
                      <button onClick={() => removeAlternativeCategory(cat)}>
                        <X size={14} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Platforms Where Competitors Appear
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {[
                    'Product Hunt',
                    'AppSumo',
                    'G2',
                    'Capterra',
                    'Shopify App Store',
                    'Google Workspace Marketplace',
                  ].map((platform) => (
                    <button
                      key={platform}
                      onClick={() => togglePlatform(platform)}
                      className={`px-4 py-3 rounded-lg transition-all text-sm ${
                        searchPlatforms.includes(platform)
                          ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                          : 'bg-white/5 text-gray-400 hover:bg-white/10'
                      }`}
                    >
                      {platform}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Section 5: Distribution Channels */}
          {currentSection === 5 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div className="flex items-center gap-3 mb-6">
                <Globe className="text-purple-400" size={28} />
                <h2 className="text-2xl font-bold text-white">Product Distribution Channels</h2>
              </div>

              <div className="space-y-4">
                {distributionPlatforms.map((platform, index) => (
                  <div
                    key={index}
                    className="p-4 bg-white/5 border border-white/10 rounded-lg space-y-3"
                  >
                    <div className="flex justify-between items-center">
                      <h3 className="text-white font-medium">Platform {index + 1}</h3>
                      {distributionPlatforms.length > 1 && (
                        <button
                          onClick={() => removeDistributionPlatform(index)}
                          className="text-red-400 hover:text-red-300"
                        >
                          <X size={20} />
                        </button>
                      )}
                    </div>
                    <div className="grid md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-gray-400 mb-1">Platform Name</label>
                        <input
                          type="text"
                          value={platform.platformName}
                          onChange={(e) =>
                            updateDistributionPlatform(index, 'platformName', e.target.value)
                          }
                          className="vibranium-input w-full"
                          placeholder="e.g., Product Hunt"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-400 mb-1">Product URL</label>
                        <input
                          type="url"
                          value={platform.productURL}
                          onChange={(e) =>
                            updateDistributionPlatform(index, 'productURL', e.target.value)
                          }
                          className="vibranium-input w-full"
                          placeholder="https://..."
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={addDistributionPlatform}
                className="w-full px-4 py-3 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <Plus size={20} />
                Add Another Platform
              </button>
            </motion.div>
          )}

          {/* Section 6: Data Analysis Preferences */}
          {currentSection === 6 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div className="flex items-center gap-3 mb-6">
                <Settings className="text-purple-400" size={28} />
                <h2 className="text-2xl font-bold text-white">Data Analysis Preferences</h2>
              </div>

              <div className="space-y-4">
                {[
                  {
                    key: 'compareFeatures',
                    label: 'Competitor Feature Comparison',
                    description: 'Compare your features against competitors',
                  },
                  {
                    key: 'pricingBenchmark',
                    label: 'Pricing Benchmarking',
                    description: 'Analyze pricing against market standards',
                  },
                  {
                    key: 'sentimentAnalysis',
                    label: 'Customer Sentiment Analysis',
                    description: 'Analyze customer reviews and feedback',
                  },
                  {
                    key: 'marketGapDetection',
                    label: 'Market Gap Detection',
                    description: 'Identify missing features and opportunities',
                  },
                  {
                    key: 'featureOpportunityInsights',
                    label: 'Feature Opportunity Insights',
                    description: 'Get AI recommendations for new features',
                  },
                  {
                    key: 'positioningRecommendations',
                    label: 'Positioning Recommendations',
                    description: 'Strategic positioning advice',
                  },
                ].map((pref) => (
                  <div
                    key={pref.key}
                    className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-lg"
                  >
                    <div>
                      <h3 className="text-white font-medium">{pref.label}</h3>
                      <p className="text-sm text-gray-400">{pref.description}</p>
                    </div>
                    <button
                      onClick={() =>
                        setAnalysisPrefs((prev) => ({
                          ...prev,
                          [pref.key]: !prev[pref.key],
                        }))
                      }
                      className={`relative w-14 h-8 rounded-full transition-colors ${
                        analysisPrefs[pref.key] ? 'bg-purple-500' : 'bg-gray-600'
                      }`}
                    >
                      <span
                        className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${
                          analysisPrefs[pref.key] ? 'translate-x-6' : ''
                        }`}
                      ></span>
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Section 7: Output Preferences */}
          {currentSection === 7 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div className="flex items-center gap-3 mb-6">
                <FileText className="text-purple-400" size={28} />
                <h2 className="text-2xl font-bold text-white">Output Preferences</h2>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-4">
                  Select Report Types You Want to Generate
                </label>
                <div className="space-y-3">
                  {[
                    'SWOT Analysis',
                    'Competitive Matrix',
                    'Feature Gap Report',
                    'Pricing Optimization Suggestions',
                    'Go-to-Market Strategy Feedback',
                  ].map((type) => (
                    <button
                      key={type}
                      onClick={() => toggleOutputType(type)}
                      className={`w-full p-4 rounded-lg transition-all flex items-center justify-between ${
                        outputTypes.includes(type)
                          ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                          : 'bg-white/5 text-gray-400 hover:bg-white/10'
                      }`}
                    >
                      <span>{type}</span>
                      {outputTypes.includes(type) && <CheckCircle size={20} />}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-white/10">
                <p className="text-gray-400 text-sm mb-4">
                  Ready to create your SaaS product profile and start AI-powered analysis
                </p>
                <PrimaryButton
                  onClick={handleSubmit}
                  disabled={loading}
                  className="w-full disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Creating Product...' : 'Create SaaS Product'}
                </PrimaryButton>
              </div>
            </motion.div>
          )}

          {/* Navigation Buttons */}
          {currentSection < 7 && (
            <div className="flex justify-between mt-8 pt-6 border-t border-white/10">
              <button
                onClick={() => setCurrentSection(currentSection - 1)}
                disabled={currentSection === 1}
                className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <PrimaryButton
                onClick={() => setCurrentSection(currentSection + 1)}
              >
                Next
              </PrimaryButton>
            </div>
          )}
        </GlassCard>
      </div>
    </motion.main>
  )
}

