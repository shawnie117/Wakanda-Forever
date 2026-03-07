/**
 * GST Lookup Service
 * Validates GST number and fetches company details
 */

// Mock GST database for demo (replace with real API call)
const MOCK_GST_DATABASE = {
  '27AABCT1234A1Z0': {
    companyName: 'ABC Technology Solutions Pvt Ltd',
    businessName: 'ABC Tech Solutions',
    industry: 'Technology',
    state: 'Telangana',
    city: 'Hyderabad',
    website: 'https://abctech.com',
  },
  '29AABCA1234A1Z0': {
    companyName: 'XYZ E-commerce Pvt Ltd',
    businessName: 'XYZ Commerce',
    industry: 'E-commerce',
    state: 'Maharashtra',
    city: 'Mumbai',
    website: 'https://xyzcommerce.com',
  },
  '06AABCT1234A1Z0': {
    companyName: 'Delicious Foods India Pvt Ltd',
    businessName: 'Delicious Foods',
    industry: 'Food & Beverage',
    state: 'Gujarat',
    city: 'Ahmedabad',
    website: 'https://deliciousfoods.com',
  },
  '22AABCT1234A1Z0': {
    companyName: 'Fashion Hub India Pvt Ltd',
    businessName: 'Fashion Hub',
    industry: 'Fashion',
    state: 'Karnataka',
    city: 'Bangalore',
    website: 'https://fashionhub.com',
  },
}

/**
 * Validate GST number format (Indian GSTIN)
 * Format: 2 digits (state code) + 5 letters + 4 digits + 1 letter + 1 alphanumeric + Z + 1 alphanumeric
 * Total: 15 characters
 * Example: 27AABCT1234A1Z5
 */
export function validateGSTFormat(gstNumber) {
  // Convert to uppercase for validation
  const upperGST = gstNumber.toUpperCase().trim()
  
  // Correct GSTIN regex pattern
  const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][0-9A-Z]Z[0-9A-Z]$/
  
  return gstRegex.test(upperGST)
}

/**
 * Get Indian state code to state name mapping
 */
const STATE_CODES = {
  '01': 'Andhra Pradesh',
  '02': 'Arunachal Pradesh',
  '03': 'Assam',
  '04': 'Bihar',
  '05': 'Chhattisgarh',
  '06': 'Goa',
  '07': 'Gujarat',
  '08': 'Haryana',
  '09': 'Himachal Pradesh',
  '10': 'Jharkhand',
  '11': 'Karnataka',
  '12': 'Kerala',
  '13': 'Madhya Pradesh',
  '14': 'Maharashtra',
  '15': 'Manipur',
  '16': 'Meghalaya',
  '17': 'Mizoram',
  '18': 'Nagaland',
  '19': 'Odisha',
  '20': 'Punjab',
  '21': 'Rajasthan',
  '22': 'Sikkim',
  '23': 'Tamil Nadu',
  '24': 'Telangana',
  '25': 'Tripura',
  '26': 'Uttar Pradesh',
  '27': 'Uttarakhand',
  '28': 'West Bengal',
  '29': 'Delhi',
}

/**
 * Extract state code from GST number
 */
function getStateFromGST(gstNumber) {
  const stateCode = gstNumber.substring(0, 2)
  return STATE_CODES[stateCode] || null
}

/**
 * Lookup company details using GST number
 * This integrates with mock data (replace with real API)
 *
 * Real API options:
 * 1. GST Portal API (requires authentication)
 * 2. Third-party APIs: Zoho, Shuup, etc.
 * 3. Custom backend integration
 */
export async function lookupGSTDetails(gstNumber) {
  try {
    // Validate format first
    if (!validateGSTFormat(gstNumber)) {
      return {
        success: false,
        error: 'GST must be a valid 15 character GSTIN. Example: 27AABCT1234A1Z5',
      }
    }

    const upperGST = gstNumber.toUpperCase()

    // Extract state from GST code (first 2 digits)
    const state = getStateFromGST(upperGST)

    // Try to fetch from mock database
    // In production, replace this with real API call
    const mockData = MOCK_GST_DATABASE[upperGST]

    if (mockData) {
      // Found in database - return complete data
      return {
        success: true,
        data: {
          companyName: mockData.companyName,
          industry: mockData.industry,
          state: mockData.state,
          city: mockData.city,
          website: mockData.website,
        },
        message: 'GST verified! Company details loaded.',
      }
    }

    // Not in mock database but GST format is valid
    // Return state (always available) and mark as partial
    return {
      success: true,
      data: {
        companyName: '', // Can be filled manually
        industry: '',
        state: state || '',
        city: '', // Can be filled manually
        website: '', // Can be filled manually
      },
      message: `GST verified! State identified as ${state || 'Unknown'}. Please complete other details manually.`,
      isPartialData: true,
      foundInDatabase: false,
    }
  } catch (error) {
    console.error('GST lookup error:', error)
    return {
      success: false,
      error: error.message || 'Failed to lookup GST details',
    }
  }
}

/**
 * Real GST API Integration Example (for production)
 * Uncomment and modify to use real API
 *
 * Option 1: Using custom backend
 */
export async function lookupGSTDetailsViaBackend(gstNumber) {
  try {
    const response = await fetch('/api/gst/lookup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ gstNumber }),
    })

    if (!response.ok) {
      throw new Error('GST lookup failed')
    }

    return await response.json()
  } catch (error) {
    console.error('Backend GST lookup error:', error)
    return {
      success: false,
      error: error.message,
    }
  }
}

/**
 * Option 2: Using Third-party GST API (e.g., via RapidAPI or similar)
 */
export async function lookupGSTDetailsViaThirdParty(gstNumber) {
  const apiKey = import.meta.env.VITE_GST_API_KEY
  const apiHost = import.meta.env.VITE_GST_API_HOST

  if (!apiKey || !apiHost) {
    console.warn('GST API credentials not configured')
    return { success: false, error: 'GST API not configured' }
  }

  try {
    const response = await fetch(`https://${apiHost}/api/gst/lookup?gst=${gstNumber}`, {
      method: 'GET',
      headers: {
        'x-rapidapi-key': apiKey,
        'x-rapidapi-host': apiHost,
      },
    })

    if (!response.ok) {
      throw new Error('GST lookup failed')
    }

    const data = await response.json()

    return {
      success: true,
      data: {
        companyName: data.companyName || data.businessName || '',
        industry: data.industry || '',
        state: data.state || '',
        city: data.city || '',
        website: data.website || '',
      },
    }
  } catch (error) {
    console.error('Third-party GST lookup error:', error)
    return {
      success: false,
      error: error.message,
    }
  }
}

/**
 * Get demo GST numbers for testing
 */
export function getDemoGSTNumbers() {
  return Object.keys(MOCK_GST_DATABASE)
}
