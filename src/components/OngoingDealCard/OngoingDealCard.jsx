import { format } from 'date-fns'
import { getChatSession, generateDealId, getNegotiationStatus } from '../../utils/chatStorage'

const OngoingDealCard = ({ deal, currentRole, permissions, onCloseDeal, onOpenNegotiation }) => {
  const formatTimestamp = (timestamp) => {
    return format(new Date(timestamp), 'MMM dd, yyyy HH:mm')
  }

  const handleCloseDeal = () => {
    if (permissions.canCloseDeal && !permissions.isReadOnly) {
      onCloseDeal(deal.intentId, deal.bankName)
    }
  }

  const handleCardClick = () => {
    if (onOpenNegotiation) {
      onOpenNegotiation(deal)
    }
  }

  const canCloseDeal = () => {
    return permissions.canCloseDeal && !permissions.isReadOnly
  }

  // Get negotiation status
  const dealId = generateDealId(deal.intentId, deal.bankName)
  const chatSession = getChatSession(dealId)
  const negotiationStatus = getNegotiationStatus(chatSession)

  return (
    <div 
      className="bg-white border border-warning-200 rounded-lg overflow-hidden shadow-soft hover:shadow-medium transition-all duration-200 hover:-translate-y-1 animate-slide-up cursor-pointer"
      onClick={handleCardClick}
    >
      {/* Card Header */}
      <div className="p-4 pb-3 border-b border-gray-100 bg-gradient-to-r from-warning-50/50 to-warning-100/50">
        <div className="flex flex-col">
          <div className="flex justify-between items-start">
            <h3 className="text-base font-bold text-warning-700">
              Intent #{deal.intentId}
            </h3>
            <div className="text-xs text-gray-500 font-medium">
              💬 Click to negotiate
            </div>
          </div>
          <span className="text-xs text-gray-600 font-medium mt-0.5">
            Started: {formatTimestamp(deal.timestamp)}
          </span>
        </div>
      </div>
      
      {/* Card Body */}
      <div className="p-4 space-y-4">
        <div className="text-lg font-semibold text-gray-900">
          {deal.companyName}
        </div>
        
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm font-semibold text-gray-600">Bank:</span>
            <span className="text-sm font-bold text-gray-900">{deal.bankName}</span>
          </div>
          
          {/* Negotiation Status */}
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-warning-100 text-warning-800 rounded-full text-xs font-semibold w-fit">
              <span>⏳</span>
              In Negotiation
            </div>
            
            {/* Dynamic Status Badge */}
            <div className="flex flex-col gap-1">
              <div className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                Status
              </div>
              <div className="inline-flex items-center gap-1.5 px-2 py-1 bg-blue-50 text-blue-700 rounded-md text-xs font-medium w-fit">
                <div className={`w-2 h-2 rounded-full ${
                  negotiationStatus.stage === 'Completed' ? 'bg-green-400' :
                  negotiationStatus.stage === 'Cancelled' ? 'bg-red-400' :
                  negotiationStatus.stage === 'Verifying' ? 'bg-yellow-400' :
                  'bg-blue-400'
                }`}></div>
                <span className="font-semibold">{negotiationStatus.stage}</span>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {negotiationStatus.description}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Card Actions */}
      {canCloseDeal() && (
        <div className="p-4 pt-3 border-t border-gray-100 bg-gradient-to-r from-warning-50/30 to-warning-100/30">
          <button 
            className="w-full btn btn-success hover:scale-105 transition-transform duration-200"
            onClick={(e) => {
              e.stopPropagation() // Prevent card click when clicking button
              handleCloseDeal()
            }}
          >
            Close Deal with {deal.bankName}
          </button>
        </div>
      )}
    </div>
  )
}

export default OngoingDealCard