import { useState, useEffect } from 'react'
import { format } from 'date-fns'

const MarketActivityLog = ({ activities, onClear, isVisible }) => {
  const [isExpanded, setIsExpanded] = useState(true)

  if (!isVisible || activities.length === 0) {
    return null
  }

  const formatTimestamp = (timestamp) => {
    return format(new Date(timestamp), 'HH:mm:ss')
  }

  const getActivityIcon = (type) => {
    switch (type) {
      case 'success':
        return '✅'
      case 'error':
        return '❌'
      case 'warning':
        return '⚠️'
      case 'info':
      default:
        return 'ℹ️'
    }
  }

  const getActivityClass = (type) => {
    switch (type) {
      case 'success':
        return 'text-green-700 bg-green-50 border-green-200'
      case 'error':
        return 'text-red-700 bg-red-50 border-red-200'
      case 'warning':
        return 'text-yellow-700 bg-yellow-50 border-yellow-200'
      case 'info':
      default:
        return 'text-blue-700 bg-blue-50 border-blue-200'
    }
  }

  return (
    <section className="py-4 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="bg-white border border-gray-200 rounded-lg shadow-soft overflow-hidden">
          {/* Header */}
          <div 
            className="px-6 py-4 bg-gradient-to-r from-indigo-50 to-indigo-100 border-b border-gray-200 cursor-pointer flex justify-between items-center"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <div className="flex items-center gap-3">
              <div className="text-xl">📊</div>
              <div>
                <h3 className="text-lg font-bold text-indigo-800">
                  Market Activity Feed
                </h3>
                <p className="text-sm text-indigo-600">
                  {activities.length} activities • Live market simulation events
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {activities.length > 0 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onClear()
                  }}
                  className="btn btn-ghost text-xs px-3 py-1 text-indigo-600 hover:bg-indigo-200"
                >
                  Clear
                </button>
              )}
              <button className="text-indigo-600 hover:text-indigo-800 transition-colors">
                {isExpanded ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Activity Feed */}
          {isExpanded && (
            <div className="max-h-64 overflow-y-auto">
              {activities.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="text-4xl mb-4 opacity-50">📋</div>
                  <p className="text-gray-500">No market activities yet</p>
                  <p className="text-sm text-gray-400 mt-1">
                    Start the market simulation to see live events
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {activities.slice(0, 20).map((activity, index) => (
                    <div 
                      key={activity.id} 
                      className={`p-4 flex items-start gap-3 ${
                        index === 0 ? 'animate-fade-in' : ''
                      }`}
                    >
                      <div className="flex-shrink-0 mt-0.5">
                        <span className="text-lg">
                          {getActivityIcon(activity.type)}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className={`text-sm leading-relaxed ${
                            activity.type === 'success' ? 'text-green-700' :
                            activity.type === 'error' ? 'text-red-700' :
                            activity.type === 'warning' ? 'text-yellow-700' :
                            'text-blue-700'
                          }`}>
                            {activity.message}
                          </p>
                          <span className="text-xs text-gray-500 whitespace-nowrap">
                            {formatTimestamp(activity.timestamp)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {activities.length > 20 && (
                    <div className="p-4 text-center text-sm text-gray-500">
                      ... and {activities.length - 20} more activities
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

export default MarketActivityLog