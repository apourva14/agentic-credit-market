import React, { useState, useEffect } from 'react'
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
} from '../../schemas/wfapSchemas'
import { processWFAPMessage } from '../../services/wfapService'

const WFAPMessageBuilder = ({ 
  onMessageCreated, 
  onClose,
  initialMessageType = MESSAGE_TYPES.INTENT,
  contextIntent = null,
  contextOffer = null
}) => {
  const [messageType, setMessageType] = useState(initialMessageType)
  const [formData, setFormData] = useState({})
  const [isValidating, setIsValidating] = useState(false)
  const [validationResult, setValidationResult] = useState(null)
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState(null)

  // Initialize form data based on message type and context
  useEffect(() => {
    const initializeFormData = () => {
      const baseData = {
        senderName: '',
        senderType: SENDER_TYPES.ORGANIZATION,
        currency: 'USD',
        timestamp: new Date().toISOString()
      }

      switch (messageType) {
        case MESSAGE_TYPES.INTENT:
          return {
            ...baseData,
            companyName: '',
            amount: 1000000,
            duration: 12,
            purpose: '',
            productType: PRODUCT_TYPES.BUSINESS_LINE_OF_CREDIT,
            maxRate: 8.0,
            esgPriority: 'Medium',
            industry: 'Technology',
            annualRevenue: 5000000,
            creditScore: 700,
            esgProfile: 'Standard',
            excludeHighCarbon: false,
            preferredGreenCertification: 'None'
          }

        case MESSAGE_TYPES.OFFER:
          return {
            ...baseData,
            senderType: SENDER_TYPES.BANK,
            bankName: '',
            approvedAmount: contextIntent?.amount || 1000000,
            interestRate: 0.065,
            term: contextIntent?.term || 12,
            esgScore: 75,
            carbonAdjustment: 0,
            esgSummary: 'Standard ESG assessment completed',
            creditGrade: 'A',
            repaymentSchedule: 'Interest-only monthly, principal due at end-term'
          }

        case MESSAGE_TYPES.ACCEPTANCE:
          return {
            ...baseData,
            acceptedOfferId: contextOffer?.messageId || '',
            finalAmount: contextOffer?.approvedAmount || 1000000,
            finalRate: contextOffer?.interestRate || 0.065,
            finalTerm: contextOffer?.term || 12,
            decisionRationale: 'Best offer received with favorable terms'
          }

        case MESSAGE_TYPES.REJECTION:
          return {
            ...baseData,
            rejectedOfferId: contextOffer?.messageId || '',
            reason: 'Terms not suitable for our requirements'
          }

        case MESSAGE_TYPES.COUNTER_OFFER:
          return {
            ...baseData,
            counterAmount: contextOffer?.approvedAmount || 1000000,
            counterRate: contextOffer?.interestRate || 0.065,
            counterTerm: contextOffer?.term || 12,
            rationale: 'Seeking more favorable terms'
          }

        default:
          return baseData
      }
    }

    setFormData(initializeFormData())
    setValidationResult(null)
    setError(null)
  }, [messageType, contextIntent, contextOffer])

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    setValidationResult(null)
    setError(null)
  }

  const handleNestedInputChange = (parentField, field, value) => {
    setFormData(prev => ({
      ...prev,
      [parentField]: {
        ...prev[parentField],
        [field]: value
      }
    }))
    setValidationResult(null)
    setError(null)
  }

  const validateMessage = async () => {
    setIsValidating(true)
    setError(null)

    try {
      let message
      
      switch (messageType) {
        case MESSAGE_TYPES.INTENT:
          message = createIntentMessage(formData)
          break
        case MESSAGE_TYPES.OFFER:
          message = createOfferMessage(formData, contextIntent || {})
          break
        case MESSAGE_TYPES.ACCEPTANCE:
          message = createAcceptanceMessage(contextOffer || {}, contextIntent || {})
          break
        case MESSAGE_TYPES.REJECTION:
          message = createRejectionMessage(contextOffer || {}, contextIntent || {}, formData.reason)
          break
        case MESSAGE_TYPES.COUNTER_OFFER:
          message = createCounterOfferMessage(contextOffer || {}, contextIntent || {}, formData)
          break
        default:
          throw new Error('Unknown message type')
      }

      const validation = validateWFAPMessage(message)
      setValidationResult({
        isValid: validation.isValid,
        errors: validation.errors,
        message: message
      })
    } catch (error) {
      setError(error.message)
    } finally {
      setIsValidating(false)
    }
  }

  const createMessage = async () => {
    if (!validationResult?.isValid) {
      await validateMessage()
      return
    }

    setIsCreating(true)
    setError(null)

    try {
      const message = validationResult.message
      
      // Process through WFAP protocol
      const processingResult = await processWFAPMessage(message)
      
      if (onMessageCreated) {
        onMessageCreated(message, processingResult)
      }

      // Reset form
      setFormData({})
      setValidationResult(null)
    } catch (error) {
      setError(error.message)
    } finally {
      setIsCreating(false)
    }
  }

  const renderIntentForm = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Company Name *
          </label>
          <input
            type="text"
            value={formData.companyName || ''}
            onChange={(e) => handleInputChange('companyName', e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
            placeholder="Enter company name"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Amount ($) *
          </label>
          <input
            type="number"
            value={formData.amount || ''}
            onChange={(e) => handleInputChange('amount', parseInt(e.target.value))}
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
            placeholder="1000000"
            min="1000"
            step="1000"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Duration (months) *
          </label>
          <input
            type="number"
            value={formData.duration || ''}
            onChange={(e) => handleInputChange('duration', parseInt(e.target.value))}
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
            placeholder="12"
            min="1"
            max="120"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Max Rate (%)
          </label>
          <input
            type="number"
            value={formData.maxRate || ''}
            onChange={(e) => handleInputChange('maxRate', parseFloat(e.target.value))}
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
            placeholder="8.0"
            min="0"
            max="20"
            step="0.1"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Purpose *
        </label>
        <textarea
          value={formData.purpose || ''}
          onChange={(e) => handleInputChange('purpose', e.target.value)}
          className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
          rows="3"
          placeholder="Describe the purpose of this credit line..."
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            ESG Priority
          </label>
          <select
            value={formData.esgPriority || 'Medium'}
            onChange={(e) => handleInputChange('esgPriority', e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
          >
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Industry
          </label>
          <input
            type="text"
            value={formData.industry || ''}
            onChange={(e) => handleInputChange('industry', e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
            placeholder="Technology"
          />
        </div>
      </div>
    </div>
  )

  const renderOfferForm = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Bank Name *
          </label>
          <input
            type="text"
            value={formData.bankName || ''}
            onChange={(e) => handleInputChange('bankName', e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
            placeholder="Enter bank name"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Approved Amount ($) *
          </label>
          <input
            type="number"
            value={formData.approvedAmount || ''}
            onChange={(e) => handleInputChange('approvedAmount', parseInt(e.target.value))}
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
            placeholder="1000000"
            min="1000"
            step="1000"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Interest Rate (%)
          </label>
          <input
            type="number"
            value={formData.interestRate ? formData.interestRate * 100 : ''}
            onChange={(e) => handleInputChange('interestRate', parseFloat(e.target.value) / 100)}
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
            placeholder="6.5"
            min="0"
            max="20"
            step="0.1"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Term (months)
          </label>
          <input
            type="number"
            value={formData.term || ''}
            onChange={(e) => handleInputChange('term', parseInt(e.target.value))}
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
            placeholder="12"
            min="1"
            max="120"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            ESG Score
          </label>
          <input
            type="number"
            value={formData.esgScore || ''}
            onChange={(e) => handleInputChange('esgScore', parseInt(e.target.value))}
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
            placeholder="75"
            min="0"
            max="100"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Carbon Adjustment (%)
          </label>
          <input
            type="number"
            value={formData.carbonAdjustment ? formData.carbonAdjustment * 100 : ''}
            onChange={(e) => handleInputChange('carbonAdjustment', parseFloat(e.target.value) / 100)}
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
            placeholder="0"
            min="-5"
            max="5"
            step="0.1"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          ESG Summary
        </label>
        <textarea
          value={formData.esgSummary || ''}
          onChange={(e) => handleInputChange('esgSummary', e.target.value)}
          className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
          rows="3"
          placeholder="Describe the ESG impact and assessment..."
        />
      </div>
    </div>
  )

  const renderResponseForm = () => (
    <div className="space-y-4">
      {messageType === MESSAGE_TYPES.ACCEPTANCE && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Decision Rationale
          </label>
          <textarea
            value={formData.decisionRationale || ''}
            onChange={(e) => handleInputChange('decisionRationale', e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
            rows="3"
            placeholder="Explain why this offer was accepted..."
          />
        </div>
      )}

      {messageType === MESSAGE_TYPES.REJECTION && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Rejection Reason
          </label>
          <textarea
            value={formData.reason || ''}
            onChange={(e) => handleInputChange('reason', e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
            rows="3"
            placeholder="Explain why this offer was rejected..."
          />
        </div>
      )}

      {messageType === MESSAGE_TYPES.COUNTER_OFFER && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Counter Amount ($)
            </label>
            <input
              type="number"
              value={formData.counterAmount || ''}
              onChange={(e) => handleInputChange('counterAmount', parseInt(e.target.value))}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
              placeholder="1000000"
              min="1000"
              step="1000"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Counter Rate (%)
            </label>
            <input
              type="number"
              value={formData.counterRate ? formData.counterRate * 100 : ''}
              onChange={(e) => handleInputChange('counterRate', parseFloat(e.target.value) / 100)}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
              placeholder="6.0"
              min="0"
              max="20"
              step="0.1"
            />
          </div>
        </div>
      )}
    </div>
  )

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">WFAP Message Builder</h3>
              <p className="text-sm text-gray-600">Create and validate WFAP protocol messages</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Message Type Selection */}
        <div className="px-6 py-4 border-b border-gray-200">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Message Type
          </label>
          <select
            value={messageType}
            onChange={(e) => setMessageType(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
          >
            {Object.values(MESSAGE_TYPES).map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        {/* Form Content */}
        <div className="px-6 py-4">
          {messageType === MESSAGE_TYPES.INTENT && renderIntentForm()}
          {messageType === MESSAGE_TYPES.OFFER && renderOfferForm()}
          {(messageType === MESSAGE_TYPES.ACCEPTANCE || 
            messageType === MESSAGE_TYPES.REJECTION || 
            messageType === MESSAGE_TYPES.COUNTER_OFFER) && renderResponseForm()}
        </div>

        {/* Validation Results */}
        {validationResult && (
          <div className="px-6 py-4 border-t border-gray-200">
            <div className={`p-3 rounded-lg ${
              validationResult.isValid 
                ? 'bg-green-50 border border-green-200' 
                : 'bg-red-50 border border-red-200'
            }`}>
              <div className="flex items-center gap-2">
                <span className={validationResult.isValid ? 'text-green-600' : 'text-red-600'}>
                  {validationResult.isValid ? '✅' : '❌'}
                </span>
                <span className={`font-medium ${
                  validationResult.isValid ? 'text-green-800' : 'text-red-800'
                }`}>
                  {validationResult.isValid ? 'Message Valid' : 'Validation Failed'}
                </span>
              </div>
              {validationResult.errors.length > 0 && (
                <ul className="mt-2 text-sm text-red-700">
                  {validationResult.errors.map((error, index) => (
                    <li key={index}>• {error}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="px-6 py-4 border-t border-gray-200">
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <span className="text-red-600">⚠️</span>
                <span className="font-medium text-red-800">Error</span>
              </div>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex gap-3">
          <button
            onClick={validateMessage}
            disabled={isValidating}
            className="flex-1 btn btn-secondary"
          >
            {isValidating ? 'Validating...' : '🔍 Validate Message'}
          </button>
          <button
            onClick={createMessage}
            disabled={!validationResult?.isValid || isCreating}
            className="flex-1 btn btn-primary"
          >
            {isCreating ? 'Creating...' : '📤 Create Message'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default WFAPMessageBuilder
