import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Plus, Trash2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { addProduct, getCompanyProfile } from '../firebase/firestoreService'

const PLATFORM_OPTIONS = [
  'Amazon',
  'Flipkart',
  'Shopify',
  'Website',
  'Apple App Store',
  'Google Play Store',
]

export default function AddProduct() {
  const navigate = useNavigate()
  const { user } = useAuth()

  const [loading, setLoading] = useState(false)
  const [companyId, setCompanyId] = useState('')
  const [error, setError] = useState('')

  const [product, setProduct] = useState({
    productName: '',
    category: '',
    description: '',
    priceRange: '',
    primaryMarket: '',
  })

  const [platforms, setPlatforms] = useState([
    { platformName: '', productLink: '' },
  ])

  useEffect(() => {
    async function bootstrap() {
      if (!user?.uid) return

      try {
        const profile = await getCompanyProfile(user.uid)
        if (!profile?.id) {
          navigate('/company-setup', { replace: true })
          return
        }
        setCompanyId(profile.id)
      } catch (profileError) {
        console.error('Failed to load company profile:', profileError)
        setError('Unable to load company profile. Please try again.')
      }
    }

    bootstrap()
  }, [user, navigate])

  const validPlatforms = useMemo(
    () => platforms.filter((p) => p.platformName || p.productLink),
    [platforms]
  )

  const handleProductChange = (e) => {
    const { name, value } = e.target
    setProduct((prev) => ({ ...prev, [name]: value }))
  }

  const handlePlatformChange = (index, field, value) => {
    setPlatforms((prev) => {
      const next = [...prev]
      next[index] = { ...next[index], [field]: value }
      return next
    })
  }

  const addPlatform = () => {
    setPlatforms((prev) => [...prev, { platformName: '', productLink: '' }])
  }

  const removePlatform = (index) => {
    setPlatforms((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!product.productName.trim()) {
      setError('Product name is required')
      return
    }

    if (!companyId) {
      setError('Company profile not found. Please complete company setup first.')
      return
    }

    setLoading(true)
    try {
      await addProduct(user.uid, companyId, {
        ...product,
        platforms: validPlatforms,
      })
      navigate('/dashboard', { replace: true })
    } catch (submitError) {
      console.error('Failed to add product:', submitError)
      setError(submitError.message || 'Failed to save product')
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.main
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="container mx-auto px-4 md:px-6 py-12"
    >
      <div className="max-w-2xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="font-neo tracking-[0.08em] text-2xl md:text-3xl uppercase text-slate-100 mb-2">
            Add Product
          </h1>
          <p className="text-slate-400 text-sm md:text-base">
            Add product details and selling platforms for analysis.
          </p>
        </div>

        <div className="bg-gradient-to-b from-slate-800/40 to-slate-900/40 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 md:p-8">
          {error && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-slate-300 mb-2">Product Name *</label>
              <input
                type="text"
                name="productName"
                value={product.productName}
                onChange={handleProductChange}
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all"
                placeholder="Camlin Scissors"
              />
            </div>

            <div>
              <label className="block text-sm text-slate-300 mb-2">Product Category</label>
              <input
                type="text"
                name="category"
                value={product.category}
                onChange={handleProductChange}
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all"
                placeholder="Stationery"
              />
            </div>

            <div>
              <label className="block text-sm text-slate-300 mb-2">Product Description</label>
              <textarea
                name="description"
                value={product.description}
                onChange={handleProductChange}
                rows={3}
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all resize-none"
                placeholder="High precision scissors with ergonomic design"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-slate-300 mb-2">Price Range</label>
                <input
                  type="text"
                  name="priceRange"
                  value={product.priceRange}
                  onChange={handleProductChange}
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all"
                  placeholder="INR 50-200"
                />
              </div>

              <div>
                <label className="block text-sm text-slate-300 mb-2">Primary Market Region</label>
                <input
                  type="text"
                  name="primaryMarket"
                  value={product.primaryMarket}
                  onChange={handleProductChange}
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all"
                  placeholder="India"
                />
              </div>
            </div>

            <div className="pt-2">
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm text-slate-300">Selling Platforms</label>
                <button
                  type="button"
                  onClick={addPlatform}
                  className="px-3 py-1.5 text-sm bg-purple-500/20 hover:bg-purple-500/30 border border-purple-400/40 rounded-lg text-purple-200 flex items-center gap-1"
                >
                  <Plus size={14} /> Add Platform
                </button>
              </div>

              <div className="space-y-3">
                {platforms.map((platform, index) => (
                  <div key={index} className="p-3 border border-slate-700/40 rounded-lg bg-slate-900/40 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-400">Platform {index + 1}</span>
                      {platforms.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removePlatform(index)}
                          className="text-red-300 hover:text-red-200"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>

                    <select
                      value={platform.platformName}
                      onChange={(e) => handlePlatformChange(index, 'platformName', e.target.value)}
                      className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all"
                    >
                      <option value="">Select platform name</option>
                      {PLATFORM_OPTIONS.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>

                    <input
                      type="url"
                      value={platform.productLink}
                      onChange={(e) => handlePlatformChange(index, 'productLink', e.target.value)}
                      className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all"
                      placeholder="https://..."
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 grid grid-cols-1 md:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="px-6 py-3 bg-slate-800/60 hover:bg-slate-700/60 border border-slate-700/50 text-slate-300 rounded-lg"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-medium rounded-lg"
              >
                {loading ? 'Saving Product...' : 'Save Product'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </motion.main>
  )
}
