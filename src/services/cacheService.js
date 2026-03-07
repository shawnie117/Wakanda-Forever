/**
 * cacheService.js
 * Persistent localStorage cache for AI analysis results.
 * Data survives page navigation and browser refresh.
 * Only cleared when user resets product or manually re-runs analysis.
 */

const PREFIX = 'vibranium_cache_'
const VERSION = 'v2'

function key(productName, type) {
  const safe = String(productName || 'unknown').toLowerCase().replace(/[^a-z0-9]/g, '_').slice(0, 40)
  return `${PREFIX}${VERSION}_${safe}_${type}`
}

export function saveCache(productName, type, data) {
  try {
    const payload = JSON.stringify({ data, ts: Date.now() })
    localStorage.setItem(key(productName, type), payload)
  } catch (e) {
    console.warn('Cache save failed:', e)
  }
}

export function loadCache(productName, type, maxAgeMs = 24 * 60 * 60 * 1000) {
  try {
    const raw = localStorage.getItem(key(productName, type))
    if (!raw) return null
    const { data, ts } = JSON.parse(raw)
    if (Date.now() - ts > maxAgeMs) return null // expired
    return data
  } catch {
    return null
  }
}

export function clearCache(productName, type) {
  try {
    localStorage.removeItem(key(productName, type))
  } catch {}
}

export function clearAllCache(productName) {
  try {
    const prefix = key(productName, '')
    Object.keys(localStorage)
      .filter((k) => k.startsWith(prefix.slice(0, -1)))
      .forEach((k) => localStorage.removeItem(k))
  } catch {}
}

// Named cache types
export const CACHE_TYPES = {
  ANALYSIS: 'analysis',
  COMPARISON: 'comparison',
  MARKET_INTELLIGENCE: 'market_intelligence',
  INSIGHTS: 'insights',
  COMPETITOR_DISCOVERY: 'competitor_discovery',
  REGIONAL: 'regional',
}
