import { useState, useRef, useEffect } from 'react'
import Header from './components/Header/Header'
import IntentForm from './components/IntentForm/IntentForm'
import KanbanBoard from './components/KanbanBoard/KanbanBoard'
import NegotiationDrawer from './components/NegotiationDrawer/NegotiationDrawer'
import MarketActivityLog from './components/MarketActivityLog/MarketActivityLog'
import { sampleData, availableBanks, availableCompanies } from './data/sampleData'
import { bankConfigs } from './data/bankConfigs'
import { companyConfigs, generateCompanyConfig } from './data/companyConfigs'
import { rolePermissions } from './utils/rolePermissions'
import { 
  verifyIdentity, 
  generateOfferLLM, 
  evaluateAllOffersLLM,
  evaluateOfferLLM,
  generateCounterOfferLLM 
} from './services/llmService'
import { 
  addMessageToSession, 
  updateSessionStatus, 
  generateDealId 
} from './utils/chatStorage'
import { v4 as uuidv4 } from 'uuid'

function App() {
  const [currentRole, setCurrentRole] = useState('company')
  const [selectedBank, setSelectedBank] = useState('')
  const [selectedCompany, setSelectedCompany] = useState('')
  const [intents, setIntents] = useState(sampleData.intents)
  const [ongoingDeals, setOngoingDeals] = useState(sampleData.ongoingDeals)
  const [closedDeals, setClosedDeals] = useState(sampleData.closedDeals)
  const [nextIntentId, setNextIntentId] = useState(1004)
  const nextIdRef = useRef(1004)

  // Negotiation drawer state
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [selectedDeal, setSelectedDeal] = useState(null)
  const [selectedIntent, setSelectedIntent] = useState(null)

  // Market simulation state
  const [isMarketRunning, setIsMarketRunning] = useState(false)
  const [activityLog, setActivityLog] = useState([])
  const [simulationAbortController, setSimulationAbortController] = useState(null)

  const permissions = rolePermissions[currentRole] || {}

  // Initialize nextIdRef with highest existing ID + 1 to avoid collisions
  useEffect(() => {
    const allIds = [...intents.map(i => i.id), ...closedDeals.map(d => d.id)].filter(id => typeof id === 'number')
    const maxId = allIds.length ? Math.max(...allIds) : 1003
    nextIdRef.current = Math.max(nextIdRef.current, maxId + 1)
  }, [intents, closedDeals])

  // Add activity to log
  const addActivity = (message, type = 'info') => {
    const activity = {
      id: Date.now() + Math.random(),
      message,
      type, // 'info', 'success', 'warning', 'error'
      timestamp: new Date().toISOString()
    }
    setActivityLog(prev => [activity, ...prev.slice(0, 49)]) // Keep last 50 activities
  }

  // Clear activity log
  const clearActivityLog = () => {
    setActivityLog([])
  }

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
    // Atomic ID generation using ref to avoid race conditions during rapid creation
    const newId = nextIdRef.current
    nextIdRef.current += 1

    const newIntent = {
      id: newId,
      ...intentData,
      status: 'open',
      timestamp: new Date().toISOString()
    }

    setIntents(prev => [...prev, newIntent])
    // Keep state in sync for any UI that reads nextIntentId
    setNextIntentId(prev => Math.max(prev, nextIdRef.current))
    return newIntent
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
    return newDeal
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
        // Update the deal object to include winningBank for closed deals
        deal = {
          ...deal,
          winningBank: closedDeal.winningBank
        }
      }
    }

    if (!intent) {
      // Intent not found for deal
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

  // Market Simulation Functions
  const simulateMarketActivity = async () => {
    if (isMarketRunning) return
    
    setIsMarketRunning(true)
    clearActivityLog()
    
    const abortController = new AbortController()
    setSimulationAbortController(abortController)
    
    addActivity("🚀 Market simulation started!", 'success')
    
    try {
      // Step 1: Create sample intents
      await simulateIntentCreation(abortController.signal)
      
      // Step 2: Banks express interest in all intents
      await simulateBankInterest(abortController.signal)
      
      // Step 3: Identity verification for all deals
      await simulateIdentityVerification(abortController.signal)
      
      // Step 4: Banks provide initial offers
      await simulateBankOffers(abortController.signal)
      
      // Step 5: Companies evaluate all offers and make decisions
      await simulateCompanyDecisions(abortController.signal)
      
      if (!abortController.signal.aborted) {
        addActivity("✅ Market simulation completed successfully!", 'success')
      }
    } catch (error) {
      if (!abortController.signal.aborted) {
        // Market simulation error
        addActivity(`❌ Simulation error: ${error.message}`, 'error')
      }
    } finally {
      if (!abortController.signal.aborted) {
        setIsMarketRunning(false)
        setSimulationAbortController(null)
      }
    }
  }

  const stopMarketSimulation = () => {
    if (simulationAbortController) {
      simulationAbortController.abort()
      setSimulationAbortController(null)
    }
    setIsMarketRunning(false)
    addActivity("⏹️ Market simulation stopped", 'warning')
  }

  // Step 1: Create sample intents
  const simulateIntentCreation = async (signal) => {
    addActivity("📝 Creating sample intents from companies...", 'info')
    
    const sampleIntents = [
      {
        companyName: "TechStart Solutions",
        amount: 1200000,
        duration: 15,
        purpose: "Cloud infrastructure expansion and AI development platform",
        industry: "Technology",
        creditScore: 720,
        esgProfile: "Standard",
        annualRevenue: 3500000
      },
      {
        companyName: "Green Energy Corp", 
        amount: 2500000,
        duration: 36,
        purpose: "Solar panel manufacturing facility and renewable energy storage",
        industry: "Renewable Energy",
        creditScore: 780,
        esgProfile: "CarbonNeutralCertified",
        excludeHighCarbon: true,
        greenCertification: "GreenLoanPrinciples",
        annualRevenue: 18000000
      },
      {
        companyName: "HealthTech Innovations",
        amount: 900000,
        duration: 24,
        purpose: "Medical device development and FDA approval process",
        industry: "Healthcare",
        creditScore: 690,
        esgProfile: "ISO14001Certified",
        excludeHighCarbon: true,
        greenCertification: "SustainabilityLinkedLoan",
        annualRevenue: 6500000
      }
    ]

    for (const intentData of sampleIntents) {
      if (signal.aborted) return
      
      const newIntent = handleCreateIntent(intentData)
      addActivity(`✨ ${intentData.companyName} created intent #${newIntent.id} for $${intentData.amount.toLocaleString()}`, 'success')
      
      // Wait before creating next intent
      await new Promise(resolve => setTimeout(resolve, 1500))
    }
  }

  // Step 2: Banks express interest
  const simulateBankInterest = async (signal) => {
    addActivity("🏦 Banks evaluating and expressing interest in intents...", 'info')
    
    // Get current open intents
    const openIntents = intents.filter(intent => intent.status === 'open')
    
    for (const intent of openIntents) {
      if (signal.aborted) return
      
      addActivity(`🔍 Banks reviewing Intent #${intent.id} from ${intent.companyName}`, 'info')
      
      // Each bank expresses interest (simulate some delay between each)
      for (const bank of availableBanks) {
        if (signal.aborted) return
        
        const newDeal = handleExpressInterest(intent.id, bank)
        if (newDeal) {
          addActivity(`💼 ${bank} expressed interest in ${intent.companyName}'s Intent #${intent.id}`, 'info')
        }
        
        // Short delay between banks
        await new Promise(resolve => setTimeout(resolve, 800))
      }
      
      // Delay before moving to next intent
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
  }

  // Step 3: Identity verification
  const simulateIdentityVerification = async (signal) => {
    addActivity("🔐 Conducting identity verification for all deals...", 'info')
    
    // Get all current ongoing deals
    const currentDeals = [...ongoingDeals]
    
    for (const deal of currentDeals) {
      if (signal.aborted) return
      
      try {
        const intent = intents.find(i => i.id === deal.intentId)
        if (!intent) continue
        
        addActivity(`🔍 ${deal.bankName} verifying identity of ${deal.companyName}`, 'info')
        
        const isAuthentic = await verifyIdentity(intent.companyName, intent)
        const dealId = generateDealId(deal.intentId, deal.bankName)
        
        if (isAuthentic) {
          addMessageToSession(dealId, {
            sender: 'system',
            content: `✅ Identity verification successful for ${intent.companyName}. ${deal.bankName} can now proceed with the loan offer.`,
            type: 'verification_success'
          })
          updateSessionStatus(dealId, 'verified')
          addActivity(`✅ ${deal.bankName} successfully verified ${deal.companyName}'s identity`, 'success')
        } else {
          addMessageToSession(dealId, {
            sender: 'system',
            content: `❌ Identity verification failed for ${intent.companyName}. This deal has been cancelled.`,
            type: 'verification_failed'
          })
          updateSessionStatus(dealId, 'cancelled')
          handleDealCancelled(deal.intentId)
          addActivity(`❌ ${deal.bankName} failed to verify ${deal.companyName}'s identity - deal cancelled`, 'error')
        }
      } catch (error) {
        addActivity(`⚠️ Identity verification failed for ${deal.bankName} - ${deal.companyName}: ${error.message}`, 'error')
      }
      
      // Short delay between verifications
      await new Promise(resolve => setTimeout(resolve, 1200))
    }
  }

  // Step 4: Banks provide offers
  const simulateBankOffers = async (signal) => {
    addActivity("💰 Banks generating loan offers for verified deals...", 'info')
    
    // Get all verified deals
    const verifiedDeals = ongoingDeals.filter(deal => {
      const dealId = generateDealId(deal.intentId, deal.bankName)
      // This would need to check the actual chat session status
      return true // For simulation, assume all current deals are verified
    })
    
    for (const deal of verifiedDeals) {
      if (signal.aborted) return
      
      try {
        const intent = intents.find(i => i.id === deal.intentId)
        if (!intent) continue
        
        const bankConfig = bankConfigs[deal.bankName]
        if (!bankConfig) continue
        
        addActivity(`📊 ${deal.bankName} generating offer for ${deal.companyName}'s Intent #${deal.intentId}`, 'info')
        
        const offer = await generateOfferLLM(intent, bankConfig, deal.bankName)
        const dealId = generateDealId(deal.intentId, deal.bankName)
        
        addMessageToSession(dealId, {
          sender: deal.bankName,
          content: offer.content,
          type: 'offer'
        })
        
        updateSessionStatus(dealId, 'in_progress')
        
        addActivity(`💡 ${deal.bankName} provided offer to ${deal.companyName} for Intent #${deal.intentId}`, 'success')
      } catch (error) {
        addActivity(`⚠️ ${deal.bankName} failed to generate offer: ${error.message}`, 'error')
      }
      
      // Delay between offers
      await new Promise(resolve => setTimeout(resolve, 2000))
    }
  }

  // Step 5: Company decision making
  const simulateCompanyDecisions = async (signal) => {
    addActivity("🤔 Companies evaluating all offers and making decisions...", 'info')
    
    // Group deals by intent (company)
    const dealsByIntent = {}
    ongoingDeals.forEach(deal => {
      if (!dealsByIntent[deal.intentId]) {
        dealsByIntent[deal.intentId] = []
      }
      dealsByIntent[deal.intentId].push(deal)
    })
    
    for (const [intentId, deals] of Object.entries(dealsByIntent)) {
      if (signal.aborted) return
      
      const intent = intents.find(i => i.id === parseInt(intentId))
      if (!intent) continue
      
      const companyConfig = companyConfigs[intent.companyName] || generateCompanyConfig(intent.companyName, intent)
      
      try {
        addActivity(`🎯 ${intent.companyName} evaluating ${deals.length} offers for Intent #${intentId}`, 'info')
        
        // Collect all bank offers
        const bankOffers = []
        for (const deal of deals) {
          const dealId = generateDealId(deal.intentId, deal.bankName)
          // For simulation, we'll create mock offers based on bank configs
          const bankConfig = bankConfigs[deal.bankName]
          if (bankConfig) {
            try {
              const offer = await generateOfferLLM(intent, bankConfig, deal.bankName)
              bankOffers.push({
                bankName: deal.bankName,
                content: offer.content,
                offer: offer.offer
              })
            } catch (error) {
              addActivity(`⚠️ Failed to get offer from ${deal.bankName}: ${error.message}`, 'error')
            }
          }
        }
        
        if (bankOffers.length === 0) continue
        
        // Company evaluates all offers
        const evaluation = await evaluateAllOffersLLM(intent, bankOffers, companyConfig)
        
        addActivity(`📋 ${intent.companyName} completed evaluation: ${evaluation.decisions.accept ? 'Accepting' : 'Negotiating with'} ${evaluation.decisions.accept || evaluation.decisions.negotiate.join(', ')}`, 'info')
        
        // Execute decisions
        if (evaluation.decisions.accept) {
          // Accept the chosen offer
          handleCloseDeal(intentId, evaluation.decisions.accept)
          addActivity(`🎉 ${intent.companyName} accepted offer from ${evaluation.decisions.accept} and closed the deal!`, 'success')
        } else {
          // Cancel deals with rejected banks
          for (const bankToReject of evaluation.decisions.reject) {
            const dealToCancel = deals.find(d => d.bankName === bankToReject)
            if (dealToCancel) {
              setOngoingDeals(prev => prev.filter(d => d.id !== dealToCancel.id))
              addActivity(`❌ ${intent.companyName} rejected ${bankToReject}'s offer`, 'warning')
            }
          }
          
          // Continue negotiation with selected banks (simulate one more round)
          for (const bankToNegotiate of evaluation.decisions.negotiate) {
            try {
              const deal = deals.find(d => d.bankName === bankToNegotiate)
              if (deal) {
                const dealId = generateDealId(deal.intentId, deal.bankName)
                
                // Company sends counter-offer
                addMessageToSession(dealId, {
                  sender: intent.companyName,
                  content: `We appreciate your offer. We'd like to discuss adjusting the terms to better align with our requirements.`,
                  type: 'counter_offer'
                })
                
                addActivity(`💬 ${intent.companyName} sent counter-offer to ${bankToNegotiate}`, 'info')
                
                // After a short delay, bank responds with final offer
                await new Promise(resolve => setTimeout(resolve, 1500))
                
                if (!signal.aborted) {
                  const bankConfig = bankConfigs[bankToNegotiate]
                  const conversation = [
                    { sender: bankToNegotiate, content: bankOffers.find(o => o.bankName === bankToNegotiate)?.content || "Initial offer" },
                    { sender: intent.companyName, content: "Counter-offer request" }
                  ]
                  
                  const counterOffer = await generateCounterOfferLLM(conversation, bankConfig, bankToNegotiate, intent)
                  
                  addMessageToSession(dealId, {
                    sender: bankToNegotiate,
                    content: counterOffer.content,
                    type: 'counter_offer'
                  })
                  
                  addActivity(`🔄 ${bankToNegotiate} provided counter-offer to ${intent.companyName}`, 'info')
                  
                  // Company makes final decision (simulate acceptance for first negotiating bank)
                  if (bankToNegotiate === evaluation.decisions.negotiate[0]) {
                    await new Promise(resolve => setTimeout(resolve, 1000))
                    
                    if (!signal.aborted) {
                      handleCloseDeal(intentId, bankToNegotiate)
                      addActivity(`🏆 ${intent.companyName} accepted final offer from ${bankToNegotiate} - Deal Closed!`, 'success')
                    }
                  } else {
                    // Reject other negotiating banks
                    setOngoingDeals(prev => prev.filter(d => d.id !== deal.id))
                    addActivity(`📝 ${intent.companyName} declined final offer from ${bankToNegotiate}`, 'warning')
                  }
                }
              }
            } catch (error) {
              addActivity(`⚠️ Negotiation error with ${bankToNegotiate}: ${error.message}`, 'error')
            }
          }
        }
      } catch (error) {
        addActivity(`❌ ${intent.companyName} failed to evaluate offers: ${error.message}`, 'error')
      }
      
      // Delay before next company
      await new Promise(resolve => setTimeout(resolve, 2000))
    }
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
        isMarketRunning={isMarketRunning}
        onStartMarket={simulateMarketActivity}
        onStopMarket={stopMarketSimulation}
      />
      
      {permissions.canCreateIntents && (
        <IntentForm
          onCreateIntent={handleCreateIntent}
          currentRole={currentRole}
          selectedCompany={selectedCompany}
        />
      )}

      {/* Market Activity Log */}
      <MarketActivityLog 
        activities={activityLog}
        onClear={clearActivityLog}
        isVisible={currentRole === 'guest'}
      />
      
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