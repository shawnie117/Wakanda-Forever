import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Rocket, Target, Users, TrendingUp, Globe, Settings2, ArrowRight, ArrowLeft, Plus, X, Check,
} from 'lucide-react'
import {
  useProduct,
  SAAS_CATEGORIES,
  CUSTOMER_SEGMENTS,
  BUSINESS_MODELS,
  MARKET_REGIONS,
  USER_PERSONAS,
  COMPETITOR_PLATFORMS,
  ANALYSIS_FEATURES,
} from '../context/ProductContext'

// ─── Shared Components ──────────────────────────────────────────────────────

function Field({ label, required, hint, children }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-purple-300 mb-1.5">
        {label} {required && <span className="text-red-400">*</span>}
        {hint && <span className="text-xs text-slate-500 font-normal ml-2">{hint}</span>}
      </label>
      {children}
    </div>
  )
}

function Input({ value, onChange, placeholder, type = 'text' }) {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-purple-500 text-white placeholder-slate-600 text-sm transition-all"
    />
  )
}

function Textarea({ value, onChange, placeholder, rows = 3 }) {
  return (
    <textarea
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      rows={rows}
      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-purple-500 text-white placeholder-slate-600 text-sm resize-none transition-all"
    />
  )
}

function ToggleChip({ label, selected, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
        selected
          ? 'bg-purple-600/40 border-purple-500 text-purple-200'
          : 'bg-white/5 border-white/10 text-slate-400 hover:border-purple-500/50 hover:text-slate-200'
      }`}
    >
      {selected && <span className="mr-1 text-xs">✓</span>}
      {label}
    </button>
  )
}

function TagInput({ tags, onAdd, onRemove, placeholder }) {
  const [input, setInput] = useState('')
  const add = () => {
    const v = input.trim()
    if (!v || tags.includes(v)) { setInput(''); return }
    onAdd(v)
    setInput('')
  }
  return (
    <div>
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && add()}
          placeholder={placeholder}
          className="flex-1 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-purple-500 text-white placeholder-slate-600 text-sm"
        />
        <button
          type="button"
          onClick={add}
          className="px-3 py-2.5 bg-purple-600/40 border border-purple-500/50 rounded-xl text-purple-200 hover:bg-purple-600/60 transition-all"
        >
          <Plus size={18} />
        </button>
      </div>
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {tags.map((t) => (
            <span key={t} className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-500/20 border border-purple-500/30 rounded-full text-purple-200 text-xs">
              {t}
              <button type="button" onClick={() => onRemove(t)} className="text-purple-400 hover:text-red-300"><X size={11} /></button>
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Step Renderers ──────────────────────────────────────────────────────────

function Step1({ data, onChange }) {
  const toggle = (key, val) => {
    const arr = data.customerSegments || []
    onChange('customerSegments', arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val])
  }
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 rounded-xl bg-purple-500/20"><Rocket className="text-purple-300" size={22} /></div>
        <h2 className="text-xl font-bold text-white">Product Information</h2>
      </div>

      <Field label="Product Name" required><Input value={data.productName} onChange={(e) => onChange('productName', e.target.value)} placeholder="e.g., Vibranium Intelligence" /></Field>
      <Field label="Product Website URL"><Input type="url" value={data.websiteUrl} onChange={(e) => onChange('websiteUrl', e.target.value)} placeholder="https://yourproduct.ai" /></Field>

      <Field label="Product Category / Industry" required>
        <select
          value={data.category}
          onChange={(e) => onChange('category', e.target.value)}
          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-purple-500 text-white appearance-none cursor-pointer text-sm"
        >
          <option value="" className="bg-slate-900">Select category</option>
          {SAAS_CATEGORIES.map((c) => <option key={c} value={c} className="bg-slate-900">{c}</option>)}
        </select>
      </Field>

      <Field label="Product Description" hint="What does your SaaS product do?">
        <Textarea value={data.description} onChange={(e) => onChange('description', e.target.value)} placeholder="Describe what your SaaS product does, who it's for, and the key value it delivers..." rows={3} />
      </Field>

      <Field label="Target Customer Segment">
        <div className="flex flex-wrap gap-2 mt-1">
          {CUSTOMER_SEGMENTS.map((s) => (
            <ToggleChip key={s} label={s} selected={(data.customerSegments || []).includes(s)} onClick={() => toggle('customerSegments', s)} />
          ))}
        </div>
      </Field>
    </div>
  )
}

function Step2({ data, onChange }) {
  const toggleModel = (val) => onChange('businessModel', data.businessModel === val ? '' : val)
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 rounded-xl bg-purple-500/20"><Target className="text-purple-300" size={22} /></div>
        <h2 className="text-xl font-bold text-white">Product Positioning</h2>
      </div>

      <Field label="Core Problem the Product Solves">
        <Textarea value={data.coreProblem} onChange={(e) => onChange('coreProblem', e.target.value)} placeholder="What problem does your product solve?" rows={3} />
      </Field>

      <Field label="Key Features" hint="Press Enter to add">
        <TagInput
          tags={data.keyFeatures || []}
          onAdd={(v) => onChange('keyFeatures', [...(data.keyFeatures || []), v])}
          onRemove={(v) => onChange('keyFeatures', (data.keyFeatures || []).filter((x) => x !== v))}
          placeholder="Type a feature and press Enter"
        />
      </Field>

      <Field label="Unique Value Proposition">
        <Textarea value={data.uvp} onChange={(e) => onChange('uvp', e.target.value)} placeholder="What makes your product unique compared to alternatives?" rows={2} />
      </Field>

      <Field label="Business Model">
        <div className="flex flex-wrap gap-2 mt-1">
          {BUSINESS_MODELS.map((m) => (
            <ToggleChip key={m} label={m} selected={data.businessModel === m} onClick={() => toggleModel(m)} />
          ))}
        </div>
      </Field>

      <Field label="Pricing Tier Range">
        <Input value={data.pricingRange} onChange={(e) => onChange('pricingRange', e.target.value)} placeholder="e.g., $49/mo – $499/mo" />
      </Field>
    </div>
  )
}

function Step3({ data, onChange }) {
  const toggle = (key, val) => {
    const arr = data[key] || []
    onChange(key, arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val])
  }
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 rounded-xl bg-purple-500/20"><Users className="text-purple-300" size={22} /></div>
        <h2 className="text-xl font-bold text-white">Target Market</h2>
      </div>

      <Field label="Primary Market Region">
        <select value={data.marketRegion || ''} onChange={(e) => onChange('marketRegion', e.target.value)} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-purple-500 text-white appearance-none text-sm">
          <option value="" className="bg-slate-900">Select region</option>
          {MARKET_REGIONS.map((r) => <option key={r} value={r} className="bg-slate-900">{r}</option>)}
        </select>
      </Field>

      <Field label="Target Industries" hint="e.g., FinTech, Healthcare, Retail">
        <TagInput
          tags={data.targetIndustries || []}
          onAdd={(v) => onChange('targetIndustries', [...(data.targetIndustries || []), v])}
          onRemove={(v) => onChange('targetIndustries', (data.targetIndustries || []).filter((x) => x !== v))}
          placeholder="Add target industry"
        />
      </Field>

      <Field label="Target Company Size">
        <div className="flex flex-wrap gap-2 mt-1">
          {['Startup', 'SMB', 'Mid-Market', 'Enterprise'].map((s) => (
            <ToggleChip key={s} label={s} selected={(data.companySizes || []).includes(s)} onClick={() => toggle('companySizes', s)} />
          ))}
        </div>
      </Field>

      <Field label="Primary User Persona">
        <div className="flex flex-wrap gap-2 mt-1">
          {USER_PERSONAS.map((p) => (
            <ToggleChip key={p} label={p} selected={(data.userPersonas || []).includes(p)} onClick={() => toggle('userPersonas', p)} />
          ))}
        </div>
      </Field>
    </div>
  )
}

function Step4({ data, onChange }) {
  const toggle = (val) => {
    const arr = data.competitorPlatforms || []
    onChange('competitorPlatforms', arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val])
  }
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 rounded-xl bg-purple-500/20"><TrendingUp className="text-purple-300" size={22} /></div>
        <h2 className="text-xl font-bold text-white">Competitor Discovery</h2>
      </div>

      <Field label="Known Competitors" required>
        <TagInput
          tags={data.competitors || []}
          onAdd={(v) => onChange('competitors', [...(data.competitors || []), v])}
          onRemove={(v) => onChange('competitors', (data.competitors || []).filter((x) => x !== v))}
          placeholder="Add competitor name (e.g., Notion, Airtable)"
        />
      </Field>

      <Field label="Keywords to Search Competitors">
        <TagInput
          tags={data.competitorKeywords || []}
          onAdd={(v) => onChange('competitorKeywords', [...(data.competitorKeywords || []), v])}
          onRemove={(v) => onChange('competitorKeywords', (data.competitorKeywords || []).filter((x) => x !== v))}
          placeholder="Add search keyword"
        />
      </Field>

      <Field label="Alternative Product Categories">
        <TagInput
          tags={data.alternativeCategories || []}
          onAdd={(v) => onChange('alternativeCategories', [...(data.alternativeCategories || []), v])}
          onRemove={(v) => onChange('alternativeCategories', (data.alternativeCategories || []).filter((x) => x !== v))}
          placeholder="Add alternative category"
        />
      </Field>

      <Field label="Review Platforms Where Competitors Appear">
        <div className="flex flex-wrap gap-2 mt-1">
          {COMPETITOR_PLATFORMS.map((p) => (
            <ToggleChip key={p} label={p} selected={(data.competitorPlatforms || []).includes(p)} onClick={() => toggle(p)} />
          ))}
        </div>
      </Field>

      <Field label="Customer Reviews / Feedback" hint="Paste real reviews for accurate AI sentiment">
        <Textarea value={data.reviews || ''} onChange={(e) => onChange('reviews', e.target.value)} placeholder="Paste real customer reviews here. Each on a new line. The AI uses these to generate accurate sentiment analysis and feature insights." rows={4} />
      </Field>
    </div>
  )
}

function Step5({ data, onChange }) {
  const channels = data.distributionChannels?.length ? data.distributionChannels : [{ platform: '', url: '' }]

  const updateChannel = (i, field, val) => {
    const updated = channels.map((c, idx) => idx === i ? { ...c, [field]: val } : c)
    onChange('distributionChannels', updated)
  }

  const addChannel = () => {
    if (channels.length >= 6) return
    onChange('distributionChannels', [...channels, { platform: '', url: '' }])
  }

  const removeChannel = (i) => {
    if (channels.length <= 1) return
    onChange('distributionChannels', channels.filter((_, idx) => idx !== i))
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 rounded-xl bg-purple-500/20"><Globe className="text-purple-300" size={22} /></div>
        <h2 className="text-xl font-bold text-white">Distribution Channels</h2>
        <span className="text-xs text-slate-500">Where is your product listed or sold?</span>
      </div>

      <div className="space-y-3">
        {channels.map((ch, i) => (
          <div key={i} className="grid grid-cols-[1fr_1fr_auto] gap-3 items-center">
            <input
              type="text"
              value={ch.platform}
              onChange={(e) => updateChannel(i, 'platform', e.target.value)}
              placeholder={`e.g., Product Hunt`}
              className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-purple-500 text-white placeholder-slate-600 text-sm"
            />
            <input
              type="url"
              value={ch.url}
              onChange={(e) => updateChannel(i, 'url', e.target.value)}
              placeholder="https://..."
              className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-purple-500 text-white placeholder-slate-600 text-sm"
            />
            {channels.length > 1 && (
              <button type="button" onClick={() => removeChannel(i)} className="p-2 text-slate-500 hover:text-red-400 transition-colors">
                <X size={16} />
              </button>
            )}
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={addChannel}
        className="w-full py-3 border border-dashed border-purple-500/40 rounded-xl text-purple-400 text-sm hover:bg-purple-500/10 transition-all flex items-center justify-center gap-2"
      >
        <Plus size={16} /> Add Another Platform
      </button>
    </div>
  )
}

function Step6({ data, onChange }) {
  const prefs = data.analysisPreferences || {}
  const toggle = (key) => onChange('analysisPreferences', { ...prefs, [key]: !prefs[key] })

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 rounded-xl bg-purple-500/20"><Settings2 className="text-purple-300" size={22} /></div>
        <h2 className="text-xl font-bold text-white">Data Analysis Preferences</h2>
      </div>
      <p className="text-slate-400 text-sm -mt-2">Choose what AI analyses to run on your product.</p>

      <div className="space-y-3">
        {ANALYSIS_FEATURES.map((feat) => {
          const enabled = prefs[feat.key] !== false
          return (
            <div
              key={feat.key}
              className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-xl hover:border-purple-500/30 transition-all"
            >
              <div>
                <p className="text-white text-sm font-semibold">{feat.label}</p>
                <p className="text-slate-500 text-xs mt-0.5">{feat.desc}</p>
              </div>
              <button
                type="button"
                onClick={() => toggle(feat.key)}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 rounded-full border-2 transition-colors duration-200 ease-in-out ${enabled ? 'bg-purple-600 border-purple-600' : 'bg-slate-700 border-slate-700'}`}
              >
                <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ease-in-out ${enabled ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Step Config ─────────────────────────────────────────────────────────────

const STEPS = [
  { id: 1, icon: Rocket, label: 'Product Info' },
  { id: 2, icon: Target, label: 'Positioning' },
  { id: 3, icon: Users, label: 'Target Market' },
  { id: 4, icon: TrendingUp, label: 'Competitors' },
  { id: 5, icon: Globe, label: 'Distribution' },
  { id: 6, icon: Settings2, label: 'Analysis' },
]

// ─── Main Wizard ──────────────────────────────────────────────────────────────

export default function ProductSetup() {
  const { product, setProduct } = useProduct()
  const navigate = useNavigate()

  const [step, setStep] = useState(1)
  const [localData, setLocalData] = useState({ ...product })
  const [error, setError] = useState('')

  const onChange = (key, val) => {
    setLocalData((prev) => ({ ...prev, [key]: val }))
    setError('')
  }

  const validate = () => {
    if (step === 1 && !localData.productName?.trim()) { setError('Product name is required.'); return false }
    if (step === 1 && !localData.category) { setError('Please select a category.'); return false }
    if (step === 4 && (!localData.competitors?.length)) { setError('Add at least one competitor.'); return false }
    return true
  }

  const next = () => {
    if (!validate()) return
    if (step < STEPS.length) { setStep(step + 1) }
  }

  const prev = () => { if (step > 1) setStep(step - 1) }

  const handleSave = () => {
    if (!localData.productName?.trim()) { setError('Product name is required.'); return }
    setProduct(localData)
    navigate('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Step Stepper */}
        <div className="flex items-center justify-between mb-6 px-2">
          {STEPS.map((s, i) => {
            const Icon = s.icon
            const active = s.id === step
            const done = s.id < step
            return (
              <div key={s.id} className="flex items-center">
                <div className="flex flex-col items-center gap-1">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all ${done ? 'bg-purple-600 border-purple-600' : active ? 'bg-purple-600/30 border-purple-400' : 'bg-white/5 border-white/10'}`}>
                    {done ? <Check size={16} className="text-white" /> : <Icon size={16} className={active ? 'text-purple-300' : 'text-slate-500'} />}
                  </div>
                  <span className={`text-[9px] font-medium hidden sm:block ${active ? 'text-purple-300' : done ? 'text-slate-400' : 'text-slate-600'}`}>{s.label}</span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`h-0.5 w-6 sm:w-10 mx-1 rounded transition-all ${done ? 'bg-purple-600' : 'bg-white/10'}`} />
                )}
              </div>
            )
          })}
        </div>

        {/* Card */}
        <motion.div
          className="bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-2xl p-7 shadow-2xl"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
            >
              {step === 1 && <Step1 data={localData} onChange={onChange} />}
              {step === 2 && <Step2 data={localData} onChange={onChange} />}
              {step === 3 && <Step3 data={localData} onChange={onChange} />}
              {step === 4 && <Step4 data={localData} onChange={onChange} />}
              {step === 5 && <Step5 data={localData} onChange={onChange} />}
              {step === 6 && <Step6 data={localData} onChange={onChange} />}
            </motion.div>
          </AnimatePresence>

          {error && (
            <p className="mt-4 text-sm text-red-300 bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-2">
              {error}
            </p>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8">
            <button
              type="button"
              onClick={prev}
              disabled={step === 1}
              className="flex items-center gap-2 px-5 py-2.5 border border-white/10 rounded-xl text-slate-400 text-sm hover:border-purple-500/50 hover:text-purple-300 transition-all disabled:opacity-30 disabled:pointer-events-none"
            >
              <ArrowLeft size={16} /> Previous
            </button>

            {step < STEPS.length ? (
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                type="button"
                onClick={next}
                className="flex items-center gap-2 px-7 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl text-sm"
              >
                Next <ArrowRight size={16} />
              </motion.button>
            ) : (
              <motion.button
                whileHover={{ scale: 1.03, boxShadow: '0 0 30px rgba(168,85,247,0.5)' }}
                whileTap={{ scale: 0.97 }}
                type="button"
                onClick={handleSave}
                className="flex items-center gap-2 px-7 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl text-sm"
              >
                <Check size={16} /> Save & Start Analyzing
              </motion.button>
            )}
          </div>
        </motion.div>

        <p className="text-center text-slate-600 text-xs mt-4">
          Step {step} of {STEPS.length} · Your data is saved locally and used for AI analysis
        </p>
      </div>
    </div>
  )
}
