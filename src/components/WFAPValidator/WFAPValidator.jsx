import React, { useState, useEffect } from 'react'
import { validateWFAPMessage, MESSAGE_TYPES } from '../../schemas/wfapSchemas'
import { verifyDigitalSignature, verifyIdentityWFAP } from '../../services/wfapService'

const WFAPValidator = ({ 
  message, 
  onValidationComplete,
  showDetails = true,
  realTime = false 
}) => {
  const [validationState, setValidationState] = useState({
    isValid: false,
    isProcessing: false,
    errors: [],
    warnings: [],
    securityChecks: {},
    protocolCompliance: {},
    lastValidated: null
  })

  const [expandedSections, setExpandedSections] = useState({
    errors: false,
    warnings: false,
    security: false,
    compliance: false
  })

  useEffect(() => {
    if (message && realTime) {
      validateMessage()
    }
  }, [message, realTime])

  const validateMessage = async () => {
    if (!message) return

    setValidationState(prev => ({
      ...prev,
      isProcessing: true,
      errors: [],
      warnings: [],
      securityChecks: {},
      protocolCompliance: {}
    }))

    try {
      // Basic WFAP message validation
      const basicValidation = validateWFAPMessage(message)
      
      // Security validation
      const securityValidation = await validateSecurity(message)
      
      // Protocol compliance validation
      const complianceValidation = validateProtocolCompliance(message)
      
      // Digital signature verification
      const signatureValidation = await validateDigitalSignature(message)
      
      // Identity verification
      const identityValidation = await validateIdentity(message)

      const validationResult = {
        isValid: basicValidation.isValid && 
                securityValidation.isValid && 
                complianceValidation.isValid &&
                signatureValidation.isValid &&
                identityValidation.isValid,
        isProcessing: false,
        errors: [
          ...basicValidation.errors,
          ...securityValidation.errors,
          ...complianceValidation.errors,
          ...signatureValidation.errors,
          ...identityValidation.errors
        ],
        warnings: [
          ...basicValidation.warnings || [],
          ...securityValidation.warnings || [],
          ...complianceValidation.warnings || []
        ],
        securityChecks: {
          ...securityValidation,
          ...signatureValidation,
          ...identityValidation
        },
        protocolCompliance: complianceValidation,
        lastValidated: new Date().toISOString()
      }

      setValidationState(validationResult)

      if (onValidationComplete) {
        onValidationComplete(validationResult)
      }
    } catch (error) {
      setValidationState(prev => ({
        ...prev,
        isProcessing: false,
        errors: [...prev.errors, `Validation error: ${error.message}`],
        lastValidated: new Date().toISOString()
      }))
    }
  }

  const validateSecurity = async (msg) => {
    const errors = []
    const warnings = []

    // Check required security fields
    if (!msg.signature) {
      errors.push('Missing digital signature')
    }
    if (!msg.signatureCertId) {
      errors.push('Missing signature certificate ID')
    }
    if (!msg.credentials?.certificate) {
      errors.push('Missing sender certificate')
    }
    if (!msg.credentials?.certificateId) {
      errors.push('Missing certificate ID')
    }

    // Check timestamp validity (not too old)
    if (msg.timestamp) {
      const messageTime = new Date(msg.timestamp)
      const now = new Date()
      const ageHours = (now - messageTime) / (1000 * 60 * 60)
      
      if (ageHours > 24) {
        warnings.push('Message is older than 24 hours')
      }
      if (ageHours > 168) { // 1 week
        errors.push('Message is too old (older than 1 week)')
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      timestampValid: !errors.some(e => e.includes('too old')),
      hasSignature: !!msg.signature,
      hasCertificate: !!msg.credentials?.certificate
    }
  }

  const validateDigitalSignature = async (msg) => {
    try {
      const verification = await verifyDigitalSignature(msg, msg.senderName)
      return {
        isValid: verification.isValid,
        errors: verification.isValid ? [] : ['Digital signature verification failed'],
        warnings: verification.warnings || [],
        signatureAlgorithm: verification.algorithm,
        trustLevel: verification.trustLevel,
        verifiedAt: verification.verifiedAt
      }
    } catch (error) {
      return {
        isValid: false,
        errors: [`Signature verification error: ${error.message}`],
        warnings: []
      }
    }
  }

  const validateIdentity = async (msg) => {
    try {
      const verification = await verifyIdentityWFAP(msg)
      return {
        isValid: verification.isValid,
        errors: verification.isValid ? [] : ['Identity verification failed'],
        warnings: verification.warnings || [],
        verifiedSender: verification.verifiedSender,
        identityType: verification.identityType,
        verifiedAt: verification.verifiedAt
      }
    } catch (error) {
      return {
        isValid: false,
        errors: [`Identity verification error: ${error.message}`],
        warnings: []
      }
    }
  }

  const validateProtocolCompliance = (msg) => {
    const errors = []
    const warnings = []

    // Check message type compliance
    if (!Object.values(MESSAGE_TYPES).includes(msg.messageType)) {
      errors.push(`Invalid message type: ${msg.messageType}`)
    }

    // Check version compliance
    if (msg.version !== "WFAP/1.0") {
      errors.push(`Unsupported protocol version: ${msg.version}`)
    }

    // Check required fields based on message type
    switch (msg.messageType) {
      case MESSAGE_TYPES.INTENT:
        if (!msg.amount || msg.amount <= 0) {
          errors.push('Intent must have valid amount')
        }
        if (!msg.term || msg.term <= 0) {
          errors.push('Intent must have valid term')
        }
        if (!msg.purpose) {
          errors.push('Intent must have purpose')
        }
        break

      case MESSAGE_TYPES.OFFER:
        if (!msg.approvedAmount || msg.approvedAmount <= 0) {
          errors.push('Offer must have valid approved amount')
        }
        if (msg.interestRate === undefined || msg.interestRate < 0) {
          errors.push('Offer must have valid interest rate')
        }
        if (!msg.inResponseTo) {
          errors.push('Offer must reference original intent')
        }
        break

      case MESSAGE_TYPES.ACCEPTANCE:
        if (!msg.acceptedOfferId) {
          errors.push('Acceptance must reference accepted offer')
        }
        if (!msg.finalTerms) {
          errors.push('Acceptance must include final terms')
        }
        break

      case MESSAGE_TYPES.REJECTION:
        if (!msg.rejectedOfferId) {
          errors.push('Rejection must reference rejected offer')
        }
        if (!msg.reason) {
          errors.push('Rejection must include reason')
        }
        break

      case MESSAGE_TYPES.COUNTER_OFFER:
        if (!msg.counterAmount || msg.counterAmount <= 0) {
          errors.push('Counter-offer must have valid amount')
        }
        if (msg.counterRate === undefined || msg.counterRate < 0) {
          errors.push('Counter-offer must have valid rate')
        }
        if (!msg.inResponseTo) {
          errors.push('Counter-offer must reference original offer')
        }
        break
    }

    // Check ESG compliance
    if (msg.messageType === MESSAGE_TYPES.OFFER) {
      if (msg.esgScore === undefined) {
        warnings.push('Offer should include ESG score')
      }
      if (msg.carbonAdjustment === undefined) {
        warnings.push('Offer should include carbon adjustment')
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      messageTypeValid: Object.values(MESSAGE_TYPES).includes(msg.messageType),
      versionValid: msg.version === "WFAP/1.0",
      requiredFieldsValid: errors.length === 0,
      esgCompliant: !warnings.some(w => w.includes('ESG'))
    }
  }

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  const getValidationIcon = () => {
    if (validationState.isProcessing) return '⏳'
    if (validationState.isValid) return '✅'
    return '❌'
  }

  const getValidationColor = () => {
    if (validationState.isProcessing) return 'text-yellow-600'
    if (validationState.isValid) return 'text-green-600'
    return 'text-red-600'
  }

  if (!message) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="text-center text-gray-500">
          <div className="text-2xl mb-2">📝</div>
          <p>No message to validate</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={`text-lg ${getValidationColor()}`}>
              {getValidationIcon()}
            </span>
            <div>
              <h3 className="font-semibold text-gray-900">WFAP Validation</h3>
              <p className="text-sm text-gray-600">
                {message.messageType} • {message.messageId}
              </p>
            </div>
          </div>
          <button
            onClick={validateMessage}
            disabled={validationState.isProcessing}
            className="btn btn-sm btn-secondary"
          >
            {validationState.isProcessing ? 'Validating...' : 'Re-validate'}
          </button>
        </div>
      </div>

      {/* Validation Status */}
      <div className="px-4 py-3 border-b border-gray-200">
        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
          validationState.isValid 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          <span>{getValidationIcon()}</span>
          {validationState.isValid ? 'Valid WFAP Message' : 'Invalid WFAP Message'}
        </div>
        {validationState.lastValidated && (
          <p className="text-xs text-gray-500 mt-1">
            Last validated: {new Date(validationState.lastValidated).toLocaleString()}
          </p>
        )}
      </div>

      {showDetails && (
        <div className="p-4 space-y-4">
          {/* Errors */}
          {validationState.errors.length > 0 && (
            <div>
              <button
                onClick={() => toggleSection('errors')}
                className="flex items-center gap-2 text-red-600 font-medium text-sm"
              >
                <span>{expandedSections.errors ? '▼' : '▶'}</span>
                Errors ({validationState.errors.length})
              </button>
              {expandedSections.errors && (
                <div className="mt-2 bg-red-50 border border-red-200 rounded p-3">
                  <ul className="space-y-1 text-sm text-red-700">
                    {validationState.errors.map((error, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-red-500 mt-0.5">•</span>
                        <span>{error}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Warnings */}
          {validationState.warnings.length > 0 && (
            <div>
              <button
                onClick={() => toggleSection('warnings')}
                className="flex items-center gap-2 text-yellow-600 font-medium text-sm"
              >
                <span>{expandedSections.warnings ? '▼' : '▶'}</span>
                Warnings ({validationState.warnings.length})
              </button>
              {expandedSections.warnings && (
                <div className="mt-2 bg-yellow-50 border border-yellow-200 rounded p-3">
                  <ul className="space-y-1 text-sm text-yellow-700">
                    {validationState.warnings.map((warning, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-yellow-500 mt-0.5">⚠</span>
                        <span>{warning}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Security Checks */}
          <div>
            <button
              onClick={() => toggleSection('security')}
              className="flex items-center gap-2 text-blue-600 font-medium text-sm"
            >
              <span>{expandedSections.security ? '▼' : '▶'}</span>
              Security Checks
            </button>
            {expandedSections.security && (
              <div className="mt-2 bg-blue-50 border border-blue-200 rounded p-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-blue-800">Digital Signature:</span>
                    <div className={`${validationState.securityChecks.hasSignature ? 'text-green-600' : 'text-red-600'}`}>
                      {validationState.securityChecks.hasSignature ? '✓ Present' : '✗ Missing'}
                    </div>
                  </div>
                  <div>
                    <span className="font-medium text-blue-800">Certificate:</span>
                    <div className={`${validationState.securityChecks.hasCertificate ? 'text-green-600' : 'text-red-600'}`}>
                      {validationState.securityChecks.hasCertificate ? '✓ Present' : '✗ Missing'}
                    </div>
                  </div>
                  <div>
                    <span className="font-medium text-blue-800">Timestamp:</span>
                    <div className={`${validationState.securityChecks.timestampValid ? 'text-green-600' : 'text-red-600'}`}>
                      {validationState.securityChecks.timestampValid ? '✓ Valid' : '✗ Invalid'}
                    </div>
                  </div>
                  <div>
                    <span className="font-medium text-blue-800">Trust Level:</span>
                    <div className="text-blue-600">
                      {validationState.securityChecks.trustLevel || 'Unknown'}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Protocol Compliance */}
          <div>
            <button
              onClick={() => toggleSection('compliance')}
              className="flex items-center gap-2 text-purple-600 font-medium text-sm"
            >
              <span>{expandedSections.compliance ? '▼' : '▶'}</span>
              Protocol Compliance
            </button>
            {expandedSections.compliance && (
              <div className="mt-2 bg-purple-50 border border-purple-200 rounded p-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-purple-800">Message Type:</span>
                    <div className={`${validationState.protocolCompliance.messageTypeValid ? 'text-green-600' : 'text-red-600'}`}>
                      {validationState.protocolCompliance.messageTypeValid ? '✓ Valid' : '✗ Invalid'}
                    </div>
                  </div>
                  <div>
                    <span className="font-medium text-purple-800">Version:</span>
                    <div className={`${validationState.protocolCompliance.versionValid ? 'text-green-600' : 'text-red-600'}`}>
                      {validationState.protocolCompliance.versionValid ? '✓ WFAP/1.0' : '✗ Invalid'}
                    </div>
                  </div>
                  <div>
                    <span className="font-medium text-purple-800">Required Fields:</span>
                    <div className={`${validationState.protocolCompliance.requiredFieldsValid ? 'text-green-600' : 'text-red-600'}`}>
                      {validationState.protocolCompliance.requiredFieldsValid ? '✓ Complete' : '✗ Incomplete'}
                    </div>
                  </div>
                  <div>
                    <span className="font-medium text-purple-800">ESG Compliant:</span>
                    <div className={`${validationState.protocolCompliance.esgCompliant ? 'text-green-600' : 'text-yellow-600'}`}>
                      {validationState.protocolCompliance.esgCompliant ? '✓ Yes' : '⚠ Partial'}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default WFAPValidator
