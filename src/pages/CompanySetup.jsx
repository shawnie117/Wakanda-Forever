import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getCompanyProfile, saveCompanyProfile } from '../firebase/firestoreService'
import locationData from '../data/indiaLocations.json'

const INDUSTRIES = [
  'Technology',
  'E-commerce',
  'Food & Beverage',
  'Fashion',
  'Electronics',
  'Health & Wellness',
  'Home & Garden',
  'Sports',
  'Beauty',
  'Other',
]

const COUNTRIES = ['India', 'USA', 'UK', 'Canada', 'Australia', 'UAE']

export default function CompanySetup() {
  const navigate = useNavigate()
  const { user, markCompanyProfileComplete } = useAuth()

  const [loading, setLoading] = useState(false)
  const [checkingExisting, setCheckingExisting] = useState(true)
  const [error, setError] = useState('')
  const [availableStates, setAvailableStates] = useState([])
  const [availableCities, setAvailableCities] = useState([])

  const [company, setCompany] = useState({
    companyName: '',
    gstNumber: '',
    industry: '',
    website: '',
    country: 'India',
    state: '',
    city: '',
  })

  useEffect(() => {
    const states = Object.keys(locationData[company.country] || {})
    setAvailableStates(states)
  }, [company.country])

  useEffect(() => {
    if (!company.state) {
      setAvailableCities([])
      return
    }
    setAvailableCities(locationData[company.country]?.[company.state] || [])
  }, [company.country, company.state])

  useEffect(() => {
    async function checkExistingCompany() {
      if (!user?.uid) {
        setCheckingExisting(false)
        return
      }

      try {
        const profile = await getCompanyProfile(user.uid)
        if (profile) {
          markCompanyProfileComplete()
          navigate('/dashboard', { replace: true })
          return
        }
      } catch (profileError) {
        console.error('Company lookup failed:', profileError)
      } finally {
        setCheckingExisting(false)
      }
    }

    checkExistingCompany()
  }, [user, navigate, markCompanyProfileComplete])

  const handleCompanyChange = (e) => {
    const { name, value } = e.target
    if (name === 'country') {
      setCompany((prev) => ({ ...prev, country: value, state: '', city: '' }))
      return
    }
    if (name === 'state') {
      setCompany((prev) => ({ ...prev, state: value, city: '' }))
      return
    }
    setCompany((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!company.companyName.trim()) {
      setError('Company name is required')
      return
    }

    setLoading(true)
    try {
      await saveCompanyProfile(user.uid, company)
      markCompanyProfileComplete()
      navigate('/dashboard', { replace: true })
    } catch (submitError) {
      console.error('Failed to save company:', submitError)
      setError(submitError.message || 'Failed to save company details')
    } finally {
      setLoading(false)
    }
  }

  if (checkingExisting) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#020204] via-[#07010f] to-[#140024] flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    )
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
            Company Setup
          </h1>
          <p className="text-slate-400 text-sm md:text-base">
            Add your company details once to unlock dashboard insights.
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
              <label className="block text-sm text-slate-300 mb-2">Company Name *</label>
              <input
                type="text"
                name="companyName"
                value={company.companyName}
                onChange={handleCompanyChange}
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all"
                placeholder="Your company name"
              />
            </div>

            <div>
              <label className="block text-sm text-slate-300 mb-2">GST Number (Optional)</label>
              <input
                type="text"
                name="gstNumber"
                value={company.gstNumber}
                onChange={(e) => handleCompanyChange({ target: { name: 'gstNumber', value: e.target.value.toUpperCase() } })}
                maxLength={15}
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all"
                placeholder="27AABCT1234A1Z5"
              />
            </div>

            <div>
              <label className="block text-sm text-slate-300 mb-2">Industry</label>
              <select
                name="industry"
                value={company.industry}
                onChange={handleCompanyChange}
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-lg text-white focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all"
              >
                <option value="">Select industry</option>
                {INDUSTRIES.map((industry) => (
                  <option key={industry} value={industry}>
                    {industry}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm text-slate-300 mb-2">Company Website</label>
              <input
                type="url"
                name="website"
                value={company.website}
                onChange={handleCompanyChange}
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all"
                placeholder="https://yourcompany.com"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm text-slate-300 mb-2">Country</label>
                <select
                  name="country"
                  value={company.country}
                  onChange={handleCompanyChange}
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-lg text-white focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all"
                >
                  {COUNTRIES.map((country) => (
                    <option key={country} value={country}>
                      {country}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm text-slate-300 mb-2">State</label>
                <select
                  name="state"
                  value={company.state}
                  onChange={handleCompanyChange}
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-lg text-white focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all"
                >
                  <option value="">Select state</option>
                  {availableStates.map((state) => (
                    <option key={state} value={state}>
                      {state}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm text-slate-300 mb-2">City</label>
                <select
                  name="city"
                  value={company.city}
                  onChange={handleCompanyChange}
                  disabled={!company.state}
                  className={`w-full px-4 py-3 bg-slate-900/50 border rounded-lg text-white focus:outline-none focus:ring-2 transition-all ${
                    !company.state
                      ? 'border-slate-700/50 opacity-50 cursor-not-allowed'
                      : 'border-slate-700/50 focus:border-purple-500/50 focus:ring-purple-500/20'
                  }`}
                >
                  <option value="">Select city</option>
                  {availableCities.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-all"
            >
              {loading ? 'Saving...' : 'Save Company & Continue'}
            </button>
          </form>
        </div>
      </div>
    </motion.main>
  )
}
