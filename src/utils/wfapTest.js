/**
 * WFAP Integration Test Utilities
 * 
 * This file contains test utilities to verify WFAP protocol integration
 */

import { 
  createIntentMessage, 
  createOfferMessage, 
  createAcceptanceMessage,
  validateWFAPMessage,
  MESSAGE_TYPES 
} from '../schemas/wfapSchemas'
import { 
  convertToWFAPIntent, 
  processWFAPMessage, 
  verifyIdentityWFAP 
} from '../services/wfapService'

/**
 * Test WFAP message creation and validation
 */
export const testWFAPMessageCreation = () => {
  console.log('🧪 Testing WFAP Message Creation...')
  
  // Test Intent message creation
  const intentData = {
    companyName: "Test Company",
    amount: 1000000,
    duration: 12,
    purpose: "Test purpose",
    productType: "BusinessLineOfCredit",
    currency: "USD",
    maxRate: 8.0,
    esgPriority: "High",
    industry: "Technology",
    annualRevenue: 5000000,
    creditScore: 750,
    esgProfile: "Standard",
    excludeHighCarbon: true,
    preferredGreenCertification: "GreenLoanPrinciples"
  }
  
  const intentMessage = createIntentMessage(intentData)
  console.log('✅ Intent message created:', intentMessage.messageId)
  
  // Test Offer message creation
  const offerData = {
    bankName: "Test Bank",
    creditLimit: 1000000,
    interestRate: 0.065,
    termLength: 12,
    esgRating: 85,
    carbonAdjustment: -0.002,
    esgSummary: "Excellent ESG profile with carbon reduction benefits",
    creditGrade: "A"
  }
  
  const offerMessage = createOfferMessage(offerData, intentMessage)
  console.log('✅ Offer message created:', offerMessage.messageId)
  
  // Test Acceptance message creation
  const acceptanceMessage = createAcceptanceMessage(offerMessage, intentMessage)
  console.log('✅ Acceptance message created:', acceptanceMessage.messageId)
  
  // Test message validation
  const intentValidation = validateWFAPMessage(intentMessage)
  const offerValidation = validateWFAPMessage(offerMessage)
  const acceptanceValidation = validateWFAPMessage(acceptanceMessage)
  
  console.log('✅ Intent validation:', intentValidation.isValid ? 'PASS' : 'FAIL')
  console.log('✅ Offer validation:', offerValidation.isValid ? 'PASS' : 'FAIL')
  console.log('✅ Acceptance validation:', acceptanceValidation.isValid ? 'PASS' : 'FAIL')
  
  return {
    intentMessage,
    offerMessage,
    acceptanceMessage,
    validations: {
      intent: intentValidation,
      offer: offerValidation,
      acceptance: acceptanceValidation
    }
  }
}

/**
 * Test WFAP service functions
 */
export const testWFAPServices = async () => {
  console.log('🧪 Testing WFAP Services...')
  
  // Test intent conversion
  const existingIntent = {
    companyName: "Test Company",
    amount: 1000000,
    duration: 12,
    purpose: "Test purpose",
    industry: "Technology",
    creditScore: 750,
    esgProfile: "Standard",
    annualRevenue: 5000000,
    excludeHighCarbon: true,
    preferredGreenCertification: "GreenLoanPrinciples"
  }
  
  const wfapIntent = convertToWFAPIntent(existingIntent)
  console.log('✅ Intent converted to WFAP format:', wfapIntent.messageId)
  
  // Test identity verification
  try {
    const verification = await verifyIdentityWFAP(wfapIntent)
    console.log('✅ Identity verification completed:', verification.isVerified ? 'VERIFIED' : 'FAILED')
  } catch (error) {
    console.log('❌ Identity verification failed:', error.message)
  }
  
  // Test message processing
  try {
    const processingResult = await processWFAPMessage(wfapIntent)
    console.log('✅ Message processing completed:', processingResult.status)
  } catch (error) {
    console.log('❌ Message processing failed:', error.message)
  }
  
  return {
    wfapIntent,
    verification: await verifyIdentityWFAP(wfapIntent),
    processing: await processWFAPMessage(wfapIntent)
  }
}

/**
 * Test WFAP protocol flow
 */
export const testWFAPProtocolFlow = async () => {
  console.log('🧪 Testing WFAP Protocol Flow...')
  
  // Step 1: Create Intent
  const intentData = {
    companyName: "Protocol Test Company",
    amount: 2000000,
    duration: 24,
    purpose: "Green energy project",
    productType: "BusinessLineOfCredit",
    currency: "USD",
    maxRate: 7.5,
    esgPriority: "High",
    industry: "Renewable Energy",
    annualRevenue: 10000000,
    creditScore: 780,
    esgProfile: "CarbonNeutralCertified",
    excludeHighCarbon: true,
    preferredGreenCertification: "GreenLoanPrinciples"
  }
  
  const intentMessage = createIntentMessage(intentData)
  console.log('📝 Step 1: Intent created -', intentMessage.messageId)
  
  // Step 2: Process Intent
  const intentProcessing = await processWFAPMessage(intentMessage)
  console.log('🔍 Step 2: Intent processed -', intentProcessing.status)
  
  // Step 3: Create Offer
  const offerData = {
    bankName: "Green Bank",
    creditLimit: 2000000,
    interestRate: 0.055,
    termLength: 24,
    esgRating: 92,
    carbonAdjustment: -0.005,
    esgSummary: "Outstanding ESG profile with significant carbon reduction benefits",
    creditGrade: "A+"
  }
  
  const offerMessage = createOfferMessage(offerData, intentMessage)
  console.log('💰 Step 3: Offer created -', offerMessage.messageId)
  
  // Step 4: Process Offer
  const offerProcessing = await processWFAPMessage(offerMessage)
  console.log('🔍 Step 4: Offer processed -', offerProcessing.status)
  
  // Step 5: Create Acceptance
  const acceptanceMessage = createAcceptanceMessage(offerMessage, intentMessage)
  console.log('✅ Step 5: Acceptance created -', acceptanceMessage.messageId)
  
  // Step 6: Process Acceptance
  const acceptanceProcessing = await processWFAPMessage(acceptanceMessage)
  console.log('🔍 Step 6: Acceptance processed -', acceptanceProcessing.status)
  
  return {
    intent: intentMessage,
    offer: offerMessage,
    acceptance: acceptanceMessage,
    processing: {
      intent: intentProcessing,
      offer: offerProcessing,
      acceptance: acceptanceProcessing
    }
  }
}

/**
 * Run all WFAP tests
 */
export const runAllWFAPTests = async () => {
  console.log('🚀 Running All WFAP Tests...\n')
  
  try {
    // Test message creation
    const messageTests = testWFAPMessageCreation()
    console.log('')
    
    // Test services
    const serviceTests = await testWFAPServices()
    console.log('')
    
    // Test protocol flow
    const flowTests = await testWFAPProtocolFlow()
    console.log('')
    
    console.log('🎉 All WFAP tests completed successfully!')
    
    return {
      messageTests,
      serviceTests,
      flowTests,
      success: true
    }
  } catch (error) {
    console.error('❌ WFAP tests failed:', error)
    return {
      error: error.message,
      success: false
    }
  }
}

/**
 * Get WFAP protocol statistics
 */
export const getWFAPTestStats = () => {
  return {
    protocolVersion: "WFAP/1.0",
    messageTypes: Object.values(MESSAGE_TYPES),
    supportedFeatures: [
      "Digital Signatures",
      "Identity Verification", 
      "ESG Assessment",
      "Carbon Adjustment",
      "Compliance Tracking",
      "Audit Logging",
      "Message Validation"
    ],
    testCoverage: [
      "Intent Message Creation",
      "Offer Message Creation", 
      "Acceptance Message Creation",
      "Message Validation",
      "Identity Verification",
      "Message Processing",
      "Protocol Flow"
    ]
  }
}
