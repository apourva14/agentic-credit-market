/**
 * WFAP 1.0 - Wells Fargo Agent Protocol Service Layer
 * 
 * This service handles WFAP protocol operations including message processing,
 * identity verification, and digital signature validation.
 */

import { 
  createIntentMessage, 
  createOfferMessage, 
  createAcceptanceMessage,
  createRejectionMessage,
  createCounterOfferMessage,
  validateWFAPMessage,
  MESSAGE_TYPES,
  SENDER_TYPES,
  PRODUCT_TYPES
} from '../schemas/wfapSchemas'

/**
 * Mock digital signature verification
 * In a real implementation, this would verify the digital signature using cryptographic methods
 * @param {Object} message - The message to verify
 * @param {string} expectedSender - The expected sender name
 * @returns {Object} Verification result
 */
export const verifyDigitalSignature = (message, expectedSender) => {
  // Simulate signature verification delay
  const startTime = Date.now()
  
  // Mock verification logic - in reality this would:
  // 1. Extract the signature from the message
  // 2. Retrieve the sender's public key using signatureCertId
  // 3. Verify the signature against the message content
  // 4. Check certificate validity and trust chain
  
  const isValid = message.signature && 
                  message.signatureCertId && 
                  message.senderName === expectedSender &&
                  message.signature.includes(expectedSender.replace(/\s+/g, '_'))
  
  return {
    isValid,
    verifiedSender: expectedSender,
    verificationTimestamp: new Date().toISOString(),
    processingTimeMs: Date.now() - startTime,
    certificateId: message.signatureCertId,
    signatureAlgorithm: "RSA-SHA256", // Mock algorithm
    trustLevel: isValid ? "HIGH" : "NONE"
  }
}

/**
 * Mock identity verification with WFAP compliance
 * @param {Object} intentMessage - The WFAP intent message
 * @returns {Promise<Object>} Verification result
 */
export const verifyIdentityWFAP = async (intentMessage) => {
  // Simulate API delay for identity verification
  await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000))
  
  // Mock verification based on company name and credentials
  // In reality this would:
  // 1. Verify the digital certificate
  // 2. Check KYC databases
  // 3. Perform AML screening
  // 4. Validate business registration
  
  const isVerified = Math.random() > 0.2 // 80% success rate for demo
  
  return {
    isVerified,
    verificationDetails: {
      kycStatus: isVerified ? "verified" : "failed",
      amlStatus: isVerified ? "clear" : "pending",
      creditCheck: isVerified ? "completed" : "failed",
      businessRegistration: isVerified ? "valid" : "invalid",
      timestamp: new Date().toISOString(),
      verificationId: `VERIFY_${intentMessage.senderId}_${Date.now()}`,
      riskLevel: isVerified ? (Math.random() > 0.5 ? "LOW" : "MEDIUM") : "HIGH"
    },
    complianceFlags: {
      kycVerified: isVerified,
      amlScreening: isVerified ? "clear" : "flagged",
      creditScoreAvailable: isVerified,
      regulatoryCompliant: isVerified
    }
  }
}

/**
 * Convert existing intent data to WFAP Intent message
 * @param {Object} existingIntent - The existing intent from the form
 * @returns {Object} WFAP-compliant Intent message
 */
export const convertToWFAPIntent = (existingIntent) => {
  return createIntentMessage({
    companyName: existingIntent.companyName,
    amount: existingIntent.amount,
    duration: existingIntent.duration,
    purpose: existingIntent.purpose,
    productType: existingIntent.product_type || existingIntent.productType || "BusinessLineOfCredit",
    currency: existingIntent.currency || "USD",
    maxRate: existingIntent.maxRate,
    esgPriority: existingIntent.esgPriority || existingIntent.esg_priority || "Medium",
    industry: existingIntent.industry || existingIntent.customer_profile?.industry,
    annualRevenue: existingIntent.annualRevenue || existingIntent.customer_profile?.annual_revenue,
    creditScore: existingIntent.creditScore || existingIntent.customer_profile?.credit_score,
    esgProfile: existingIntent.esgProfile || existingIntent.customer_profile?.esg_profile,
    excludeHighCarbon: existingIntent.excludeHighCarbon || existingIntent.esg_preferences?.exclude_high_carbon,
    preferredGreenCertification: existingIntent.preferredGreenCertification || existingIntent.esg_preferences?.preferred_green_certification
  })
}

/**
 * Convert LLM offer response to WFAP Offer message
 * @param {Object} llmOffer - The offer from LLM service
 * @param {string} bankName - The bank name
 * @param {Object} intentMessage - The original WFAP intent message
 * @returns {Object} WFAP-compliant Offer message
 */
export const convertToWFAPOffer = (llmOffer, bankName, intentMessage) => {
  const offerData = llmOffer.offer || {}
  
  return createOfferMessage({
    bankName,
    creditLimit: offerData.credit_limit || offerData.approvedAmount || 0,
    interestRate: offerData.interest_rate || 0,
    termLength: offerData.term_length || offerData.term || 12,
    repaymentSchedule: offerData.repayment_schedule,
    esgRating: offerData.esg_rating || 70,
    carbonAdjustment: offerData.carbon_adjustment || 0,
    esgSummary: offerData.esg_summary || offerData.offer_explanation || "Standard ESG assessment completed",
    creditGrade: offerData.credit_grade || "A"
  }, intentMessage)
}

/**
 * Process a WFAP message through the protocol
 * @param {Object} message - The WFAP message to process
 * @returns {Promise<Object>} Processing result
 */
export const processWFAPMessage = async (message) => {
  // Validate message structure
  const validation = validateWFAPMessage(message)
  if (!validation.isValid) {
    throw new Error(`Invalid WFAP message: ${validation.errors.join(', ')}`)
  }
  
  // Verify digital signature
  const verification = verifyDigitalSignature(message, message.senderName)
  
  if (!verification.isValid) {
    throw new Error(`Invalid digital signature for message from ${message.senderName}`)
  }
  
  // Process based on message type
  let processingResult = {
    message,
    verification,
    processedAt: new Date().toISOString(),
    status: "processed"
  }
  
  switch (message.messageType) {
    case MESSAGE_TYPES.INTENT:
      processingResult.action = "intent_received"
      processingResult.nextSteps = ["verify_identity", "evaluate_terms", "generate_offer"]
      break
      
    case MESSAGE_TYPES.OFFER:
      processingResult.action = "offer_received"
      processingResult.nextSteps = ["evaluate_offer", "compare_with_others", "make_decision"]
      break
      
    case MESSAGE_TYPES.ACCEPTANCE:
      processingResult.action = "offer_accepted"
      processingResult.nextSteps = ["finalize_terms", "execute_agreement", "close_other_offers"]
      break
      
    case MESSAGE_TYPES.REJECTION:
      processingResult.action = "offer_rejected"
      processingResult.nextSteps = ["notify_bank", "continue_negotiations"]
      break
      
    case MESSAGE_TYPES.COUNTER_OFFER:
      processingResult.action = "counter_offer_received"
      processingResult.nextSteps = ["evaluate_counter", "respond_with_updated_offer"]
      break
      
    default:
      processingResult.action = "unknown_message_type"
      processingResult.status = "error"
  }
  
  return processingResult
}

/**
 * Generate a WFAP-compliant audit log entry
 * @param {Object} message - The WFAP message
 * @param {Object} processingResult - The processing result
 * @returns {Object} Audit log entry
 */
export const generateWFAPAuditEntry = (message, processingResult) => {
  return {
    timestamp: new Date().toISOString(),
    messageId: message.messageId,
    messageType: message.messageType,
    senderId: message.senderId,
    senderName: message.senderName,
    action: processingResult.action,
    status: processingResult.status,
    verificationStatus: processingResult.verification.isValid ? "VERIFIED" : "FAILED",
    processingTimeMs: processingResult.verification.processingTimeMs,
    nextSteps: processingResult.nextSteps || [],
    auditId: `AUDIT_${message.messageId}_${Date.now()}`
  }
}

/**
 * Create a WFAP message summary for display
 * @param {Object} message - The WFAP message
 * @returns {Object} Message summary
 */
export const createWFAPMessageSummary = (message) => {
  const summary = {
    messageId: message.messageId,
    messageType: message.messageType,
    sender: message.senderName,
    timestamp: message.timestamp,
    status: "processed"
  }
  
  switch (message.messageType) {
    case MESSAGE_TYPES.INTENT:
      summary.details = {
        amount: message.amount,
        purpose: message.purpose,
        term: message.term,
        currency: message.currency
      }
      break
      
    case MESSAGE_TYPES.OFFER:
      summary.details = {
        approvedAmount: message.approvedAmount,
        interestRate: message.interestRate,
        term: message.term,
        esgScore: message.esgScore
      }
      break
      
    case MESSAGE_TYPES.ACCEPTANCE:
      summary.details = {
        acceptedOffer: message.acceptedOfferId,
        finalAmount: message.finalTerms?.amount,
        finalRate: message.finalTerms?.interestRate
      }
      break
      
    case MESSAGE_TYPES.REJECTION:
      summary.details = {
        rejectedOffer: message.rejectedOfferId,
        reason: message.reason
      }
      break
      
    case MESSAGE_TYPES.COUNTER_OFFER:
      summary.details = {
        counterTerms: message.counterTerms,
        originalOffer: message.inResponseTo
      }
      break
  }
  
  return summary
}

/**
 * Batch process multiple WFAP messages
 * @param {Array} messages - Array of WFAP messages
 * @returns {Promise<Array>} Array of processing results
 */
export const batchProcessWFAPMessages = async (messages) => {
  const results = []
  
  for (const message of messages) {
    try {
      const result = await processWFAPMessage(message)
      results.push(result)
    } catch (error) {
      results.push({
        message,
        error: error.message,
        status: "failed",
        processedAt: new Date().toISOString()
      })
    }
  }
  
  return results
}

/**
 * Get WFAP protocol statistics
 * @param {Array} messages - Array of processed WFAP messages
 * @returns {Object} Protocol statistics
 */
export const getWFAPStatistics = (messages) => {
  const stats = {
    totalMessages: messages.length,
    messageTypes: {},
    verifiedMessages: 0,
    failedMessages: 0,
    averageProcessingTime: 0,
    uniqueSenders: new Set(),
    timeRange: {
      earliest: null,
      latest: null
    }
  }
  
  let totalProcessingTime = 0
  
  messages.forEach(message => {
    // Count message types
    stats.messageTypes[message.messageType] = (stats.messageTypes[message.messageType] || 0) + 1
    
    // Count verification status
    if (message.verification?.isValid) {
      stats.verifiedMessages++
    } else {
      stats.failedMessages++
    }
    
    // Track processing time
    if (message.verification?.processingTimeMs) {
      totalProcessingTime += message.verification.processingTimeMs
    }
    
    // Track unique senders
    stats.uniqueSenders.add(message.senderName)
    
    // Track time range
    const messageTime = new Date(message.timestamp)
    if (!stats.timeRange.earliest || messageTime < stats.timeRange.earliest) {
      stats.timeRange.earliest = messageTime
    }
    if (!stats.timeRange.latest || messageTime > stats.timeRange.latest) {
      stats.timeRange.latest = messageTime
    }
  })
  
  stats.averageProcessingTime = stats.totalMessages > 0 ? totalProcessingTime / stats.totalMessages : 0
  stats.uniqueSenders = stats.uniqueSenders.size
  
  return stats
}
