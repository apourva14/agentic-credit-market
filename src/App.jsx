import { useState } from 'react'
import Header from './components/Header/Header'
import IntentForm from './components/IntentForm/IntentForm'
import KanbanBoard from './components/KanbanBoard/KanbanBoard'
import NegotiationDrawer from './components/NegotiationDrawer/NegotiationDrawer'
import { sampleData } from './data/sampleData'
import { rolePermissions } from './utils/rolePermissions'
import { v4 as uuidv4 } from 'uuid'

function App() {
  const [currentRole, setCurrentRole] = useState('company')
  const [selectedBank, setSelectedBank] = useState('')
  const [selectedCompany, setSelectedCompany] = useState('')
  const [intents, setIntents] = useState(sampleData.intents)
  const [ongoingDeals, setOngoingDeals] = useState(sampleData.ongoingDeals)
  const [closedDeals, setClosedDeals] = useState(sampleData.closedDeals)
  const [nextIntentId, setNextIntentId] = useState(1004)

  // Negotiation drawer state
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [selectedDeal, setSelectedDeal] = useState(null)
  const [selectedIntent, setSelectedIntent] = useState(null)

  const permissions = rolePermissions[currentRole] || {}

  const handleRoleChange = (role) => {
    setCurrentRole(role)
    setSelectedBank('')
    setSelectedCompany('')
    // Close drawer when role changes
    setIsDrawerOpen(false)
  }

  const handleBankSelection = (bank) => {
    setSelectedBank(bank)
  }

  const handleCompanySelection = (company) => {
    setSelectedCompany(company)
  }

  // Filter data based on selected company (only for company role, unless admin or guest)
  const getFilteredData = () => {
    if (currentRole === 'guest') {
      // Guest sees all data
      return {
        filteredIntents: intents,
        filteredOngoingDeals: ongoingDeals,
        filteredClosedDeals: closedDeals
      }
    }

    if (currentRole === 'company' && selectedCompany) {
      // Company sees only their own data
      return {
        filteredIntents: intents.filter(intent => intent.companyName === selectedCompany),
        filteredOngoingDeals: ongoingDeals.filter(deal => deal.companyName === selectedCompany),
        filteredClosedDeals: closedDeals.filter(deal => deal.companyName === selectedCompany)
      }
    }

    // Admin and bank roles see all data, company without selection sees all
    return {
      filteredIntents: intents,
      filteredOngoingDeals: ongoingDeals,
      filteredClosedDeals: closedDeals
    }
  }

  const { filteredIntents, filteredOngoingDeals, filteredClosedDeals } = getFilteredData()

  const handleCreateIntent = (intentData) => {
    const newIntent = {
      id: nextIntentId,
      ...intentData,
      status: 'open',
      timestamp: new Date().toISOString()
    }
    
    setIntents(prev => [...prev, newIntent])
    setNextIntentId(prev => prev + 1)
  }

  const handleExpressInterest = (intentId, bankName) => {
    const intent = intents.find(i => i.id === intentId)
    if (!intent) return

    const existingDeal = ongoingDeals.find(
      deal => deal.intentId === intentId && deal.bankName === bankName
    )
    
    if (existingDeal) return // Bank already expressed interest

    const newDeal = {
      id: uuidv4(),
      intentId,
      companyName: intent.companyName,
      bankName,
      timestamp: new Date().toISOString()
    }

    setOngoingDeals(prev => [...prev, newDeal])
  }

  const handleCloseDeal = (intentId, winningBankName) => {
    const intent = intents.find(i => i.id === intentId)
    if (!intent) return

    // Create closed deal with complete intent data for chat history
    const closedDeal = {
      id: intentId,
      companyName: intent.companyName,
      winningBank: winningBankName,
      amount: intent.amount,
      duration: intent.duration,
      purpose: intent.purpose,
      timestamp: new Date().toISOString()
    }

    // Remove intent from open intents
    setIntents(prev => prev.filter(i => i.id !== intentId))
    
    // Remove all ongoing deals for this intent
    setOngoingDeals(prev => prev.filter(deal => deal.intentId !== intentId))
    
    // Add to closed deals
    setClosedDeals(prev => [...prev, closedDeal])
  }

  const handleDeleteIntent = (intentId) => {
    if (!permissions.canDelete) return

    setIntents(prev => prev.filter(i => i.id !== intentId))
    setOngoingDeals(prev => prev.filter(deal => deal.intentId !== intentId))
  }

  // Negotiation drawer handlers
  const handleOpenNegotiation = (deal) => {
    // Find the corresponding intent for this deal
    let intent = intents.find(i => i.id === deal.intentId)
    
    // If not found in open intents, check closed deals and reconstruct intent data
    if (!intent) {
      const closedDeal = closedDeals.find(i => i.id === deal.intentId)
      if (closedDeal) {
        // Reconstruct intent data from closed deal for chat history viewing
        intent = {
          id: closedDeal.id,
          companyName: closedDeal.companyName,
          amount: closedDeal.amount,
          duration: closedDeal.duration || 12, // Use stored duration or default
          purpose: closedDeal.purpose || "Credit facility", // Use stored purpose or default
          status: "closed",
          timestamp: closedDeal.timestamp
        }
      }
    }

    if (!intent) {
      console.error('Intent not found for deal:', deal)
      return
    }

    setSelectedDeal(deal)
    setSelectedIntent(intent)
    setIsDrawerOpen(true)
  }

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false)
    setSelectedDeal(null)
    setSelectedIntent(null)
  }

  const handleDealAccepted = (intentId, winningBankName) => {
    handleCloseDeal(intentId, winningBankName)
  }

  const handleDealCancelled = (intentId) => {
    // Remove all ongoing deals for this intent
    setOngoingDeals(prev => prev.filter(deal => deal.intentId !== intentId))
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        currentRole={currentRole}
        selectedBank={selectedBank}
        selectedCompany={selectedCompany}
        onRoleChange={handleRoleChange}
        onBankSelection={handleBankSelection}
        onCompanySelection={handleCompanySelection}
        permissions={permissions}
      />
      
      {permissions.canCreateIntents && (
        <IntentForm
          onCreateIntent={handleCreateIntent}
          currentRole={currentRole}
          selectedCompany={selectedCompany}
        />
      )}
      
      <KanbanBoard
        intents={filteredIntents}
        ongoingDeals={filteredOngoingDeals}
        closedDeals={filteredClosedDeals}
        currentRole={currentRole}
        selectedBank={selectedBank}
        selectedCompany={selectedCompany}
        permissions={permissions}
        onExpressInterest={handleExpressInterest}
        onCloseDeal={handleCloseDeal}
        onDeleteIntent={handleDeleteIntent}
        onOpenNegotiation={handleOpenNegotiation}
      />

      {/* Negotiation Drawer */}
      <NegotiationDrawer
        isOpen={isDrawerOpen}
        onClose={handleCloseDrawer}
        deal={selectedDeal}
        intent={selectedIntent}
        currentRole={currentRole}
        selectedBank={selectedBank}
        selectedCompany={selectedCompany}
        onDealAccepted={handleDealAccepted}
        onDealCancelled={handleDealCancelled}
      />
    </div>
  )
}

export default App