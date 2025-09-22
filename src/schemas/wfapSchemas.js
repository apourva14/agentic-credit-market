/**
 * WFAP 1.0 - Wells Fargo Agent Protocol Schemas
 * 
 * This file contains the core message schemas for the WFAP 1.0 protocol
 * as defined in the Wells Fargo Agent Protocol specification.
 */

export const WFAP_VERSION = "WFAP/1.0"

/**
 * Creates a WFAP-compliant Intent message (Credit Request)
 * @param {Object} intentData - The intent data from the form
 * @returns {Object} WFAP-compliant Intent message
 */
export const createIntentMessage = (intentData) => {
  const messageId = `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  const senderId = intentData.companyName.replace(/\s+/g, '_').toUpperCase()
  
  return {
    // Header Fields
    messageId,
    messageType: "Intent",
    version: WFAP_VERSION,
    timestamp: new Date().toISOString(),
    
    // Requester Identity
    senderId,
    senderName: intentData.companyName,
    senderType: "Organization",
    credentials: {
      certificate: `-----BEGIN CERTIFICATE-----\nMOCK_CERT_${senderId}\n-----END CERTIFICATE-----`,
      certificateId: `${senderId}_CERT_${Date.now()}`
    },
    
    // Product Requirements
    productType: intentData.productType || "BusinessLineOfCredit",
    amount: intentData.amount,
    currency: intentData.currency || "USD",
    term: intentData.duration || intentData.term,
    purpose: intentData.purpose,
    
    // Policy Preferences (Optional)
    maxRate: intentData.maxRate,
    esgPriority: intentData.esgPriority || "Medium",
    
    // Customer Profile (Enhanced)
    customerProfile: {
      industry: intentData.industry || intentData.customer_profile?.industry || "General Business",
      annualRevenue: intentData.annualRevenue || intentData.customer_profile?.annual_revenue || 1000000,
      creditScore: intentData.creditScore || intentData.customer_profile?.credit_score || 700,
      esgProfile: intentData.esgProfile || intentData.customer_profile?.esg_profile || "Standard"
    },
    
    // ESG Preferences
    esgPreferences: {
      excludeHighCarbon: intentData.excludeHighCarbon || intentData.esg_preferences?.exclude_high_carbon || false,
      preferredGreenCertification: intentData.preferredGreenCertification || intentData.esg_preferences?.preferred_green_certification || "None"
    },
    
    // Security Fields
    signature: `MOCK_SIGNATURE_${senderId}_${Date.now()}`,
    signatureCertId: `${senderId}Cert#${Date.now()}`
  }
}

/**
 * Creates a WFAP-compliant Offer message (Credit Offer Response)
 * @param {Object} offerData - The offer data from bank
 * @param {Object} intentMessage - The original intent message
 * @returns {Object} WFAP-compliant Offer message
 */
export const createOfferMessage = (offerData, intentMessage) => {
  const messageId = `offer-${offerData.bankName.replace(/\s+/g, '')}-${Date.now()}`
  const senderId = offerData.bankName.replace(/\s+/g, '_').toUpperCase()
  
  return {
    // Header Fields
    messageId,
    messageType: "Offer",
    inResponseTo: intentMessage.messageId,
    timestamp: new Date().toISOString(),
    
    // Responder Identity
    senderId,
    senderName: offerData.bankName,
    senderType: "Bank",
    credentials: {
      certificate: `-----BEGIN CERTIFICATE-----\nMOCK_BANK_CERT_${senderId}\n-----END CERTIFICATE-----`,
      certificateId: `${senderId}_BANK_CERT_${Date.now()}`
    },
    
    // Offer Terms
    approvedAmount: offerData.creditLimit || offerData.approvedAmount || 0,
    currency: intentMessage.currency,
    interestRate: offerData.interestRate || 0,
    term: offerData.termLength || offerData.term || 12,
    repaymentSchedule: offerData.repaymentSchedule || "Interest-only monthly, principal due at end-term",
    
    // ESG and Sustainability
    esgScore: offerData.esgRating || offerData.esg_score || 70,
    carbonAdjustment: offerData.carbonAdjustment || offerData.carbon_adjustment || 0,
    esgSummary: offerData.esgSummary || offerData.esg_summary || "Standard ESG assessment completed based on project purpose and borrower profile",
    
    // Regulatory Compliance & Checks
    compliance: {
      kycVerified: true,
      amlScreening: "clear",
      creditScore: offerData.creditGrade || offerData.credit_grade || "A",
      regulatoryCert: `BANK_${senderId}_LICENSE_${Date.now()}`,
      verificationTimestamp: new Date().toISOString()
    },
    
    // Security Fields
    signature: `MOCK_BANK_SIGNATURE_${senderId}_${Date.now()}`,
    signatureCertId: `${senderId}Cert#${Date.now()}`
  }
}

/**
 * Creates a WFAP-compliant Acceptance message
 * @param {Object} offerMessage - The accepted offer message
 * @param {Object} intentMessage - The original intent message
 * @returns {Object} WFAP-compliant Acceptance message
 */
export const createAcceptanceMessage = (offerMessage, intentMessage) => {
  const messageId = `accept-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  
  return {
    // Header Fields
    messageId,
    messageType: "Acceptance",
    inResponseTo: offerMessage.messageId,
    timestamp: new Date().toISOString(),
    
    // Acceptor Identity
    senderId: intentMessage.senderId,
    senderName: intentMessage.senderName,
    senderType: intentMessage.senderType,
    credentials: intentMessage.credentials,
    
    // Acceptance Details
    acceptedOfferId: offerMessage.messageId,
    finalTerms: {
      amount: offerMessage.approvedAmount,
      interestRate: offerMessage.interestRate,
      term: offerMessage.term,
      currency: offerMessage.currency,
      esgScore: offerMessage.esgScore,
      carbonAdjustment: offerMessage.carbonAdjustment
    },
    
    // Decision Rationale
    decisionRationale: {
      selectedBank: offerMessage.senderName,
      selectionCriteria: "Lowest carbon-adjusted interest rate with adequate credit limit",
      esgConsiderations: offerMessage.esgSummary,
      timestamp: new Date().toISOString()
    },
    
    // Security Fields
    signature: `MOCK_ACCEPTANCE_SIGNATURE_${intentMessage.senderId}_${Date.now()}`,
    signatureCertId: intentMessage.signatureCertId
  }
}

/**
 * Creates a WFAP-compliant Rejection message
 * @param {Object} offerMessage - The rejected offer message
 * @param {Object} intentMessage - The original intent message
 * @param {string} reason - Reason for rejection
 * @returns {Object} WFAP-compliant Rejection message
 */
export const createRejectionMessage = (offerMessage, intentMessage, reason = "Terms not suitable") => {
  const messageId = `reject-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  
  return {
    // Header Fields
    messageId,
    messageType: "Rejection",
    inResponseTo: offerMessage.messageId,
    timestamp: new Date().toISOString(),
    
    // Rejector Identity
    senderId: intentMessage.senderId,
    senderName: intentMessage.senderName,
    senderType: intentMessage.senderType,
    credentials: intentMessage.credentials,
    
    // Rejection Details
    rejectedOfferId: offerMessage.messageId,
    reason: reason,
    
    // Security Fields
    signature: `MOCK_REJECTION_SIGNATURE_${intentMessage.senderId}_${Date.now()}`,
    signatureCertId: intentMessage.signatureCertId
  }
}

/**
 * Creates a WFAP-compliant Counter-Offer message
 * @param {Object} originalOffer - The original offer message
 * @param {Object} intentMessage - The original intent message
 * @param {Object} counterTerms - The counter-offer terms
 * @returns {Object} WFAP-compliant Counter-Offer message
 */
export const createCounterOfferMessage = (originalOffer, intentMessage, counterTerms) => {
  const messageId = `counter-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  
  return {
    // Header Fields
    messageId,
    messageType: "CounterOffer",
    inResponseTo: originalOffer.messageId,
    timestamp: new Date().toISOString(),
    
    // Counter-Offerer Identity
    senderId: intentMessage.senderId,
    senderName: intentMessage.senderName,
    senderType: intentMessage.senderType,
    credentials: intentMessage.credentials,
    
    // Counter-Offer Terms
    counterTerms: {
      requestedAmount: counterTerms.amount || intentMessage.amount,
      requestedRate: counterTerms.interestRate,
      requestedTerm: counterTerms.term || intentMessage.term,
      currency: intentMessage.currency,
      rationale: counterTerms.rationale || "Seeking more favorable terms"
    },
    
    // Security Fields
    signature: `MOCK_COUNTER_SIGNATURE_${intentMessage.senderId}_${Date.now()}`,
    signatureCertId: intentMessage.signatureCertId
  }
}

/**
 * Validates a WFAP message structure
 * @param {Object} message - The message to validate
 * @returns {Object} Validation result
 */
export const validateWFAPMessage = (message) => {
  const errors = []
  
  // Required header fields
  if (!message.messageId) errors.push("Missing messageId")
  if (!message.messageType) errors.push("Missing messageType")
  if (!message.version) errors.push("Missing version")
  if (!message.timestamp) errors.push("Missing timestamp")
  
  // Required identity fields
  if (!message.senderId) errors.push("Missing senderId")
  if (!message.senderName) errors.push("Missing senderName")
  if (!message.senderType) errors.push("Missing senderType")
  
  // Required security fields
  if (!message.signature) errors.push("Missing signature")
  if (!message.signatureCertId) errors.push("Missing signatureCertId")
  
  // Message type specific validations
  if (message.messageType === "Intent") {
    if (!message.amount) errors.push("Intent missing amount")
    if (!message.purpose) errors.push("Intent missing purpose")
  }
  
  if (message.messageType === "Offer") {
    if (!message.inResponseTo) errors.push("Offer missing inResponseTo")
    if (!message.approvedAmount) errors.push("Offer missing approvedAmount")
    if (!message.interestRate) errors.push("Offer missing interestRate")
  }
  
  if (message.messageType === "Acceptance" || message.messageType === "Rejection") {
    if (!message.inResponseTo) errors.push("Response missing inResponseTo")
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * Message type constants
 */
export const MESSAGE_TYPES = {
  INTENT: "Intent",
  OFFER: "Offer",
  ACCEPTANCE: "Acceptance",
  REJECTION: "Rejection",
  COUNTER_OFFER: "CounterOffer"
}

/**
 * Sender type constants
 */
export const SENDER_TYPES = {
  ORGANIZATION: "Organization",
  INDIVIDUAL: "Individual",
  BANK: "Bank",
  FINANCIAL_INSTITUTION: "FinancialInstitution"
}

/**
 * Product type constants
 */
export const PRODUCT_TYPES = {
  BUSINESS_LINE_OF_CREDIT: "BusinessLineOfCredit",
  CONSUMER_CREDIT_CARD: "ConsumerCreditCard",
  TERM_LOAN: "TermLoan",
  MORTGAGE: "Mortgage"
}
