// Chat storage utilities for managing conversation history
const CHAT_STORAGE_KEY = 'agenticCreditMarket_chatSessions'
const SUMMARY_STORAGE_KEY = 'agenticCreditMarket_summaries'

// Get all chat sessions from localStorage
export const getChatSessions = () => {
  try {
    const stored = localStorage.getItem(CHAT_STORAGE_KEY)
    return stored ? JSON.parse(stored) : {}
  } catch (error) {
    console.error('Error reading chat sessions:', error)
    return {}
  }
}

// Save chat sessions to localStorage
export const saveChatSessions = (sessions) => {
  try {
    localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(sessions))
  } catch (error) {
    console.error('Error saving chat sessions:', error)
  }
}

// Get cached summaries from localStorage
export const getCachedSummaries = () => {
  try {
    const stored = localStorage.getItem(SUMMARY_STORAGE_KEY)
    return stored ? JSON.parse(stored) : {}
  } catch (error) {
    console.error('Error reading cached summaries:', error)
    return {}
  }
}

// Save cached summaries to localStorage
export const saveCachedSummaries = (summaries) => {
  try {
    localStorage.setItem(SUMMARY_STORAGE_KEY, JSON.stringify(summaries))
  } catch (error) {
    console.error('Error saving cached summaries:', error)
  }
}

// Get chat session for a specific deal
export const getChatSession = (dealId) => {
  const sessions = getChatSessions()
  return sessions[dealId] || {
    messages: [],
    status: 'pending_verification', // pending_verification, verified, in_progress, accepted, cancelled
    startedAt: new Date().toISOString(),
    lastActivity: new Date().toISOString()
  }
}

// Save chat session for a specific deal
export const saveChatSession = (dealId, session) => {
  const sessions = getChatSessions()
  sessions[dealId] = {
    ...session,
    lastActivity: new Date().toISOString()
  }
  saveChatSessions(sessions)
}

// Add message to chat session
export const addMessageToSession = (dealId, message) => {
  const session = getChatSession(dealId)
  const newMessage = {
    id: Date.now() + Math.random(),
    ...message,
    timestamp: new Date().toISOString()
  }
  
  session.messages.push(newMessage)
  saveChatSession(dealId, session)
  return newMessage
}

// Update chat session status
export const updateSessionStatus = (dealId, status) => {
  const session = getChatSession(dealId)
  session.status = status
  saveChatSession(dealId, session)
}

// Get cached summary for a deal
export const getCachedSummary = (dealId) => {
  const summaries = getCachedSummaries()
  return summaries[dealId]
}

// Cache summary for a deal
export const cacheSummary = (dealId, summary) => {
  const summaries = getCachedSummaries()
  summaries[dealId] = {
    content: summary,
    generatedAt: new Date().toISOString()
  }
  saveCachedSummaries(summaries)
}

// Get negotiation status based on chat messages
export const getNegotiationStatus = (chatSession) => {
  if (!chatSession || !chatSession.messages || chatSession.messages.length === 0) {
    return { stage: 'Not Started', description: 'Negotiation not yet initiated' }
  }

  const messages = chatSession.messages
  const status = chatSession.status

  // Check for different stages based on message types and status
  if (status === 'cancelled') {
    return { stage: 'Cancelled', description: 'Negotiation was cancelled' }
  }

  if (status === 'accepted') {
    return { stage: 'Completed', description: 'Deal successfully closed' }
  }

  if (status === 'pending_verification') {
    return { stage: 'Verifying', description: 'Awaiting identity verification' }
  }

  if (status === 'verified' || status === 'in_progress') {
    const bankOffers = messages.filter(msg => 
      msg.type === 'offer' || msg.type === 'counter_offer'
    ).filter(msg => msg.sender.includes('Bank') || msg.sender.includes('Financial') || msg.sender.includes('Capital'))

    const companyOffers = messages.filter(msg => 
      msg.type === 'counter_offer'
    ).filter(msg => !msg.sender.includes('Bank') && !msg.sender.includes('Financial') && !msg.sender.includes('Capital'))

    if (bankOffers.length === 0) {
      return { stage: 'Verified', description: 'Identity verified, awaiting initial offer' }
    }

    if (bankOffers.length === 1 && companyOffers.length === 0) {
      return { stage: 'Initial Offer', description: 'Bank made initial offer, awaiting company response' }
    }

    const totalOffers = bankOffers.length + companyOffers.length
    if (totalOffers > 1) {
      return { 
        stage: `Negotiating`, 
        description: `Round ${Math.ceil(totalOffers / 2)} - ${totalOffers % 2 === 0 ? 'Company response' : 'Bank response'} needed` 
      }
    }
  }

  return { stage: 'In Progress', description: 'Negotiation ongoing' }
}

// Clear all chat sessions (for development/testing)
export const clearAllChatSessions = () => {
  localStorage.removeItem(CHAT_STORAGE_KEY)
}

// Clear all cached summaries (for development/testing)
export const clearAllSummaries = () => {
  localStorage.removeItem(SUMMARY_STORAGE_KEY)
}

// Generate a unique deal ID for ongoing deals
export const generateDealId = (intentId, bankName) => {
  return `${intentId}-${bankName.replace(/\s+/g, '-').toLowerCase()}`
}

// Download text file utility
export const downloadTextFile = (content, filename) => {
  const blob = new Blob([content], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}