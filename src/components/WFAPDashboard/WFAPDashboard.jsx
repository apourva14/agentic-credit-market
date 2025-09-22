import React, { useState, useEffect } from 'react'
import { format } from 'date-fns'
import WFAPStatus from '../WFAPStatus/WFAPStatus'
import WFAPAuditLog from '../WFAPAuditLog/WFAPAuditLog'
import WFAPValidator from '../WFAPValidator/WFAPValidator'
import WFAPMessageBuilder from '../WFAPMessageBuilder/WFAPMessageBuilder'
import { MESSAGE_TYPES } from '../../schemas/wfapSchemas'
import { getWFAPStatistics } from '../../services/wfapService'

const WFAPDashboard = ({ 
  messages = [], 
  intents = [], 
  ongoingDeals = [], 
  closedDeals = [],
  onMessageCreated,
  onRefresh 
}) => {
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedMessage, setSelectedMessage] = useState(null)
  const [showMessageBuilder, setShowMessageBuilder] = useState(false)
  const [filteredMessages, setFilteredMessages] = useState(messages)
  const [filters, setFilters] = useState({
    messageType: 'all',
    sender: 'all',
    status: 'all',
    dateRange: 'all'
  })

  // Calculate comprehensive statistics
  const [stats, setStats] = useState({
    totalMessages: 0,
    wfapMessages: 0,
    complianceRate: 0,
    messageTypes: {},
    processingStats: {},
    securityStats: {},
    esgStats: {},
    timeRange: {}
  })

  useEffect(() => {
    const allMessages = [...intents, ...ongoingDeals, ...closedDeals, ...messages]
    const wfapMessages = allMessages.filter(msg => 
      msg.messageType && Object.values(MESSAGE_TYPES).includes(msg.messageType)
    )
    
    const statistics = getWFAPStatistics(wfapMessages)
    setStats(statistics)
    setFilteredMessages(wfapMessages)
  }, [messages, intents, ongoingDeals, closedDeals])

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters)
    
    let filtered = [...messages, ...intents, ...ongoingDeals, ...closedDeals]
      .filter(msg => msg.messageType && Object.values(MESSAGE_TYPES).includes(msg.messageType))

    if (newFilters.messageType !== 'all') {
      filtered = filtered.filter(msg => msg.messageType === newFilters.messageType)
    }
    if (newFilters.sender !== 'all') {
      filtered = filtered.filter(msg => msg.senderName === newFilters.sender)
    }
    if (newFilters.status !== 'all') {
      const isVerified = (msg) => msg.verification?.isValid
      if (newFilters.status === 'verified') {
        filtered = filtered.filter(isVerified)
      } else if (newFilters.status === 'failed') {
        filtered = filtered.filter(msg => !isVerified(msg))
      }
    }

    setFilteredMessages(filtered)
  }

  const getMessageTypeIcon = (type) => {
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

  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* Protocol Status */}
      <WFAPStatus 
        isEnabled={stats.wfapMessages > 0}
        version="WFAP/1.0"
        messageCount={stats.wfapMessages}
        messages={filteredMessages}
      />

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <span className="text-2xl">📊</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Messages</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalMessages}</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <span className="text-2xl">🔒</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">WFAP Compliant</p>
              <p className="text-2xl font-bold text-gray-900">{stats.wfapMessages}</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <span className="text-2xl">✓</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Compliance Rate</p>
              <p className="text-2xl font-bold text-gray-900">{stats.complianceRate.toFixed(1)}%</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <span className="text-2xl">⚡</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg Processing</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.processingStats.averageProcessingTime?.toFixed(0) || 0}ms
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Message Type Distribution */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Message Type Distribution</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {Object.entries(stats.messageTypes).map(([type, count]) => (
            <div key={type} className="text-center">
              <div className="text-3xl mb-2">{getMessageTypeIcon(type)}</div>
              <div className="text-2xl font-bold text-gray-900">{count}</div>
              <div className="text-sm text-gray-600">{type}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ESG Statistics */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">ESG Impact Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">
              {stats.esgStats.averageESGScore?.toFixed(1) || 0}
            </div>
            <div className="text-sm text-gray-600">Average ESG Score</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">
              {stats.esgStats.totalCarbonReduction?.toFixed(2) || 0}%
            </div>
            <div className="text-sm text-gray-600">Total Carbon Reduction</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600">
              {stats.esgStats.greenDeals || 0}
            </div>
            <div className="text-sm text-gray-600">Green Deals</div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderMessagesTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">WFAP Messages</h3>
        <div className="flex gap-3">
          <button
            onClick={() => setShowMessageBuilder(true)}
            className="btn btn-primary"
          >
            + Create Message
          </button>
          <button
            onClick={onRefresh}
            className="btn btn-secondary"
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      <WFAPAuditLog 
        messages={filteredMessages}
        onMessageClick={setSelectedMessage}
        onFilterChange={handleFilterChange}
        showFilters={true}
      />
    </div>
  )

  const renderValidationTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Message Validation</h3>
        <div className="text-sm text-gray-600">
          Select a message to validate
        </div>
      </div>

      {selectedMessage ? (
        <WFAPValidator 
          message={selectedMessage}
          showDetails={true}
          realTime={true}
        />
      ) : (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          <div className="text-4xl mb-4">🔍</div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">No Message Selected</h3>
          <p className="text-gray-600">
            Click on a message in the Messages tab to validate it
          </p>
        </div>
      )}
    </div>
  )

  const renderAnalyticsTab = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Protocol Analytics</h3>
      
      {/* Processing Performance */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h4 className="text-md font-semibold text-gray-900 mb-4">Processing Performance</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <div className="text-2xl font-bold text-blue-600">
              {stats.processingStats.averageProcessingTime?.toFixed(0) || 0}ms
            </div>
            <div className="text-sm text-gray-600">Average Processing Time</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600">
              {stats.processingStats.verifiedMessages || 0}
            </div>
            <div className="text-sm text-gray-600">Verified Messages</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-red-600">
              {stats.processingStats.failedMessages || 0}
            </div>
            <div className="text-sm text-gray-600">Failed Messages</div>
          </div>
        </div>
      </div>

      {/* Security Metrics */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h4 className="text-md font-semibold text-gray-900 mb-4">Security Metrics</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="text-2xl font-bold text-green-600">
              {stats.securityStats.validSignatures || 0}
            </div>
            <div className="text-sm text-gray-600">Valid Digital Signatures</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-blue-600">
              {stats.securityStats.verifiedIdentities || 0}
            </div>
            <div className="text-sm text-gray-600">Verified Identities</div>
          </div>
        </div>
      </div>

      {/* Time Range Analysis */}
      {stats.timeRange.earliest && stats.timeRange.latest && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h4 className="text-md font-semibold text-gray-900 mb-4">Activity Timeline</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="text-sm text-gray-600">First Message</div>
              <div className="font-semibold text-gray-900">
                {format(new Date(stats.timeRange.earliest), 'PPpp')}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Latest Message</div>
              <div className="font-semibold text-gray-900">
                {format(new Date(stats.timeRange.latest), 'PPpp')}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">WFAP Protocol Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Comprehensive monitoring and management of Wells Fargo Agent Protocol messages
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: '📊' },
              { id: 'messages', label: 'Messages', icon: '📝' },
              { id: 'validation', label: 'Validation', icon: '🔍' },
              { id: 'analytics', label: 'Analytics', icon: '📈' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <span>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow-sm">
          {activeTab === 'overview' && renderOverviewTab()}
          {activeTab === 'messages' && renderMessagesTab()}
          {activeTab === 'validation' && renderValidationTab()}
          {activeTab === 'analytics' && renderAnalyticsTab()}
        </div>

        {/* Message Builder Modal */}
        {showMessageBuilder && (
          <WFAPMessageBuilder
            onMessageCreated={(message, result) => {
              if (onMessageCreated) {
                onMessageCreated(message, result)
              }
              setShowMessageBuilder(false)
            }}
            onClose={() => setShowMessageBuilder(false)}
          />
        )}
      </div>
    </div>
  )
}

export default WFAPDashboard
