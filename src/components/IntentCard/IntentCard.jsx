import { format } from 'date-fns'
import { availableBanks } from '../../data/sampleData'
import { MESSAGE_TYPES } from '../../schemas/wfapSchemas'

const IntentCard = ({ 
  intent, 
  currentRole, 
  selectedBank,
  permissions, 
  onExpressInterest, 
  onDeleteIntent,
  hasOngoingDeals 
}) => {
  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const formatTimestamp = (timestamp) => {
    return format(new Date(timestamp), 'MMM dd, yyyy HH:mm')
  }

  const handleExpressInterest = () => {
    if (currentRole === 'admin') {
      // Admin can express interest as any bank - for demo, let's use first available
      onExpressInterest(intent.id, availableBanks[0])
    } else if (currentRole === 'bank' && selectedBank) {
      onExpressInterest(intent.id, selectedBank)
    }
  }

  const canExpressInterest = () => {
    if (!permissions.canExpressInterest) return false
    if (currentRole === 'admin') return true
    if (currentRole === 'bank' && selectedBank) return true
    return false
  }

  const handleDelete = () => {
    if (permissions.canDelete) {
      onDeleteIntent(intent.id)
    }
  }

  // WFAP-specific helper functions
  const getESGPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return 'text-green-600 bg-green-100'
      case 'Medium': return 'text-yellow-600 bg-yellow-100'
      case 'Low': return 'text-gray-600 bg-gray-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getESGPriorityIcon = (priority) => {
    switch (priority) {
      case 'High': return '🌱'
      case 'Medium': return '🌿'
      case 'Low': return '🌳'
      default: return '🌳'
    }
  }

  const isWFAPCompliant = () => {
    return intent.messageType === MESSAGE_TYPES.INTENT && 
           intent.version === "WFAP/1.0" && 
           intent.signature && 
           intent.signatureCertId
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-soft hover:shadow-medium transition-all duration-200 hover:-translate-y-1 animate-slide-up">
      {/* Card Header */}
      <div className="flex justify-between items-start p-4 pb-3 border-b border-gray-100">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-primary-600">
              Intent #{intent.id}
            </h3>
            {isWFAPCompliant() && (
              <div className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
                <span>🔒</span>
                WFAP 1.0
              </div>
            )}
          </div>
          <span className="text-xs text-gray-500 font-medium mt-0.5">
            {formatTimestamp(intent.timestamp)}
          </span>
          {intent.messageId && (
            <span className="text-xs text-blue-600 font-mono mt-1">
              ID: {intent.messageId}
            </span>
          )}
        </div>
        
        {permissions.canDelete && (
          <button 
            className="w-6 h-6 rounded-md bg-gray-100 hover:bg-danger-500 text-gray-600 hover:text-white font-bold transition-all duration-200 flex items-center justify-center text-lg leading-none"
            onClick={handleDelete}
            title="Delete Intent"
          >
            ×
          </button>
        )}
      </div>
      
      {/* Card Body */}
      <div className="p-4 space-y-4">
        <div className="text-lg font-semibold text-gray-900">
          {intent.companyName}
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
              Amount
            </span>
            <div className="text-sm font-bold text-gray-900">
              {formatAmount(intent.amount)}
            </div>
          </div>
          
          <div className="space-y-1">
            <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
              Duration
            </span>
            <div className="text-sm font-bold text-gray-900">
              {intent.duration || intent.term} months
            </div>
          </div>
        </div>

        {/* WFAP-specific fields */}
        {(intent.maxRate || intent.esgPriority) && (
          <div className="grid grid-cols-2 gap-3">
            {intent.maxRate && (
              <div className="space-y-1">
                <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                  Max Rate
                </span>
                <div className="text-sm font-bold text-orange-600">
                  {intent.maxRate}%
                </div>
              </div>
            )}
            
            {intent.esgPriority && (
              <div className="space-y-1">
                <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                  ESG Priority
                </span>
                <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${getESGPriorityColor(intent.esgPriority)}`}>
                  <span>{getESGPriorityIcon(intent.esgPriority)}</span>
                  {intent.esgPriority}
                </div>
              </div>
            )}
          </div>
        )}
        
        <div className="space-y-1">
          <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
            Purpose
          </span>
          <p className="text-sm text-gray-700 leading-relaxed">
            {intent.purpose}
          </p>
        </div>
        
        {/* Status indicators */}
        <div className="flex flex-wrap gap-2">
          {hasOngoingDeals && (
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-warning-100 text-warning-800 rounded-full text-xs font-semibold">
              <span>🤝</span>
              Has Active Negotiations
            </div>
          )}
          
          {isWFAPCompliant() && (
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
              <span>✓</span>
              Digitally Signed
            </div>
          )}
          
          {intent.senderType && (
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
              <span>🏢</span>
              {intent.senderType}
            </div>
          )}
        </div>
      </div>
      
      {/* Card Actions */}
      {canExpressInterest() && !permissions.isReadOnly && (
        <div className="p-4 pt-3 border-t border-gray-100 bg-gray-50">
          <button 
            className="w-full btn btn-success hover:scale-105 transition-transform duration-200"
            onClick={handleExpressInterest}
          >
            {currentRole === 'admin' ? 'Express Interest (Admin)' : 'Express Interest'}
          </button>
        </div>
      )}
      
      {currentRole === 'bank' && !selectedBank && (
        <div className="p-4 pt-3 border-t border-gray-100 bg-gray-50">
          <div className="text-center text-xs text-gray-500 italic py-2">
            Select a bank to express interest
          </div>
        </div>
      )}
    </div>
  )
}

export default IntentCard