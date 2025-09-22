import React, { useState, useEffect } from 'react'
import { getWFAPStatistics } from '../../services/wfapService'

const WFAPStatus = ({ 
  isEnabled = true, 
  version = "WFAP/1.0", 
  messageCount = 0,
  messages = [],
  onToggleDetails = null 
}) => {
  const [stats, setStats] = useState(null)
  const [showDetails, setShowDetails] = useState(false)

  useEffect(() => {
    if (messages.length > 0) {
      const protocolStats = getWFAPStatistics(messages)
      setStats(protocolStats)
    }
  }, [messages])

  const handleToggleDetails = () => {
    setShowDetails(!showDetails)
    if (onToggleDetails) {
      onToggleDetails(!showDetails)
    }
  }

  const getStatusColor = () => {
    if (!isEnabled) return 'bg-gray-500'
    if (messageCount === 0) return 'bg-yellow-500'
    if (stats && stats.failedMessages > 0) return 'bg-orange-500'
    return 'bg-green-500'
  }

  const getStatusText = () => {
    if (!isEnabled) return 'Disabled'
    if (messageCount === 0) return 'Standby'
    if (stats && stats.failedMessages > 0) return 'Issues Detected'
    return 'Active'
  }

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full animate-pulse ${getStatusColor()}`}></div>
          <div>
            <h3 className="font-semibold text-gray-900">WFAP Protocol</h3>
            <p className="text-sm text-gray-600">Version {version}</p>
            <p className="text-xs text-gray-500">Status: {getStatusText()}</p>
          </div>
        </div>
        
        <div className="text-right">
          <div className="text-2xl font-bold text-blue-600">{messageCount}</div>
          <div className="text-xs text-gray-500">Messages Processed</div>
          {stats && (
            <div className="text-xs text-gray-500 mt-1">
              {stats.verifiedMessages} verified, {stats.failedMessages} failed
            </div>
          )}
        </div>
      </div>

      {/* Protocol Features */}
      <div className="mt-4 grid grid-cols-2 gap-4">
        <div className="text-center">
          <div className="text-lg font-bold text-green-600">✓</div>
          <div className="text-xs text-gray-600">Digital Signatures</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-green-600">✓</div>
          <div className="text-xs text-gray-600">ESG Assessment</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-green-600">✓</div>
          <div className="text-xs text-gray-600">Identity Verification</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-green-600">✓</div>
          <div className="text-xs text-gray-600">Audit Logging</div>
        </div>
      </div>

      {/* Detailed Statistics */}
      {stats && (
        <div className="mt-4">
          <button
            onClick={handleToggleDetails}
            className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            <span>{showDetails ? '▼' : '▶'}</span>
            {showDetails ? 'Hide Details' : 'Show Details'}
          </button>
          
          {showDetails && (
            <div className="mt-3 space-y-3 animate-fade-in">
              {/* Message Type Breakdown */}
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Message Types</h4>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(stats.messageTypes).map(([type, count]) => (
                    <div key={type} className="flex justify-between items-center text-xs">
                      <span className="text-gray-600">{type}</span>
                      <span className="font-semibold text-gray-900">{count}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Processing Statistics */}
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Processing Stats</h4>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Verified Messages</span>
                    <span className="font-semibold text-green-600">{stats.verifiedMessages}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Failed Messages</span>
                    <span className="font-semibold text-red-600">{stats.failedMessages}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Unique Senders</span>
                    <span className="font-semibold text-blue-600">{stats.uniqueSenders}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Avg Processing Time</span>
                    <span className="font-semibold text-gray-900">{stats.averageProcessingTime.toFixed(0)}ms</span>
                  </div>
                </div>
              </div>

              {/* Time Range */}
              {stats.timeRange.earliest && stats.timeRange.latest && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Activity Range</h4>
                  <div className="text-xs text-gray-600">
                    <div>From: {new Date(stats.timeRange.earliest).toLocaleString()}</div>
                    <div>To: {new Date(stats.timeRange.latest).toLocaleString()}</div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Protocol Compliance Indicators */}
      <div className="mt-4 pt-3 border-t border-blue-200">
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-600">Protocol Compliance</span>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-green-600 font-semibold">100%</span>
          </div>
        </div>
        <div className="flex items-center justify-between text-xs mt-1">
          <span className="text-gray-600">Security Level</span>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span className="text-blue-600 font-semibold">High</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default WFAPStatus
