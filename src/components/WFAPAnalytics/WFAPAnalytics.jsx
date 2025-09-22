import React, { useState, useEffect, useMemo } from 'react'
import { format, subDays, subMonths, subYears } from 'date-fns'
import { MESSAGE_TYPES } from '../../schemas/wfapSchemas'

const WFAPAnalytics = ({ 
  messages = [], 
  intents = [], 
  ongoingDeals = [], 
  closedDeals = [],
  onExportData 
}) => {
  const [timeRange, setTimeRange] = useState('30d')
  const [selectedMetric, setSelectedMetric] = useState('overview')
  const [chartData, setChartData] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  // Calculate comprehensive analytics
  const analytics = useMemo(() => {
    const allMessages = [...intents, ...ongoingDeals, ...closedDeals, ...messages]
    const wfapMessages = allMessages.filter(msg => 
      msg.messageType && Object.values(MESSAGE_TYPES).includes(msg.messageType)
    )

    const now = new Date()
    const timeRanges = {
      '7d': subDays(now, 7),
      '30d': subDays(now, 30),
      '90d': subDays(now, 90),
      '1y': subYears(now, 1)
    }

    const filteredMessages = wfapMessages.filter(msg => 
      new Date(msg.timestamp) >= timeRanges[timeRange]
    )

    return calculateAnalytics(filteredMessages, timeRange)
  }, [messages, intents, ongoingDeals, closedDeals, timeRange])

  const calculateAnalytics = (messages, range) => {
    const totalMessages = messages.length
    const verifiedMessages = messages.filter(msg => msg.verification?.isValid).length
    const failedMessages = totalMessages - verifiedMessages

    // Message type distribution
    const messageTypes = messages.reduce((acc, msg) => {
      acc[msg.messageType] = (acc[msg.messageType] || 0) + 1
      return acc
    }, {})

    // Sender analysis
    const senders = messages.reduce((acc, msg) => {
      const sender = msg.senderName || msg.senderId
      if (!acc[sender]) {
        acc[sender] = {
          name: sender,
          messageCount: 0,
          verifiedCount: 0,
          avgProcessingTime: 0,
          esgScore: 0,
          totalAmount: 0
        }
      }
      acc[sender].messageCount++
      if (msg.verification?.isValid) acc[sender].verifiedCount++
      if (msg.verification?.processingTimeMs) {
        acc[sender].avgProcessingTime = (acc[sender].avgProcessingTime + msg.verification.processingTimeMs) / 2
      }
      if (msg.esgScore) acc[sender].esgScore = (acc[sender].esgScore + msg.esgScore) / 2
      if (msg.amount || msg.approvedAmount) {
        acc[sender].totalAmount += (msg.amount || msg.approvedAmount || 0)
      }
      return acc
    }, {})

    // ESG analysis
    const esgMessages = messages.filter(msg => msg.esgScore !== undefined)
    const avgESGScore = esgMessages.length > 0 
      ? esgMessages.reduce((sum, msg) => sum + msg.esgScore, 0) / esgMessages.length 
      : 0

    const carbonAdjustments = messages.filter(msg => msg.carbonAdjustment !== undefined)
    const avgCarbonAdjustment = carbonAdjustments.length > 0
      ? carbonAdjustments.reduce((sum, msg) => sum + msg.carbonAdjustment, 0) / carbonAdjustments.length
      : 0

    // Processing performance
    const processingTimes = messages
      .filter(msg => msg.verification?.processingTimeMs)
      .map(msg => msg.verification.processingTimeMs)
    
    const avgProcessingTime = processingTimes.length > 0
      ? processingTimes.reduce((sum, time) => sum + time, 0) / processingTimes.length
      : 0

    // Success rates
    const intentMessages = messages.filter(msg => msg.messageType === MESSAGE_TYPES.INTENT)
    const offerMessages = messages.filter(msg => msg.messageType === MESSAGE_TYPES.OFFER)
    const acceptanceMessages = messages.filter(msg => msg.messageType === MESSAGE_TYPES.ACCEPTANCE)
    
    const conversionRate = intentMessages.length > 0 
      ? (acceptanceMessages.length / intentMessages.length) * 100 
      : 0

    const offerAcceptanceRate = offerMessages.length > 0
      ? (acceptanceMessages.length / offerMessages.length) * 100
      : 0

    // Financial metrics
    const totalAmount = messages.reduce((sum, msg) => 
      sum + (msg.amount || msg.approvedAmount || 0), 0
    )

    const avgAmount = messages.length > 0 ? totalAmount / messages.length : 0

    // Time-based trends
    const dailyStats = messages.reduce((acc, msg) => {
      const date = format(new Date(msg.timestamp), 'yyyy-MM-dd')
      if (!acc[date]) {
        acc[date] = {
          date,
          messages: 0,
          verified: 0,
          amount: 0,
          esgScore: 0,
          esgCount: 0
        }
      }
      acc[date].messages++
      if (msg.verification?.isValid) acc[date].verified++
      acc[date].amount += (msg.amount || msg.approvedAmount || 0)
      if (msg.esgScore) {
        acc[date].esgScore += msg.esgScore
        acc[date].esgCount++
      }
      return acc
    }, {})

    const dailyTrends = Object.values(dailyStats).sort((a, b) => 
      new Date(a.date) - new Date(b.date)
    )

    return {
      overview: {
        totalMessages,
        verifiedMessages,
        failedMessages,
        verificationRate: totalMessages > 0 ? (verifiedMessages / totalMessages) * 100 : 0,
        avgProcessingTime,
        conversionRate,
        offerAcceptanceRate,
        totalAmount,
        avgAmount
      },
      messageTypes,
      senders: Object.values(senders),
      esg: {
        avgScore: avgESGScore,
        avgCarbonAdjustment,
        totalGreenDeals: esgMessages.filter(msg => msg.esgScore >= 80).length,
        carbonNeutralDeals: esgMessages.filter(msg => msg.carbonAdjustment < 0).length
      },
      performance: {
        avgProcessingTime,
        maxProcessingTime: Math.max(...processingTimes, 0),
        minProcessingTime: Math.min(...processingTimes, Infinity) || 0,
        successRate: (verifiedMessages / totalMessages) * 100
      },
      trends: {
        daily: dailyTrends,
        messageVolume: dailyTrends.map(d => d.messages),
        verificationRate: dailyTrends.map(d => d.messages > 0 ? (d.verified / d.messages) * 100 : 0),
        amountTrend: dailyTrends.map(d => d.amount),
        esgTrend: dailyTrends.map(d => d.esgCount > 0 ? d.esgScore / d.esgCount : 0)
      }
    }
  }

  const generateChartData = (metric) => {
    setIsLoading(true)
    
    setTimeout(() => {
      let data = null
      
      switch (metric) {
        case 'messageVolume':
          data = {
            labels: analytics.trends.daily.map(d => format(new Date(d.date), 'MMM dd')),
            datasets: [{
              label: 'Messages',
              data: analytics.trends.messageVolume,
              borderColor: 'rgb(59, 130, 246)',
              backgroundColor: 'rgba(59, 130, 246, 0.1)',
              tension: 0.4
            }]
          }
          break
          
        case 'verificationRate':
          data = {
            labels: analytics.trends.daily.map(d => format(new Date(d.date), 'MMM dd')),
            datasets: [{
              label: 'Verification Rate (%)',
              data: analytics.trends.verificationRate,
              borderColor: 'rgb(34, 197, 94)',
              backgroundColor: 'rgba(34, 197, 94, 0.1)',
              tension: 0.4
            }]
          }
          break
          
        case 'amountTrend':
          data = {
            labels: analytics.trends.daily.map(d => format(new Date(d.date), 'MMM dd')),
            datasets: [{
              label: 'Amount ($)',
              data: analytics.trends.amountTrend,
              borderColor: 'rgb(168, 85, 247)',
              backgroundColor: 'rgba(168, 85, 247, 0.1)',
              tension: 0.4
            }]
          }
          break
          
        case 'esgTrend':
          data = {
            labels: analytics.trends.daily.map(d => format(new Date(d.date), 'MMM dd')),
            datasets: [{
              label: 'ESG Score',
              data: analytics.trends.esgTrend,
              borderColor: 'rgb(16, 185, 129)',
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
              tension: 0.4
            }]
          }
          break
          
        case 'messageTypes':
          data = {
            labels: Object.keys(analytics.messageTypes),
            datasets: [{
              data: Object.values(analytics.messageTypes),
              backgroundColor: [
                'rgb(59, 130, 246)',
                'rgb(34, 197, 94)',
                'rgb(251, 191, 36)',
                'rgb(239, 68, 68)',
                'rgb(168, 85, 247)'
              ]
            }]
          }
          break
          
        case 'senders':
          data = {
            labels: analytics.senders.map(s => s.name),
            datasets: [{
              label: 'Messages',
              data: analytics.senders.map(s => s.messageCount),
              backgroundColor: 'rgba(59, 130, 246, 0.8)'
            }]
          }
          break
      }
      
      setChartData(data)
      setIsLoading(false)
    }, 500)
  }

  useEffect(() => {
    if (selectedMetric) {
      generateChartData(selectedMetric)
    }
  }, [selectedMetric, analytics])

  const exportData = (format) => {
    if (onExportData) {
      onExportData(analytics, format)
    }
  }

  const getMetricIcon = (metric) => {
    const icons = {
      overview: '📊',
      messageVolume: '📈',
      verificationRate: '✅',
      amountTrend: '💰',
      esgTrend: '🌱',
      messageTypes: '📝',
      senders: '👥'
    }
    return icons[metric] || '📊'
  }

  const getMetricColor = (metric) => {
    const colors = {
      overview: 'text-blue-600',
      messageVolume: 'text-blue-600',
      verificationRate: 'text-green-600',
      amountTrend: 'text-purple-600',
      esgTrend: 'text-green-600',
      messageTypes: 'text-indigo-600',
      senders: 'text-orange-600'
    }
    return colors[metric] || 'text-gray-600'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">WFAP Analytics</h2>
          <p className="text-gray-600">Comprehensive protocol performance and insights</p>
        </div>
        <div className="flex items-center gap-4">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2 text-sm"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
          <button
            onClick={() => exportData('json')}
            className="btn btn-secondary"
          >
            📊 Export Data
          </button>
        </div>
      </div>

      {/* Overview Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <span className="text-2xl">📊</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Messages</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.overview.totalMessages}</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <span className="text-2xl">✅</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Verification Rate</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.overview.verificationRate.toFixed(1)}%</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <span className="text-2xl">💰</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Amount</p>
              <p className="text-2xl font-bold text-gray-900">
                ${(analytics.overview.totalAmount / 1000000).toFixed(1)}M
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <span className="text-2xl">🌱</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg ESG Score</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.esg.avgScore.toFixed(1)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Metric Selection */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Analytics Dashboard</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'messageVolume', label: 'Message Volume' },
            { id: 'verificationRate', label: 'Verification Rate' },
            { id: 'amountTrend', label: 'Amount Trend' },
            { id: 'esgTrend', label: 'ESG Trend' },
            { id: 'messageTypes', label: 'Message Types' },
            { id: 'senders', label: 'Senders' }
          ].map(metric => (
            <button
              key={metric.id}
              onClick={() => setSelectedMetric(metric.id)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedMetric === metric.id
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <span>{getMetricIcon(metric.id)}</span>
              {metric.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chart Display */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            {getMetricIcon(selectedMetric)} {selectedMetric.charAt(0).toUpperCase() + selectedMetric.slice(1)} Analysis
          </h3>
          {isLoading && (
            <div className="flex items-center gap-2 text-gray-500">
              <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              Loading...
            </div>
          )}
        </div>

        {chartData && !isLoading ? (
          <div className="h-96 flex items-center justify-center">
            <div className="text-center">
              <div className="text-6xl mb-4">📊</div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Chart Visualization</h4>
              <p className="text-gray-600 mb-4">
                Chart data generated for {selectedMetric} analysis
              </p>
              <div className="bg-gray-50 rounded-lg p-4 text-left">
                <h5 className="font-medium text-gray-900 mb-2">Chart Data:</h5>
                <pre className="text-xs text-gray-600 overflow-x-auto">
                  {JSON.stringify(chartData, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-96 flex items-center justify-center">
            <div className="text-center text-gray-500">
              <div className="text-4xl mb-2">📈</div>
              <p>Select a metric to view analytics</p>
            </div>
          </div>
        )}
      </div>

      {/* Detailed Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance Metrics */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Metrics</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Average Processing Time</span>
              <span className="font-semibold">{analytics.performance.avgProcessingTime.toFixed(0)}ms</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Success Rate</span>
              <span className="font-semibold text-green-600">{analytics.performance.successRate.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Conversion Rate</span>
              <span className="font-semibold text-blue-600">{analytics.overview.conversionRate.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Offer Acceptance Rate</span>
              <span className="font-semibold text-purple-600">{analytics.overview.offerAcceptanceRate.toFixed(1)}%</span>
            </div>
          </div>
        </div>

        {/* ESG Impact */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">ESG Impact</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Average ESG Score</span>
              <span className="font-semibold text-green-600">{analytics.esg.avgScore.toFixed(1)}/100</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Carbon Adjustment</span>
              <span className="font-semibold text-blue-600">
                {analytics.esg.avgCarbonAdjustment > 0 ? '+' : ''}{(analytics.esg.avgCarbonAdjustment * 100).toFixed(2)}%
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Green Deals</span>
              <span className="font-semibold text-green-600">{analytics.esg.totalGreenDeals}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Carbon Neutral Deals</span>
              <span className="font-semibold text-green-600">{analytics.esg.carbonNeutralDeals}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Top Senders */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Senders</h3>
        <div className="space-y-3">
          {analytics.senders
            .sort((a, b) => b.messageCount - a.messageCount)
            .slice(0, 5)
            .map((sender, index) => (
              <div key={sender.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-semibold text-blue-600">
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{sender.name}</div>
                    <div className="text-sm text-gray-600">
                      {sender.verifiedCount}/{sender.messageCount} verified
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-gray-900">{sender.messageCount} messages</div>
                  <div className="text-sm text-gray-600">
                    ${(sender.totalAmount / 1000000).toFixed(1)}M total
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  )
}

export default WFAPAnalytics
