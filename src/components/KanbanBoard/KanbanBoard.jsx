import IntentCard from '../IntentCard/IntentCard'
import OngoingDealCard from '../OngoingDealCard/OngoingDealCard'
import ClosedDealCard from '../ClosedDealCard/ClosedDealCard'
import WFAPStatus from '../WFAPStatus/WFAPStatus'
import { canViewOngoingDeal } from '../../utils/rolePermissions'
import { MESSAGE_TYPES } from '../../schemas/wfapSchemas'

const KanbanBoard = ({
  intents,
  ongoingDeals,
  closedDeals,
  currentRole,
  selectedBank,
  permissions,
  onExpressInterest,
  onCloseDeal,
  onDeleteIntent,
  onOpenNegotiation
}) => {
  // Filter ongoing deals based on role permissions
  const visibleOngoingDeals = ongoingDeals.filter(deal => 
    canViewOngoingDeal(currentRole, selectedBank, deal)
  )

  // Group ongoing deals by intent for easier rendering
  const ongoingDealsByIntent = visibleOngoingDeals.reduce((acc, deal) => {
    if (!acc[deal.intentId]) {
      acc[deal.intentId] = []
    }
    acc[deal.intentId].push(deal)
    return acc
  }, {})

  const getColumnStats = () => {
    return {
      openIntents: intents.length,
      ongoingDeals: visibleOngoingDeals.length,
      closedDeals: closedDeals.length
    }
  }

  // Calculate WFAP compliance statistics
  const getWFAPStats = () => {
    const allIntents = [...intents, ...closedDeals]
    const wfapCompliantIntents = allIntents.filter(intent => 
      intent.messageType === MESSAGE_TYPES.INTENT && 
      intent.version === "WFAP/1.0" && 
      intent.signature && 
      intent.signatureCertId
    )
    
    const totalMessages = allIntents.length
    const wfapMessages = wfapCompliantIntents.length
    
    return {
      totalMessages,
      wfapMessages,
      complianceRate: totalMessages > 0 ? (wfapMessages / totalMessages) * 100 : 0,
      isEnabled: wfapMessages > 0
    }
  }

  const stats = getColumnStats()

  const EmptyState = ({ icon, title, subtitle }) => (
    <div className="flex flex-col items-center justify-center text-center py-12 px-4">
      <div className="text-6xl mb-4 opacity-60">{icon}</div>
      <h3 className="text-lg font-semibold text-gray-700 mb-2">{title}</h3>
      <p className="text-sm text-gray-500 max-w-xs leading-relaxed">{subtitle}</p>
    </div>
  )

  const wfapStats = getWFAPStats()

  return (
    <section className="py-6 bg-gray-50 min-h-[calc(100vh-140px)]">
      <div className="max-w-[1400px] mx-auto px-6">
        {/* WFAP Protocol Status */}
        {wfapStats.isEnabled && (
          <div className="mb-6">
            <WFAPStatus 
              isEnabled={wfapStats.isEnabled}
              version="WFAP/1.0"
              messageCount={wfapStats.wfapMessages}
              messages={[]} // Could be enhanced to pass actual messages
            />
          </div>
        )}

        {/* Kanban Board */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Open Intents Column */}
          <div className="card flex flex-col min-h-[600px] overflow-hidden animate-fade-in">
            <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-primary-50 to-primary-100">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-primary-800 flex items-center gap-3">
                  Open Intents
                  <span className="inline-flex items-center justify-center min-w-6 h-6 px-2 bg-white/80 text-primary-800 rounded-full text-xs font-semibold">
                    {stats.openIntents}
                  </span>
                </h2>
              </div>
              <p className="text-sm text-primary-700 mt-1">
                New credit requests awaiting bank interest
              </p>
            </div>
            
            <div className="flex-1 p-4 overflow-y-auto">
              {intents.length === 0 ? (
                <EmptyState
                  icon="📋"
                  title="No open intents"
                  subtitle={permissions.canCreateIntents 
                    ? "Create a new intent to get started" 
                    : "Waiting for new credit requests"
                  }
                />
              ) : (
                <div className="space-y-4">
                  {intents.map(intent => (
                    <IntentCard
                      key={intent.id}
                      intent={intent}
                      currentRole={currentRole}
                      selectedBank={selectedBank}
                      permissions={permissions}
                      onExpressInterest={onExpressInterest}
                      onDeleteIntent={onDeleteIntent}
                      hasOngoingDeals={ongoingDealsByIntent[intent.id]?.length > 0}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Ongoing Deals Column */}
          <div className="card flex flex-col min-h-[600px] overflow-hidden animate-fade-in">
            <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-warning-50 to-warning-100">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-warning-800 flex items-center gap-3">
                  Ongoing Deals
                  <span className="inline-flex items-center justify-center min-w-6 h-6 px-2 bg-white/80 text-warning-800 rounded-full text-xs font-semibold">
                    {stats.ongoingDeals}
                  </span>
                </h2>
              </div>
              <p className="text-sm text-warning-700 mt-1">
                Active negotiations between companies and banks
              </p>
            </div>
            
            <div className="flex-1 p-4 overflow-y-auto">
              {visibleOngoingDeals.length === 0 ? (
                <EmptyState
                  icon="🤝"
                  title="No ongoing deals"
                  subtitle={currentRole === 'bank' 
                    ? "Express interest in open intents to start negotiations"
                    : "Waiting for banks to express interest"
                  }
                />
              ) : (
                <div className="space-y-4">
                  {visibleOngoingDeals.map(deal => (
                    <OngoingDealCard
                      key={deal.id}
                      deal={deal}
                      currentRole={currentRole}
                      permissions={permissions}
                      onCloseDeal={onCloseDeal}
                      onOpenNegotiation={onOpenNegotiation}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Closed Deals Column */}
          <div className="card flex flex-col min-h-[600px] overflow-hidden animate-fade-in">
            <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-success-50 to-success-100">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-success-800 flex items-center gap-3">
                  Closed Deals
                  <span className="inline-flex items-center justify-center min-w-6 h-6 px-2 bg-white/80 text-success-800 rounded-full text-xs font-semibold">
                    {stats.closedDeals}
                  </span>
                </h2>
              </div>
              <p className="text-sm text-success-700 mt-1">
                Successfully completed credit agreements
              </p>
            </div>
            
            <div className="flex-1 p-4 overflow-y-auto">
              {closedDeals.length === 0 ? (
                <EmptyState
                  icon="✅"
                  title="No closed deals"
                  subtitle="Completed deals will appear here"
                />
              ) : (
                <div className="space-y-4">
                  {closedDeals.map(deal => (
                    <ClosedDealCard
                      key={deal.id}
                      deal={deal}
                      onOpenNegotiation={onOpenNegotiation}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Role-specific Information */}
        {currentRole === 'bank' && !selectedBank && (
          <div className="card bg-blue-50 border-blue-200 animate-slide-up">
            <div className="p-4 flex items-center gap-4">
              <div className="text-2xl">ℹ️</div>
              <div>
                <h3 className="font-semibold text-blue-900 mb-1">Bank Selection Required</h3>
                <p className="text-blue-800 text-sm">
                  Please select a bank from the header to view ongoing deals and express interest in open intents.
                </p>
              </div>
            </div>
          </div>
        )}

        {permissions.isReadOnly && (
          <div className="card bg-gray-50 border-gray-200 animate-slide-up">
            <div className="p-4 flex items-center gap-4">
              <div className="text-2xl">👁️</div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">View-Only Mode</h3>
                <p className="text-gray-700 text-sm">
                  You are in guest mode with read-only access. You can view all data but cannot perform actions.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

export default KanbanBoard