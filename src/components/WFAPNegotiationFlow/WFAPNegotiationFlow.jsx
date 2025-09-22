import React, { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { 
  createCounterOfferMessage, 
  createRejectionMessage,
  createAcceptanceMessage,
  MESSAGE_TYPES 
} from '../../schemas/wfapSchemas'
import { 
  processWFAPMessage, 
  generateWFAPAuditEntry 
} from '../../services/wfapService'

const WFAPNegotiationFlow = ({ 
  intent, 
  currentOffer, 
  bankName, 
  companyName,
  onCounterOffer,
  onAccept,
  onReject,
  onClose 
}) => {
  const [negotiationStep, setNegotiationStep] = useState('review')
  const [counterTerms, setCounterTerms] = useState({
    amount: currentOffer?.approvedAmount || intent?.amount,
    interestRate: currentOffer?.interestRate || 0.08,
    term: currentOffer?.term || intent?.term,
    rationale: ''
  })
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState(null)
  const [wfapMessages, setWfapMessages] = useState([])

  useEffect(() => {
    if (currentOffer) {
      setCounterTerms(prev => ({
        ...prev,
        amount: currentOffer.approvedAmount,
        interestRate: currentOffer.interestRate,
        term: currentOffer.term
      }))
    }
  }, [currentOffer])

  const handleCounterOffer = async () => {
    if (!intent || !currentOffer) return

    setIsProcessing(true)
    setError(null)

    try {
      // Create WFAP counter-offer message
      const counterOfferMessage = createCounterOfferMessage(
        currentOffer, 
        intent, 
        counterTerms
      )

      // Process the counter-offer through WFAP protocol
      const processingResult = await processWFAPMessage(counterOfferMessage)
      
      // Generate audit entry
      const auditEntry = generateWFAPAuditEntry(counterOfferMessage, processingResult)
      
      // Update WFAP messages
      setWfapMessages(prev => [...prev, counterOfferMessage])
      
      // Call parent handler
      if (onCounterOffer) {
        onCounterOffer(counterOfferMessage, processingResult)
      }

      setNegotiationStep('sent')
    } catch (error) {
      console.error('Counter-offer error:', error)
      setError(error.message)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleAccept = async () => {
    if (!intent || !currentOffer) return

    setIsProcessing(true)
    setError(null)

    try {
      // Create WFAP acceptance message
      const acceptanceMessage = createAcceptanceMessage(currentOffer, intent)
      
      // Process the acceptance through WFAP protocol
      const processingResult = await processWFAPMessage(acceptanceMessage)
      
      // Generate audit entry
      const auditEntry = generateWFAPAuditEntry(acceptanceMessage, processingResult)
      
      // Update WFAP messages
      setWfapMessages(prev => [...prev, acceptanceMessage])
      
      // Call parent handler
      if (onAccept) {
        onAccept(acceptanceMessage, processingResult)
      }

      setNegotiationStep('accepted')
    } catch (error) {
      console.error('Acceptance error:', error)
      setError(error.message)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleReject = async () => {
    if (!intent || !currentOffer) return

    setIsProcessing(true)
    setError(null)

    try {
      // Create WFAP rejection message
      const rejectionMessage = createRejectionMessage(
        currentOffer, 
        intent, 
        "Terms not suitable for our requirements"
      )
      
      // Process the rejection through WFAP protocol
      const processingResult = await processWFAPMessage(rejectionMessage)
      
      // Generate audit entry
      const auditEntry = generateWFAPAuditEntry(rejectionMessage, processingResult)
      
      // Update WFAP messages
      setWfapMessages(prev => [...prev, rejectionMessage])
      
      // Call parent handler
      if (onReject) {
        onReject(rejectionMessage, processingResult)
      }

      setNegotiationStep('rejected')
    } catch (error) {
      console.error('Rejection error:', error)
      setError(error.message)
    } finally {
      setIsProcessing(false)
    }
  }

  const calculateEffectiveRate = () => {
    if (!currentOffer) return 0
    const baseRate = counterTerms.interestRate
    const carbonAdjustment = currentOffer.carbonAdjustment || 0
    return baseRate + carbonAdjustment
  }

  const getESGImpact = () => {
    if (!currentOffer) return { score: 0, impact: 'neutral' }
    
    const score = currentOffer.esgScore || 0
    if (score >= 80) return { score, impact: 'excellent', color: 'text-green-600' }
    if (score >= 60) return { score, impact: 'good', color: 'text-blue-600' }
    if (score >= 40) return { score, impact: 'fair', color: 'text-yellow-600' }
    return { score, impact: 'poor', color: 'text-red-600' }
  }

  const esgImpact = getESGImpact()

  if (!intent || !currentOffer) {
    return (
      <div className="p-6 text-center text-gray-500">
        <div className="text-4xl mb-2">⚠️</div>
        <p>Missing intent or offer data for negotiation</p>
      </div>
    )
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">WFAP Negotiation Flow</h3>
            <p className="text-sm text-gray-600">
              {companyName} ↔ {bankName} • Intent #{intent.id}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
              🔒 WFAP 1.0
            </span>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
        </div>
      </div>

      {/* Current Offer Review */}
      <div className="p-6 space-y-6">
        {/* Original Offer */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 mb-3">Current Offer from {bankName}</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Amount:</span>
              <div className="font-semibold">${currentOffer.approvedAmount?.toLocaleString()}</div>
            </div>
            <div>
              <span className="text-gray-600">Interest Rate:</span>
              <div className="font-semibold">{(currentOffer.interestRate * 100).toFixed(2)}%</div>
            </div>
            <div>
              <span className="text-gray-600">Term:</span>
              <div className="font-semibold">{currentOffer.term} months</div>
            </div>
            <div>
              <span className="text-gray-600">ESG Score:</span>
              <div className={`font-semibold ${esgImpact.color}`}>
                {esgImpact.score}/100 ({esgImpact.impact})
              </div>
            </div>
          </div>
          {currentOffer.esgSummary && (
            <div className="mt-3 text-sm text-gray-700">
              <span className="font-medium">ESG Summary:</span>
              <p className="mt-1">{currentOffer.esgSummary}</p>
            </div>
          )}
        </div>

        {/* Counter-Offer Terms */}
        {negotiationStep === 'review' && (
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900">Propose Counter-Offer</h4>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount ($)
                </label>
                <input
                  type="number"
                  value={counterTerms.amount}
                  onChange={(e) => setCounterTerms(prev => ({
                    ...prev,
                    amount: parseInt(e.target.value)
                  }))}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                  min="1000"
                  step="1000"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Interest Rate (%)
                </label>
                <input
                  type="number"
                  value={counterTerms.interestRate * 100}
                  onChange={(e) => setCounterTerms(prev => ({
                    ...prev,
                    interestRate: parseFloat(e.target.value) / 100
                  }))}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
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
                  value={counterTerms.term}
                  onChange={(e) => setCounterTerms(prev => ({
                    ...prev,
                    term: parseInt(e.target.value)
                  }))}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                  min="1"
                  max="120"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Effective Rate
                </label>
                <div className="px-3 py-2 bg-gray-100 rounded text-sm font-semibold">
                  {(calculateEffectiveRate() * 100).toFixed(2)}%
                </div>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Rationale
              </label>
              <textarea
                value={counterTerms.rationale}
                onChange={(e) => setCounterTerms(prev => ({
                  ...prev,
                  rationale: e.target.value
                }))}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                rows="3"
                placeholder="Explain the reasoning for this counter-offer..."
              />
            </div>
          </div>
        )}

        {/* Status Messages */}
        {negotiationStep === 'sent' && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <span className="text-blue-600">📤</span>
              <span className="font-medium text-blue-800">Counter-offer sent successfully</span>
            </div>
            <p className="text-sm text-blue-700 mt-1">
              Your counter-offer has been processed through the WFAP protocol and sent to {bankName}.
            </p>
          </div>
        )}

        {negotiationStep === 'accepted' && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <span className="text-green-600">✅</span>
              <span className="font-medium text-green-800">Offer accepted successfully</span>
            </div>
            <p className="text-sm text-green-700 mt-1">
              The deal has been finalized through the WFAP protocol.
            </p>
          </div>
        )}

        {negotiationStep === 'rejected' && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <span className="text-red-600">❌</span>
              <span className="font-medium text-red-800">Offer rejected</span>
            </div>
            <p className="text-sm text-red-700 mt-1">
              The offer has been rejected and the negotiation is closed.
            </p>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <span className="text-red-600">⚠️</span>
              <span className="font-medium text-red-800">Error</span>
            </div>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
        )}

        {/* WFAP Messages */}
        {wfapMessages.length > 0 && (
          <div className="border-t border-gray-200 pt-4">
            <h4 className="font-semibold text-gray-900 mb-3">WFAP Message Trail</h4>
            <div className="space-y-2">
              {wfapMessages.map((message, index) => (
                <div key={message.messageId || index} className="bg-gray-50 rounded p-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{message.messageType}</span>
                    <span className="text-gray-500">
                      {format(new Date(message.timestamp), 'HH:mm:ss')}
                    </span>
                  </div>
                  <div className="text-gray-600 mt-1">
                    ID: {message.messageId}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      {negotiationStep === 'review' && (
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex gap-3">
          <button
            onClick={handleCounterOffer}
            disabled={isProcessing}
            className="flex-1 btn btn-warning"
          >
            {isProcessing ? 'Sending...' : '🔄 Send Counter-Offer'}
          </button>
          <button
            onClick={handleAccept}
            disabled={isProcessing}
            className="flex-1 btn btn-success"
          >
            {isProcessing ? 'Processing...' : '✅ Accept Offer'}
          </button>
          <button
            onClick={handleReject}
            disabled={isProcessing}
            className="flex-1 btn btn-danger"
          >
            {isProcessing ? 'Processing...' : '❌ Reject Offer'}
          </button>
        </div>
      )}

      {negotiationStep !== 'review' && (
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="w-full btn btn-secondary"
          >
            Close
          </button>
        </div>
      )}
    </div>
  )
}

export default WFAPNegotiationFlow
