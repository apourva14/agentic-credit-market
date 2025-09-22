import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { bankConfigs } from '../../data/bankConfigs'
import { companyConfigs, generateCompanyConfig } from '../../data/companyConfigs'
import { 
  verifyIdentity, 
  generateOfferLLM, 
  generateCounterOfferLLM, 
  evaluateOfferLLM,
  generateConversationSummary,
  generateWFAPOfferLLM,
  evaluateAllOffersWFAP
} from '../../services/llmService'
import { MESSAGE_TYPES } from '../../schemas/wfapSchemas'
import WFAPAuditLog from '../WFAPAuditLog/WFAPAuditLog'
import {
  getChatSession,
  addMessageToSession,
  updateSessionStatus,
  generateDealId,
  getCachedSummary,
  cacheSummary,
  downloadTextFile
} from '../../utils/chatStorage'

const NegotiationDrawer = ({ 
  isOpen, 
  onClose, 
  deal, 
  intent, 
  currentRole, 
  selectedBank,
  selectedCompany,
  onDealAccepted,
  onDealCancelled 
}) => {
  const [chatSession, setChatSession] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [dealId, setDealId] = useState(null)
  const [conversationSummary, setConversationSummary] = useState(null)
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false)
  const [wfapMessages, setWfapMessages] = useState([])
  const [showWfapAudit, setShowWfapAudit] = useState(false)
  const [wfapCompliance, setWfapCompliance] = useState(false)

  const isClosedDeal = deal && deal.hasOwnProperty('winningBank')

  // Initialize chat session when drawer opens
  useEffect(() => {
    if (isOpen && deal && intent) {
      const id = generateDealId(deal.intentId, deal.bankName)
      setDealId(id)
      
      const session = getChatSession(id)
      setChatSession(session)
      
      // Add initial system message if this is a new session
      if (session.messages.length === 0 && !isClosedDeal) {
        addMessageToSession(id, {
          sender: 'system',
          content: `Negotiation started for ${intent.companyName}'s credit request of $${intent.amount.toLocaleString()} for ${intent.duration} months.`,
          type: 'system'
        })
        setChatSession(getChatSession(id))
      }

      // Load cached summary for closed deals
      if (isClosedDeal) {
        const cached = getCachedSummary(id)
        if (cached) {
          setConversationSummary(cached.content)
        }
      }
    }
  }, [isOpen, deal, intent, isClosedDeal])

  // Track WFAP messages and compliance
  useEffect(() => {
    if (chatSession) {
      const wfapMsgs = extractWFAPMessages(chatSession.messages)
      setWfapMessages(wfapMsgs)
      setWfapCompliance(checkWFAPCompliance())
    }
  }, [chatSession, intent])

  // Get configurations
  const bankConfig = bankConfigs[deal?.bankName] || {}
  const companyConfig = companyConfigs[intent?.companyName] || 
    (intent ? generateCompanyConfig(intent.companyName, intent) : {})

  // Check WFAP compliance
  const checkWFAPCompliance = () => {
    if (!intent) return false
    return intent.messageType === MESSAGE_TYPES.INTENT && 
           intent.version === "WFAP/1.0" && 
           intent.signature && 
           intent.signatureCertId
  }

  // Extract WFAP messages from chat session
  const extractWFAPMessages = (messages) => {
    return messages.filter(msg => 
      msg.wfapMessage || 
      msg.type === 'wfap_intent' || 
      msg.type === 'wfap_offer' || 
      msg.type === 'wfap_acceptance'
    ).map(msg => msg.wfapMessage || msg)
  }

  const formatTimestamp = (timestamp) => {
    return format(new Date(timestamp), 'HH:mm')
  }

  const generateSummaryForClosedDeal = async () => {
    if (!isClosedDeal || !chatSession || conversationSummary) return

    setIsGeneratingSummary(true)
    try {
      const summary = await generateConversationSummary(chatSession.messages, intent, deal)
      setConversationSummary(summary)
      cacheSummary(dealId, summary)
    } catch (error) {
      console.error('Error generating summary:', error)
      setError('Failed to generate summary')
    } finally {
      setIsGeneratingSummary(false)
    }
  }

  const handleDownloadAuditLog = () => {
    if (!conversationSummary || !intent || !deal) return

    const timestamp = format(new Date(), 'yyyy-MM-dd_HH-mm-ss')
    const filename = `audit_log_intent_${deal.intentId}_${timestamp}.txt`
    
    const auditContent = `
AGENTIC CREDIT MARKET - AUDIT LOG
=================================

Deal Information:
- Intent ID: ${deal.intentId}
- Company: ${intent.companyName}
- Bank: ${deal.bankName}
- Generated: ${format(new Date(), 'PPpp')}

CONVERSATION SUMMARY:
${conversationSummary}

COMPLETE CHAT HISTORY:
${chatSession?.messages?.map((msg, index) => 
  `[${format(new Date(msg.timestamp), 'yyyy-MM-dd HH:mm:ss')}] ${msg.sender}: ${msg.content}`
).join('\n') || 'No chat history available'}

---
End of Audit Log
`.trim()

    downloadTextFile(auditContent, filename)
  }

  // ... (keeping all existing handler functions unchanged)
  const handleVerifyIdentity = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const isAuthentic = await verifyIdentity(intent.companyName, intent)
      
      if (isAuthentic) {
        addMessageToSession(dealId, {
          sender: 'system',
          content: `✅ Identity verification successful for ${intent.companyName}. ${deal.bankName} can now proceed with the loan offer.`,
          type: 'verification_success'
        })
        updateSessionStatus(dealId, 'verified')
      } else {
        addMessageToSession(dealId, {
          sender: 'system',
          content: `❌ Identity verification failed for ${intent.companyName}. This deal has been cancelled due to authentication concerns.`,
          type: 'verification_failed'
        })
        updateSessionStatus(dealId, 'cancelled')
        
        setTimeout(() => {
          onDealCancelled(deal.intentId)
          onClose()
        }, 2000)
      }
      
      setChatSession(getChatSession(dealId))
    } catch (error) {
      setError('Failed to verify identity. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGenerateOffer = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await generateOfferLLM(intent, bankConfig, deal.bankName)
      
      // Handle both old string format and new object format
      const offerContent = typeof response === 'string' ? response : response.content
      
      addMessageToSession(dealId, {
        sender: deal.bankName,
        content: offerContent,
        type: 'offer'
      })
      
      updateSessionStatus(dealId, 'in_progress')
      setChatSession(getChatSession(dealId))
    } catch (error) {
      console.error('Error generating offer:', error)
      setError(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleGenerateCounterOffer = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const conversation = chatSession.messages.filter(msg => msg.type !== 'system')
      const response = await generateCounterOfferLLM(
        conversation, 
        bankConfig, 
        deal.bankName, 
        intent
      )
      
      // Handle both old string format and new object format
      const counterOfferContent = typeof response === 'string' ? response : response.content
      
      addMessageToSession(dealId, {
        sender: deal.bankName,
        content: counterOfferContent,
        type: 'counter_offer'
      })
      
      setChatSession(getChatSession(dealId))
    } catch (error) {
      console.error('Error generating counter-offer:', error)
      setError(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleEvaluateOffer = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const lastBankMessage = chatSession.messages
        .filter(msg => msg.sender === deal.bankName)
        .pop()
      
      if (!lastBankMessage) {
        setError('No bank offer found to evaluate')
        return
      }
      
      const conversation = chatSession.messages.filter(msg => msg.type !== 'system')
      const evaluation = await evaluateOfferLLM(
        intent, 
        lastBankMessage.content, 
        companyConfig, 
        conversation
      )
      
      if (evaluation.isAcceptance) {
        addMessageToSession(dealId, {
          sender: intent.companyName,
          content: evaluation.content,
          type: 'acceptance'
        })
        
        updateSessionStatus(dealId, 'accepted')
        
        setTimeout(() => {
          onDealAccepted(deal.intentId, deal.bankName)
          onClose()
        }, 1000)
      } else {
        addMessageToSession(dealId, {
          sender: intent.companyName,
          content: evaluation.content,
          type: 'counter_offer'
        })
      }
      
      setChatSession(getChatSession(dealId))
    } catch (error) {
      setError(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAcceptOffer = () => {
    addMessageToSession(dealId, {
      sender: intent.companyName,
      content: `We accept ${deal.bankName}'s offer. Thank you for working with us!`,
      type: 'acceptance'
    })
    
    updateSessionStatus(dealId, 'accepted')
    
    setTimeout(() => {
      onDealAccepted(deal.intentId, deal.bankName)
      onClose()
    }, 1000)
  }

  const handleCancelDeal = () => {
    const senderName = currentRole === 'bank' ? deal.bankName : intent.companyName
    
    addMessageToSession(dealId, {
      sender: senderName,
      content: `This deal has been cancelled by ${senderName}.`,
      type: 'cancellation'
    })
    
    updateSessionStatus(dealId, 'cancelled')
    
    setTimeout(() => {
      onDealCancelled(deal.intentId)
      onClose()
    }, 1000)
  }

  const renderMessage = (message) => {
    const isOwnMessage = currentRole === 'bank' 
      ? message.sender === deal?.bankName 
      : message.sender === intent?.companyName
    
    if (message.type === 'system') {
      return (
        <div key={message.id} className="flex justify-center mb-4">
          <div className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm max-w-md text-center">
            {message.content}
          </div>
        </div>
      )
    }

    // Check if message contains JSON offer
    const jsonMatch = message.content.match(/\{[\s\S]*\}/)
    const hasJsonOffer = jsonMatch && (message.type === 'offer' || message.type === 'counter_offer')
    
    return (
      <div key={message.id} className={`flex mb-4 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
        <div className={`max-w-2xl px-4 py-3 rounded-lg ${
          isOwnMessage 
            ? 'bg-primary-500 text-white' 
            : message.sender === deal?.bankName
              ? 'bg-success-100 text-success-800'
              : 'bg-blue-100 text-blue-800'
        }`}>
          <div className="font-semibold text-sm mb-2 flex items-center gap-2">
            {message.sender}
            {message.type === 'offer' && <span className="text-xs bg-green-500 text-white px-2 py-1 rounded">OFFER</span>}
            {message.type === 'counter_offer' && <span className="text-xs bg-orange-500 text-white px-2 py-1 rounded">COUNTER</span>}
            {message.type === 'acceptance' && <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded">ACCEPTED</span>}
          </div>
          
          {hasJsonOffer ? (
            <div className="space-y-3">
              {/* JSON Offer Section */}
              <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-xs overflow-x-auto">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-green-400 font-semibold">📋 Offer Details</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(jsonMatch[0])
                      // You could add a toast notification here
                    }}
                    className="text-gray-400 hover:text-white text-xs"
                  >
                    📋 Copy JSON
                  </button>
                </div>
                <pre className="whitespace-pre-wrap">{jsonMatch[0]}</pre>
              </div>
              
              {/* Reasoning Section */}
              {message.content.replace(jsonMatch[0], '').trim() && (
                <div className="bg-white/10 p-3 rounded-lg">
                  <div className="text-xs font-semibold mb-2 text-yellow-300">💭 Bank's Reasoning</div>
                  <div className="text-sm leading-relaxed">
                    {message.content.replace(jsonMatch[0], '').trim()}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-sm leading-relaxed">{message.content}</div>
          )}
          
          <div className={`text-xs mt-2 ${isOwnMessage ? 'text-white/70' : 'text-gray-500'}`}>
            {formatTimestamp(message.timestamp)}
          </div>
        </div>
      </div>
    )
  }

  const renderActionButtons = () => {
    if (isClosedDeal) return null
    if (!chatSession || chatSession.status === 'cancelled' || chatSession.status === 'accepted') {
      return null
    }

    if (currentRole === 'bank' || (currentRole === 'admin' && selectedBank === deal?.bankName)) {
      if (chatSession.status === 'pending_verification') {
        return (
          <div className="space-y-3">
            <button
              onClick={handleVerifyIdentity}
              disabled={isLoading}
              className="w-full btn btn-primary"
            >
              {isLoading ? 'Verifying...' : '✅ Verify Identity'}
            </button>
            <button
              onClick={handleCancelDeal}
              className="w-full btn btn-danger"
            >
              ❌ Cancel Deal
            </button>
          </div>
        )
      }

      if (chatSession.status === 'verified' || chatSession.status === 'in_progress') {
        const hasOffers = chatSession.messages.some(msg => 
          msg.sender === deal.bankName && (msg.type === 'offer' || msg.type === 'counter_offer')
        )

        return (
          <div className="space-y-3">
            <button
              onClick={hasOffers ? handleGenerateCounterOffer : handleGenerateOffer}
              disabled={isLoading}
              className="w-full btn btn-success"
            >
              {isLoading ? 'Generating...' : hasOffers ? '🔁 Provide Counter-Offer' : '💬 Provide Offer'}
            </button>
            <button
              onClick={handleCancelDeal}
              className="w-full btn btn-danger"
            >
              ❌ Cancel Deal
            </button>
          </div>
        )
      }
    } else if (currentRole === 'company' || currentRole === 'admin') {
      const hasBankOffers = chatSession.messages.some(msg => 
        msg.sender === deal.bankName && (msg.type === 'offer' || msg.type === 'counter_offer')
      )

      if (hasBankOffers && chatSession.status === 'in_progress') {
        return (
          <div className="space-y-3">
            <button
              onClick={handleAcceptOffer}
              className="w-full btn btn-success"
            >
              ✅ Accept Offer
            </button>
            <button
              onClick={handleEvaluateOffer}
              disabled={isLoading}
              className="w-full btn btn-warning"
            >
              {isLoading ? 'Evaluating...' : '🔁 Check/Negotiate Offer'}
            </button>
            <button
              onClick={handleCancelDeal}
              className="w-full btn btn-danger"
            >
              ❌ Cancel Deal
            </button>
          </div>
        )
      }

      return (
        <div className="space-y-3">
          <button
            onClick={handleCancelDeal}
            className="w-full btn btn-danger"
          >
            ❌ Cancel Deal
          </button>
        </div>
      )
    }

    return null
  }

  if (!isOpen) return null

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300"
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 w-1/2 bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col">
        {/* Header */}
        <div className={`${isClosedDeal ? 'bg-gradient-to-r from-success-500 to-success-600' : 'bg-gradient-to-r from-primary-500 to-primary-600'} text-white p-6 flex-shrink-0`}>
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl font-bold mb-2">
                {isClosedDeal ? 'Completed Negotiation' : 'Negotiation Chat'}
              </h2>
              <div className={`${isClosedDeal ? 'text-success-100' : 'text-primary-100'} text-sm space-y-1`}>
                <div>Intent #{deal?.intentId} - {intent?.companyName}</div>
                <div>Bank: {deal?.bankName}</div>
                <div>Amount: ${intent?.amount?.toLocaleString()}</div>
                {wfapCompliance && (
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs bg-white/20 px-2 py-1 rounded-full">🔒 WFAP 1.0</span>
                    <span className="text-xs bg-white/20 px-2 py-1 rounded-full">✓ Digitally Signed</span>
                  </div>
                )}
                {isClosedDeal && <div className="text-xs mt-2 opacity-80">✅ Deal Completed</div>}
              </div>
            </div>
            <button
              onClick={onClose}
              className={`${isClosedDeal ? 'text-white hover:text-success-200' : 'text-white hover:text-primary-200'} transition-colors p-1`}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {chatSession?.messages?.map(renderMessage)}
          
          {isLoading && (
            <div className="flex justify-center">
              <div className="bg-gray-100 px-4 py-2 rounded-lg flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-sm text-gray-600">Thinking...</span>
              </div>
            </div>
          )}

          {/* Conversation Summary for Closed Deals */}
          {isClosedDeal && (
            <div className="border-t border-gray-200 pt-6 mt-6">
              <div className="bg-success-50 border border-success-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-success-800">
                    📋 Conversation Summary
                  </h3>
                  {!conversationSummary && (
                    <button
                      onClick={generateSummaryForClosedDeal}
                      disabled={isGeneratingSummary}
                      className="btn btn-success text-xs px-3 py-1"
                    >
                      {isGeneratingSummary ? 'Generating...' : 'Generate Summary'}
                    </button>
                  )}
                </div>

                {conversationSummary ? (
                  <div className="space-y-4">
                    <div className="bg-white p-6 rounded-lg border border-success-200 shadow-sm">
                      <div className="prose prose-sm max-w-none prose-headings:text-gray-900 prose-headings:font-semibold prose-h1:text-xl prose-h2:text-lg prose-h3:text-base prose-p:text-gray-700 prose-p:leading-relaxed prose-strong:text-gray-900 prose-strong:font-semibold prose-ul:text-gray-700 prose-ol:text-gray-700 prose-li:text-gray-700 prose-code:text-gray-800 prose-code:bg-gray-100 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-pre:bg-gray-50 prose-pre:border prose-pre:border-gray-200">
                        <ReactMarkdown 
                          remarkPlugins={[remarkGfm]}
                          components={{
                            h1: ({children}) => <h1 className="text-xl font-bold text-gray-900 mt-6 mb-4 border-b border-gray-200 pb-2">{children}</h1>,
                            h2: ({children}) => <h2 className="text-lg font-semibold text-gray-900 mt-5 mb-3">{children}</h2>,
                            h3: ({children}) => <h3 className="text-base font-semibold text-gray-800 mt-4 mb-2">{children}</h3>,
                            p: ({children}) => <p className="text-gray-700 leading-relaxed mb-3">{children}</p>,
                            ul: ({children}) => <ul className="list-disc list-inside space-y-1 mb-4 text-gray-700">{children}</ul>,
                            ol: ({children}) => <ol className="list-decimal list-inside space-y-1 mb-4 text-gray-700">{children}</ol>,
                            li: ({children}) => <li className="text-gray-700">{children}</li>,
                            strong: ({children}) => <strong className="font-semibold text-gray-900">{children}</strong>,
                            em: ({children}) => <em className="italic text-gray-600">{children}</em>,
                            code: ({children}) => <code className="bg-gray-100 text-gray-800 px-1 py-0.5 rounded text-sm font-mono">{children}</code>,
                            pre: ({children}) => <pre className="bg-gray-50 border border-gray-200 p-3 rounded-lg overflow-x-auto mb-4">{children}</pre>,
                            blockquote: ({children}) => <blockquote className="border-l-4 border-blue-200 pl-4 italic text-gray-600 my-4">{children}</blockquote>,
                            table: ({children}) => <div className="overflow-x-auto mb-4"><table className="min-w-full border border-gray-200 rounded-lg">{children}</table></div>,
                            thead: ({children}) => <thead className="bg-gray-50">{children}</thead>,
                            tbody: ({children}) => <tbody className="divide-y divide-gray-200">{children}</tbody>,
                            tr: ({children}) => <tr className="hover:bg-gray-50">{children}</tr>,
                            th: ({children}) => <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{children}</th>,
                            td: ({children}) => <td className="px-4 py-2 text-sm text-gray-700">{children}</td>
                          }}
                        >
                          {conversationSummary}
                        </ReactMarkdown>
                      </div>
                    </div>
                    
                    <button
                      onClick={handleDownloadAuditLog}
                      className="btn btn-primary w-full flex items-center justify-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                      </svg>
                      Download Audit Logs
                    </button>
                  </div>
                ) : isGeneratingSummary ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="w-6 h-6 border-2 border-success-500 border-t-transparent rounded-full animate-spin mr-2"></div>
                    <span className="text-success-700">Generating comprehensive summary...</span>
                  </div>
                ) : (
                  <p className="text-success-700 text-sm">
                    Click "Generate Summary" to create a comprehensive audit report of this negotiation.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="px-6 pb-4">
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
              <button 
                onClick={() => setError(null)}
                className="ml-2 text-red-500 hover:text-red-700"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* WFAP Audit Log Section */}
        {wfapCompliance && wfapMessages.length > 0 && (
          <div className="p-6 border-t border-gray-200 flex-shrink-0">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">WFAP Protocol Audit</h3>
              <button
                onClick={() => setShowWfapAudit(!showWfapAudit)}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                {showWfapAudit ? 'Hide Details' : 'Show Details'}
              </button>
            </div>
            
            {showWfapAudit ? (
              <WFAPAuditLog 
                messages={wfapMessages}
                onMessageClick={(message) => {/* Handle message click */}}
                showFilters={false}
              />
            ) : (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-blue-600">🔒</span>
                    <span className="text-sm font-medium text-blue-800">
                      {wfapMessages.length} WFAP messages processed
                    </span>
                  </div>
                  <div className="text-xs text-blue-600">
                    {wfapMessages.filter(msg => msg.verification?.isValid).length} verified
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        {!isClosedDeal && (
          <div className="p-6 border-t border-gray-200 flex-shrink-0">
            {renderActionButtons()}
          </div>
        )}
      </div>
    </>
  )
}

export default NegotiationDrawer