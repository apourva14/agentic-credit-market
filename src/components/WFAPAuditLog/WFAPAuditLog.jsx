import React, { useState, useMemo } from 'react'
import { format } from 'date-fns'
import { MESSAGE_TYPES } from '../../schemas/wfapSchemas'

const WFAPAuditLog = ({ 
  messages = [], 
  onMessageClick = null,
  onFilterChange = null,
  showFilters = true 
}) => {
  const [selectedMessage, setSelectedMessage] = useState(null)
  const [filter, setFilter] = useState({
    messageType: 'all',
    sender: 'all',
    status: 'all',
    dateRange: 'all'
  })

  // Filter messages based on current filter
  const filteredMessages = useMemo(() => {
    return messages.filter(message => {
      if (filter.messageType !== 'all' && message.messageType !== filter.messageType) return false
      if (filter.sender !== 'all' && message.senderName !== filter.sender) return false
      if (filter.status !== 'all') {
        const isVerified = message.verification?.isValid
        if (filter.status === 'verified' && !isVerified) return false
        if (filter.status === 'failed' && isVerified) return false
      }
      return true
    })
  }, [messages, filter])

  // Get unique senders for filter dropdown
  const uniqueSenders = useMemo(() => {
    const senders = [...new Set(messages.map(msg => msg.senderName))]
    return senders.sort()
  }, [messages])

  const formatMessageType = (type) => {
    const icons = {
      [MESSAGE_TYPES.INTENT]: '📝',
      [MESSAGE_TYPES.OFFER]: '💰',
      [MESSAGE_TYPES.ACCEPTANCE]: '✅',
      [MESSAGE_TYPES.REJECTION]: '❌',
      [MESSAGE_TYPES.COUNTER_OFFER]: '🔄'
    }
    return icons[type] || '📄'
  }

  const getStatusColor = (message) => {
    if (!message.verification) return 'text-gray-500'
    return message.verification.isValid ? 'text-green-600' : 'text-red-600'
  }

  const getStatusIcon = (message) => {
    if (!message.verification) return '❓'
    return message.verification.isValid ? '✓' : '✗'
  }

  const handleMessageClick = (message) => {
    setSelectedMessage(message)
    if (onMessageClick) {
      onMessageClick(message)
    }
  }

  const handleFilterChange = (key, value) => {
    const newFilter = { ...filter, [key]: value }
    setFilter(newFilter)
    if (onFilterChange) {
      onFilterChange(newFilter)
    }
  }

  const formatMessageDetails = (message) => {
    const details = []
    
    if (message.approvedAmount) {
      details.push(`Amount: $${message.approvedAmount.toLocaleString()}`)
    }
    if (message.interestRate) {
      details.push(`Rate: ${(message.interestRate * 100).toFixed(2)}%`)
    }
    if (message.esgScore) {
      details.push(`ESG Score: ${message.esgScore}`)
    }
    if (message.carbonAdjustment) {
      details.push(`Carbon Adj: ${message.carbonAdjustment > 0 ? '+' : ''}${(message.carbonAdjustment * 100).toFixed(2)}%`)
    }
    if (message.amount) {
      details.push(`Amount: $${message.amount.toLocaleString()}`)
    }
    if (message.purpose) {
      details.push(`Purpose: ${message.purpose.substring(0, 50)}${message.purpose.length > 50 ? '...' : ''}`)
    }
    
    return details
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">WFAP Message Audit Trail</h3>
            <p className="text-sm text-gray-600">Complete protocol message history</p>
          </div>
          <div className="text-sm text-gray-500">
            {filteredMessages.length} of {messages.length} messages
          </div>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Message Type</label>
              <select
                value={filter.messageType}
                onChange={(e) => handleFilterChange('messageType', e.target.value)}
                className="w-full text-xs border border-gray-300 rounded px-2 py-1"
              >
                <option value="all">All Types</option>
                {Object.values(MESSAGE_TYPES).map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Sender</label>
              <select
                value={filter.sender}
                onChange={(e) => handleFilterChange('sender', e.target.value)}
                className="w-full text-xs border border-gray-300 rounded px-2 py-1"
              >
                <option value="all">All Senders</option>
                {uniqueSenders.map(sender => (
                  <option key={sender} value={sender}>{sender}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
              <select
                value={filter.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full text-xs border border-gray-300 rounded px-2 py-1"
              >
                <option value="all">All Status</option>
                <option value="verified">Verified</option>
                <option value="failed">Failed</option>
              </select>
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Date Range</label>
              <select
                value={filter.dateRange}
                onChange={(e) => handleFilterChange('dateRange', e.target.value)}
                className="w-full text-xs border border-gray-300 rounded px-2 py-1"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Messages List */}
      <div className="max-h-96 overflow-y-auto">
        {filteredMessages.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <div className="text-4xl mb-2">📭</div>
            <p>No messages found</p>
            <p className="text-sm">Try adjusting your filters</p>
          </div>
        ) : (
          filteredMessages.map((message, index) => (
            <div 
              key={message.messageId || index}
              className="p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
              onClick={() => handleMessageClick(message)}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{formatMessageType(message.messageType)}</span>
                  <span className="font-semibold text-gray-900">{message.messageType}</span>
                  <span className="text-xs text-gray-500 font-mono">#{message.messageId}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">
                    {format(new Date(message.timestamp), 'HH:mm:ss')}
                  </span>
                  <span className={`text-xs ${getStatusColor(message)}`}>
                    {getStatusIcon(message)}
                  </span>
                </div>
              </div>
              
              <div className="text-sm text-gray-700 mb-2">
                <div><strong>From:</strong> {message.senderName}</div>
                {message.inResponseTo && (
                  <div><strong>Response to:</strong> {message.inResponseTo}</div>
                )}
              </div>
              
              <div className="text-xs text-gray-600">
                {formatMessageDetails(message).map((detail, idx) => (
                  <span key={idx}>
                    {detail}
                    {idx < formatMessageDetails(message).length - 1 && ' • '}
                  </span>
                ))}
              </div>
              
              {/* Signature Verification Status */}
              <div className="mt-2 flex items-center gap-2">
                <span className={`text-xs ${getStatusColor(message)}`}>
                  {getStatusIcon(message)}
                </span>
                <span className="text-xs text-gray-600">
                  {message.verification?.isValid ? 'Digitally Signed & Verified' : 'Signature Verification Failed'}
                </span>
                {message.verification?.processingTimeMs && (
                  <span className="text-xs text-gray-500">
                    ({message.verification.processingTimeMs}ms)
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Message Details Modal */}
      {selectedMessage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-96 overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Message Details: {selectedMessage.messageType}
              </h3>
              <button
                onClick={() => setSelectedMessage(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="font-semibold text-gray-700">Message ID:</span>
                  <div className="text-gray-600 font-mono text-xs">{selectedMessage.messageId}</div>
                </div>
                <div>
                  <span className="font-semibold text-gray-700">Timestamp:</span>
                  <div className="text-gray-600">{format(new Date(selectedMessage.timestamp), 'PPpp')}</div>
                </div>
                <div>
                  <span className="font-semibold text-gray-700">Sender:</span>
                  <div className="text-gray-600">{selectedMessage.senderName}</div>
                </div>
                <div>
                  <span className="font-semibold text-gray-700">Version:</span>
                  <div className="text-gray-600">{selectedMessage.version}</div>
                </div>
              </div>
              
              {selectedMessage.inResponseTo && (
                <div>
                  <span className="font-semibold text-gray-700">Response To:</span>
                  <div className="text-gray-600 font-mono text-xs">{selectedMessage.inResponseTo}</div>
                </div>
              )}
              
              {selectedMessage.verification && (
                <div>
                  <span className="font-semibold text-gray-700">Verification:</span>
                  <div className="text-gray-600">
                    Status: {selectedMessage.verification.isValid ? 'Valid' : 'Invalid'}
                    {selectedMessage.verification.processingTimeMs && (
                      <span className="ml-2">({selectedMessage.verification.processingTimeMs}ms)</span>
                    )}
                  </div>
                </div>
              )}
              
              <div>
                <span className="font-semibold text-gray-700">Raw Message:</span>
                <pre className="text-xs text-gray-600 bg-gray-100 p-2 rounded mt-1 overflow-x-auto">
                  {JSON.stringify(selectedMessage, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default WFAPAuditLog
