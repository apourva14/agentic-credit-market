import React, { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { MESSAGE_TYPES } from '../../schemas/wfapSchemas'
import { 
  generateWFAPOfferLLM,
  generateWFAPCounterOfferLLM,
  generateWFAPStrategyLLM
} from '../../services/llmService'

const WFAPCompetition = ({ 
  intent, 
  onCompetitionComplete,
  onOfferReceived,
  competitionConfig = {}
}) => {
  const [competitionState, setCompetitionState] = useState('initializing')
  const [participatingBanks, setParticipatingBanks] = useState([])
  const [offers, setOffers] = useState([])
  const [counterOffers, setCounterOffers] = useState([])
  const [competitionResults, setCompetitionResults] = useState(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [currentRound, setCurrentRound] = useState(1)
  const [maxRounds] = useState(competitionConfig.maxRounds || 3)
  const [timeLimit] = useState(competitionConfig.timeLimit || 300000) // 5 minutes

  const bankConfigs = {
    'Wells Fargo': {
      name: 'Wells Fargo',
      riskTolerance: 'conservative',
      esgFocus: 'high',
      competitiveAggressiveness: 0.7,
      maxRate: 0.08,
      minESGScore: 70,
      specialties: ['ESG', 'Large Corporate', 'Technology']
    },
    'JPMorgan Chase': {
      name: 'JPMorgan Chase',
      riskTolerance: 'moderate',
      esgFocus: 'medium',
      competitiveAggressiveness: 0.8,
      maxRate: 0.075,
      minESGScore: 60,
      specialties: ['Corporate Banking', 'Investment Banking', 'Technology']
    },
    'Bank of America': {
      name: 'Bank of America',
      riskTolerance: 'moderate',
      esgFocus: 'high',
      competitiveAggressiveness: 0.75,
      maxRate: 0.085,
      minESGScore: 65,
      specialties: ['ESG', 'SME', 'Clean Technology']
    },
    'Citibank': {
      name: 'Citibank',
      riskTolerance: 'aggressive',
      esgFocus: 'medium',
      competitiveAggressiveness: 0.9,
      maxRate: 0.07,
      minESGScore: 50,
      specialties: ['International', 'Corporate', 'Innovation']
    },
    'Goldman Sachs': {
      name: 'Goldman Sachs',
      riskTolerance: 'aggressive',
      esgFocus: 'high',
      competitiveAggressiveness: 0.85,
      maxRate: 0.065,
      minESGScore: 80,
      specialties: ['Investment Banking', 'ESG', 'Technology', 'Innovation']
    }
  }

  useEffect(() => {
    if (intent && competitionState === 'initializing') {
      initializeCompetition()
    }
  }, [intent, competitionState])

  useEffect(() => {
    if (competitionState === 'active' && offers.length > 0) {
      const timer = setTimeout(() => {
        processCompetitionRound()
      }, timeLimit / maxRounds)
      
      return () => clearTimeout(timer)
    }
  }, [competitionState, offers, currentRound])

  const initializeCompetition = async () => {
    setIsProcessing(true)
    
    try {
      // Select participating banks based on intent and competition config
      const selectedBanks = selectParticipatingBanks(intent, competitionConfig)
      setParticipatingBanks(selectedBanks)
      
      // Generate initial offers from all banks
      const initialOffers = await generateInitialOffers(intent, selectedBanks)
      setOffers(initialOffers)
      
      setCompetitionState('active')
      setCurrentRound(1)
    } catch (error) {
      console.error('Competition initialization error:', error)
      setCompetitionState('error')
    } finally {
      setIsProcessing(false)
    }
  }

  const selectParticipatingBanks = (intent, config) => {
    const availableBanks = Object.keys(bankConfigs)
    const maxBanks = config.maxBanks || 3
    const minBanks = config.minBanks || 2
    
    // Filter banks based on intent requirements
    const suitableBanks = availableBanks.filter(bankName => {
      const bank = bankConfigs[bankName]
      
      // Check if bank meets minimum requirements
      if (intent.esgPriority === 'High' && bank.esgFocus !== 'high') return false
      if (intent.maxRate && bank.maxRate > intent.maxRate) return false
      if (intent.creditScore && intent.creditScore < 650) return false
      
      return true
    })
    
    // Select random subset
    const shuffled = suitableBanks.sort(() => 0.5 - Math.random())
    return shuffled.slice(0, Math.min(maxBanks, Math.max(minBanks, shuffled.length)))
  }

  const generateInitialOffers = async (intent, banks) => {
    const offers = []
    
    for (const bankName of banks) {
      try {
        const bankConfig = bankConfigs[bankName]
        const offer = await generateWFAPOfferLLM(intent, bankConfig, bankName)
        
        offers.push({
          ...offer.message,
          bankName,
          round: 1,
          timestamp: new Date().toISOString(),
          competitiveScore: calculateCompetitiveScore(offer.message, intent),
          processingResult: offer.processingResult
        })
      } catch (error) {
        console.error(`Error generating offer for ${bankName}:`, error)
      }
    }
    
    return offers.sort((a, b) => b.competitiveScore - a.competitiveScore)
  }

  const calculateCompetitiveScore = (offer, intent) => {
    let score = 0
    
    // Rate competitiveness (lower is better)
    const rateScore = Math.max(0, 100 - (offer.interestRate * 1000))
    score += rateScore * 0.4
    
    // Amount competitiveness
    const amountScore = Math.min(100, (offer.approvedAmount / intent.amount) * 100)
    score += amountScore * 0.2
    
    // ESG score
    const esgScore = offer.esgScore || 0
    score += esgScore * 0.2
    
    // Carbon adjustment (negative is better)
    const carbonScore = Math.max(0, 100 + (offer.carbonAdjustment || 0) * 1000)
    score += carbonScore * 0.1
    
    // Term flexibility
    const termScore = Math.min(100, (offer.term / intent.term) * 100)
    score += termScore * 0.1
    
    return Math.round(score)
  }

  const processCompetitionRound = async () => {
    if (currentRound >= maxRounds) {
      finalizeCompetition()
      return
    }

    setIsProcessing(true)
    
    try {
      // Generate counter-offers from banks
      const newCounterOffers = await generateCounterOffers()
      setCounterOffers(prev => [...prev, ...newCounterOffers])
      
      // Update offers with counter-offers
      const updatedOffers = await updateOffersWithCounters(newCounterOffers)
      setOffers(updatedOffers)
      
      setCurrentRound(prev => prev + 1)
    } catch (error) {
      console.error('Competition round error:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const generateCounterOffers = async () => {
    const counterOffers = []
    
    for (const offer of offers) {
      try {
        const bankConfig = bankConfigs[offer.bankName]
        const counterOffer = await generateWFAPCounterOfferLLM(
          offer, 
          intent, 
          bankConfig, 
          []
        )
        
        counterOffers.push({
          ...counterOffer.message,
          bankName: offer.bankName,
          round: currentRound + 1,
          timestamp: new Date().toISOString(),
          competitiveScore: calculateCompetitiveScore(counterOffer.message, intent),
          processingResult: counterOffer.processingResult,
          llmReasoning: counterOffer.llmReasoning
        })
      } catch (error) {
        console.error(`Error generating counter-offer for ${offer.bankName}:`, error)
      }
    }
    
    return counterOffers
  }

  const updateOffersWithCounters = async (counterOffers) => {
    return offers.map(offer => {
      const counterOffer = counterOffers.find(co => co.bankName === offer.bankName)
      if (counterOffer) {
        return {
          ...offer,
          ...counterOffer,
          round: counterOffer.round,
          timestamp: counterOffer.timestamp,
          competitiveScore: counterOffer.competitiveScore,
          isUpdated: true
        }
      }
      return offer
    }).sort((a, b) => b.competitiveScore - a.competitiveScore)
  }

  const finalizeCompetition = () => {
    const results = {
      winner: offers[0],
      allOffers: offers,
      counterOffers: counterOffers,
      totalRounds: currentRound,
      competitionDuration: Date.now() - (competitionState === 'active' ? Date.now() - timeLimit : 0),
      statistics: calculateCompetitionStatistics()
    }
    
    setCompetitionResults(results)
    setCompetitionState('completed')
    
    if (onCompetitionComplete) {
      onCompetitionComplete(results)
    }
  }

  const calculateCompetitionStatistics = () => {
    const allOffers = [...offers, ...counterOffers]
    
    return {
      totalOffers: allOffers.length,
      participatingBanks: participatingBanks.length,
      averageRate: allOffers.reduce((sum, offer) => sum + offer.interestRate, 0) / allOffers.length,
      bestRate: Math.min(...allOffers.map(offer => offer.interestRate)),
      averageESGScore: allOffers.reduce((sum, offer) => sum + (offer.esgScore || 0), 0) / allOffers.length,
      totalAmount: allOffers.reduce((sum, offer) => sum + offer.approvedAmount, 0),
      roundsCompleted: currentRound
    }
  }

  const handleAcceptOffer = (offer) => {
    if (onOfferReceived) {
      onOfferReceived(offer)
    }
    setCompetitionState('offer_accepted')
  }

  const getCompetitionStatus = () => {
    switch (competitionState) {
      case 'initializing': return 'Initializing competition...'
      case 'active': return `Round ${currentRound} of ${maxRounds} - ${participatingBanks.length} banks competing`
      case 'completed': return 'Competition completed'
      case 'offer_accepted': return 'Offer accepted'
      case 'error': return 'Competition error'
      default: return 'Unknown status'
    }
  }

  const getOfferRanking = (offer) => {
    const sortedOffers = [...offers].sort((a, b) => b.competitiveScore - a.competitiveScore)
    return sortedOffers.findIndex(o => o.messageId === offer.messageId) + 1
  }

  if (!intent) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
        <div className="text-4xl mb-4">🏦</div>
        <h3 className="text-lg font-semibold text-gray-700 mb-2">No Intent Selected</h3>
        <p className="text-gray-600">Select an intent to start a bank competition</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Competition Header */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Bank Competition</h2>
            <p className="text-gray-600">
              Intent #{intent.id} - {intent.companyName} • ${intent.amount?.toLocaleString()}
            </p>
            <p className="text-sm text-gray-500 mt-1">{getCompetitionStatus()}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
              🔒 WFAP 1.0
            </span>
            {competitionState === 'active' && (
              <div className="text-xs text-gray-500">
                Round {currentRound}/{maxRounds}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Participating Banks */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Participating Banks</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {participatingBanks.map(bankName => {
            const bank = bankConfigs[bankName]
            const bankOffers = offers.filter(offer => offer.bankName === bankName)
            const latestOffer = bankOffers[bankOffers.length - 1]
            
            return (
              <div key={bankName} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-gray-900">{bankName}</h4>
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                    {bank.riskTolerance}
                  </span>
                </div>
                <div className="text-sm text-gray-600 space-y-1">
                  <div>ESG Focus: {bank.esgFocus}</div>
                  <div>Competitiveness: {Math.round(bank.competitiveAggressiveness * 100)}%</div>
                  <div>Max Rate: {(bank.maxRate * 100).toFixed(1)}%</div>
                  {latestOffer && (
                    <div className="mt-2 pt-2 border-t border-gray-200">
                      <div className="font-medium text-green-600">
                        Score: {latestOffer.competitiveScore}
                      </div>
                      <div>Rate: {(latestOffer.interestRate * 100).toFixed(2)}%</div>
                      <div>Amount: ${latestOffer.approvedAmount?.toLocaleString()}</div>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Current Offers */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Offers</h3>
        {offers.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-2">⏳</div>
            <p>Generating offers...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {offers.map((offer, index) => (
              <div key={offer.messageId} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-semibold text-blue-600">
                      {getOfferRanking(offer)}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{offer.bankName}</h4>
                      <p className="text-sm text-gray-600">
                        Round {offer.round} • Score: {offer.competitiveScore}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-green-600">
                      {(offer.interestRate * 100).toFixed(2)}%
                    </div>
                    <div className="text-sm text-gray-600">
                      ${offer.approvedAmount?.toLocaleString()}
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Term:</span>
                    <div className="font-semibold">{offer.term} months</div>
                  </div>
                  <div>
                    <span className="text-gray-600">ESG Score:</span>
                    <div className="font-semibold text-green-600">{offer.esgScore || 'N/A'}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Carbon Adj:</span>
                    <div className="font-semibold text-blue-600">
                      {offer.carbonAdjustment ? (offer.carbonAdjustment * 100).toFixed(2) + '%' : 'N/A'}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-600">Status:</span>
                    <div className="font-semibold">
                      {offer.verification?.isValid ? '✅ Verified' : '❌ Failed'}
                    </div>
                  </div>
                </div>
                
                {offer.esgSummary && (
                  <div className="mt-3 text-sm text-gray-700">
                    <span className="font-medium">ESG Summary:</span>
                    <p className="mt-1">{offer.esgSummary}</p>
                  </div>
                )}
                
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => handleAcceptOffer(offer)}
                    className="btn btn-success btn-sm"
                    disabled={competitionState !== 'completed'}
                  >
                    Accept Offer
                  </button>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => console.log('View details:', offer)}
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Competition Results */}
      {competitionResults && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Competition Results</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {competitionResults.statistics.totalOffers}
              </div>
              <div className="text-sm text-gray-600">Total Offers</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {(competitionResults.statistics.averageRate * 100).toFixed(2)}%
              </div>
              <div className="text-sm text-gray-600">Average Rate</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {(competitionResults.statistics.bestRate * 100).toFixed(2)}%
              </div>
              <div className="text-sm text-gray-600">Best Rate</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {competitionResults.statistics.averageESGScore.toFixed(1)}
              </div>
              <div className="text-sm text-gray-600">Avg ESG Score</div>
            </div>
          </div>
        </div>
      )}

      {/* Processing Indicator */}
      {isProcessing && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-blue-800 font-medium">Processing competition round...</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default WFAPCompetition
