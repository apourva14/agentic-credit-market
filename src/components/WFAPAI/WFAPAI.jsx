import React, { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { MESSAGE_TYPES } from '../../schemas/wfapSchemas'
import { 
  analyzeWFAPMessageLLM,
  generateWFAPStrategyLLM,
  generateWFAPCounterOfferLLM,
  generateWFAPAcceptanceLLM,
  generateWFAPRejectionLLM
} from '../../services/llmService'

const WFAPAI = ({ 
  intent,
  offers = [],
  negotiationHistory = [],
  onAIInsight,
  onPredictionGenerated,
  onRecommendationProvided
}) => {
  const [aiInsights, setAiInsights] = useState(null)
  const [predictions, setPredictions] = useState(null)
  const [recommendations, setRecommendations] = useState([])
  const [aiModels, setAiModels] = useState([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [selectedModel, setSelectedModel] = useState('comprehensive')
  const [aiPerformance, setAiPerformance] = useState(null)

  useEffect(() => {
    if (intent && offers.length > 0) {
      performAIAnalysis()
    }
  }, [intent, offers, selectedModel])

  const performAIAnalysis = async () => {
    setIsAnalyzing(true)
    
    try {
      // Initialize AI models
      await initializeAIModels()
      
      // Generate comprehensive AI insights
      const insights = await generateAIInsights()
      setAiInsights(insights)
      
      // Generate predictions
      const predictions = await generatePredictions()
      setPredictions(predictions)
      
      // Generate recommendations
      const recommendations = await generateRecommendations()
      setRecommendations(recommendations)
      
      // Calculate AI performance metrics
      const performance = await calculateAIPerformance()
      setAiPerformance(performance)
      
      if (onAIInsight) {
        onAIInsight(insights)
      }
      
      if (onPredictionGenerated) {
        onPredictionGenerated(predictions)
      }
      
      if (onRecommendationProvided) {
        onRecommendationProvided(recommendations)
      }
    } catch (error) {
      console.error('AI analysis error:', error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const initializeAIModels = async () => {
    // Simulate AI model initialization
    await new Promise(resolve => setTimeout(resolve, 500))
    
    const models = [
      {
        id: 'comprehensive',
        name: 'Comprehensive Analysis Model',
        description: 'Multi-faceted analysis combining all AI capabilities',
        accuracy: 94.2,
        lastTrained: '2024-01-15',
        status: 'Active',
        capabilities: ['Risk Assessment', 'ESG Analysis', 'Market Prediction', 'Negotiation Strategy']
      },
      {
        id: 'risk-assessment',
        name: 'Risk Assessment Model',
        description: 'Specialized in credit and market risk evaluation',
        accuracy: 96.8,
        lastTrained: '2024-01-10',
        status: 'Active',
        capabilities: ['Credit Risk', 'Market Risk', 'Liquidity Risk', 'Operational Risk']
      },
      {
        id: 'esg-predictor',
        name: 'ESG Impact Predictor',
        description: 'Predicts environmental, social, and governance impacts',
        accuracy: 91.5,
        lastTrained: '2024-01-12',
        status: 'Active',
        capabilities: ['Environmental Impact', 'Social Impact', 'Governance Score', 'Sustainability Metrics']
      },
      {
        id: 'negotiation-ai',
        name: 'Negotiation Strategy AI',
        description: 'Advanced negotiation strategy and tactics generator',
        accuracy: 89.7,
        lastTrained: '2024-01-08',
        status: 'Active',
        capabilities: ['Strategy Generation', 'Counter-offer Optimization', 'Tactical Recommendations', 'Outcome Prediction']
      },
      {
        id: 'market-analyzer',
        name: 'Market Conditions Analyzer',
        description: 'Analyzes market conditions and economic factors',
        accuracy: 87.3,
        lastTrained: '2024-01-05',
        status: 'Active',
        capabilities: ['Interest Rate Prediction', 'Market Volatility', 'Economic Indicators', 'Sector Analysis']
      }
    ]
    
    setAiModels(models)
  }

  const generateAIInsights = async () => {
    // Simulate comprehensive AI analysis
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    const insights = {
      riskAssessment: {
        creditRisk: calculateCreditRisk(intent, offers),
        marketRisk: calculateMarketRisk(intent, offers),
        liquidityRisk: calculateLiquidityRisk(intent, offers),
        operationalRisk: calculateOperationalRisk(intent, offers),
        overallRiskScore: 0
      },
      marketAnalysis: {
        interestRateTrend: predictInterestRateTrend(),
        marketVolatility: calculateMarketVolatility(),
        sectorPerformance: analyzeSectorPerformance(intent.industry),
        economicIndicators: getEconomicIndicators(),
        marketSentiment: analyzeMarketSentiment()
      },
      negotiationIntelligence: {
        optimalStrategy: determineOptimalStrategy(intent, offers),
        leveragePoints: identifyLeveragePoints(intent, offers),
        negotiationTactics: generateNegotiationTactics(intent, offers),
        successProbability: calculateSuccessProbability(intent, offers),
        recommendedApproach: getRecommendedApproach(intent, offers)
      },
      esgIntelligence: {
        esgTrends: analyzeESGTrends(intent, offers),
        sustainabilityImpact: calculateSustainabilityImpact(intent, offers),
        carbonFootprintPrediction: predictCarbonFootprint(intent, offers),
        esgOpportunities: identifyESGOpportunities(intent, offers),
        regulatoryCompliance: assessRegulatoryCompliance(intent, offers)
      },
      behavioralAnalysis: {
        counterpartyBehavior: analyzeCounterpartyBehavior(offers),
        negotiationPatterns: identifyNegotiationPatterns(negotiationHistory),
        decisionMakingStyle: analyzeDecisionMakingStyle(intent, offers),
        communicationPreferences: identifyCommunicationPreferences(offers),
        trustIndicators: assessTrustIndicators(offers)
      }
    }
    
    // Calculate overall risk score
    insights.riskAssessment.overallRiskScore = (
      insights.riskAssessment.creditRisk +
      insights.riskAssessment.marketRisk +
      insights.riskAssessment.liquidityRisk +
      insights.riskAssessment.operationalRisk
    ) / 4
    
    return insights
  }

  const generatePredictions = async () => {
    // Simulate prediction generation
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const predictions = {
      shortTerm: {
        interestRateChange: predictInterestRateChange(30), // 30 days
        marketVolatility: predictMarketVolatility(30),
        dealSuccessProbability: predictDealSuccess(30),
        esgScoreImprovement: predictESGImprovement(30),
        negotiationOutcome: predictNegotiationOutcome(30)
      },
      mediumTerm: {
        interestRateChange: predictInterestRateChange(90), // 90 days
        marketVolatility: predictMarketVolatility(90),
        dealSuccessProbability: predictDealSuccess(90),
        esgScoreImprovement: predictESGImprovement(90),
        negotiationOutcome: predictNegotiationOutcome(90)
      },
      longTerm: {
        interestRateChange: predictInterestRateChange(365), // 1 year
        marketVolatility: predictMarketVolatility(365),
        dealSuccessProbability: predictDealSuccess(365),
        esgScoreImprovement: predictESGImprovement(365),
        negotiationOutcome: predictNegotiationOutcome(365)
      },
      confidence: {
        shortTerm: 0.85,
        mediumTerm: 0.72,
        longTerm: 0.58
      }
    }
    
    return predictions
  }

  const generateRecommendations = async () => {
    // Simulate recommendation generation
    await new Promise(resolve => setTimeout(resolve, 800))
    
    const recommendations = [
      {
        id: 1,
        category: 'Strategy',
        priority: 'High',
        title: 'Leverage ESG Credentials for Better Terms',
        description: 'Your strong ESG profile can be used to negotiate 0.2-0.5% better interest rates',
        impact: 'High',
        confidence: 0.89,
        implementation: 'Immediate',
        expectedBenefit: '$50,000 - $125,000 savings over term'
      },
      {
        id: 2,
        category: 'Risk',
        priority: 'Medium',
        title: 'Consider Interest Rate Hedging',
        description: 'Market volatility suggests implementing interest rate hedging strategies',
        impact: 'Medium',
        confidence: 0.76,
        implementation: 'Within 2 weeks',
        expectedBenefit: 'Risk reduction of 15-25%'
      },
      {
        id: 3,
        category: 'Negotiation',
        priority: 'High',
        title: 'Counter-offer with ESG Premium',
        description: 'Propose counter-offer emphasizing environmental benefits for rate reduction',
        impact: 'High',
        confidence: 0.82,
        implementation: 'Immediate',
        expectedBenefit: '0.3% rate reduction potential'
      },
      {
        id: 4,
        category: 'Market',
        priority: 'Low',
        title: 'Monitor Economic Indicators',
        description: 'Track key economic indicators for optimal timing of final decision',
        impact: 'Low',
        confidence: 0.68,
        implementation: 'Ongoing',
        expectedBenefit: 'Better timing and terms'
      }
    ]
    
    return recommendations
  }

  const calculateAIPerformance = async () => {
    // Simulate AI performance calculation
    await new Promise(resolve => setTimeout(resolve, 300))
    
    return {
      overallAccuracy: 92.4,
      predictionAccuracy: 89.7,
      recommendationSuccess: 85.3,
      responseTime: 1.2, // seconds
      modelUptime: 99.8,
      userSatisfaction: 4.6,
      lastUpdated: new Date().toISOString(),
      improvements: [
        'Increased prediction accuracy by 3.2% this month',
        'Reduced response time by 0.3 seconds',
        'Improved recommendation relevance by 8.1%'
      ]
    }
  }

  // Helper functions for AI analysis
  const calculateCreditRisk = (intent, offers) => {
    const baseScore = intent.creditScore || 700
    const amountRisk = Math.min(100, (intent.amount / 10000000) * 20) // Higher amount = higher risk
    const industryRisk = getIndustryRisk(intent.industry)
    return Math.min(100, baseScore - amountRisk - industryRisk)
  }

  const calculateMarketRisk = (intent, offers) => {
    const volatility = Math.random() * 30 + 20 // 20-50% volatility
    const interestRateRisk = Math.random() * 20 + 10 // 10-30% interest rate risk
    return (volatility + interestRateRisk) / 2
  }

  const calculateLiquidityRisk = (intent, offers) => {
    const amount = intent.amount || 0
    const liquidityScore = Math.max(0, 100 - (amount / 1000000) * 5)
    return liquidityScore
  }

  const calculateOperationalRisk = (intent, offers) => {
    const industryRisk = getIndustryRisk(intent.industry)
    const companySizeRisk = intent.annualRevenue ? Math.max(0, 50 - (intent.annualRevenue / 1000000)) : 30
    return (industryRisk + companySizeRisk) / 2
  }

  const getIndustryRisk = (industry) => {
    const risks = {
      'Clean Technology': 15,
      'Technology': 25,
      'Healthcare': 20,
      'Finance': 30,
      'Manufacturing': 40,
      'Energy': 50
    }
    return risks[industry] || 35
  }

  const predictInterestRateTrend = () => {
    const trends = ['Rising', 'Stable', 'Declining']
    const probabilities = [0.4, 0.35, 0.25]
    return { trend: trends[0], probability: probabilities[0] }
  }

  const calculateMarketVolatility = () => {
    return Math.random() * 20 + 15 // 15-35% volatility
  }

  const analyzeSectorPerformance = (industry) => {
    const performance = {
      'Clean Technology': 95,
      'Technology': 85,
      'Healthcare': 80,
      'Finance': 75,
      'Manufacturing': 65,
      'Energy': 55
    }
    return performance[industry] || 70
  }

  const getEconomicIndicators = () => {
    return {
      gdpGrowth: 2.8,
      inflation: 3.2,
      unemployment: 4.1,
      consumerConfidence: 78.5,
      businessConfidence: 82.3
    }
  }

  const analyzeMarketSentiment = () => {
    return {
      overall: 'Positive',
      score: 72,
      factors: ['Strong ESG focus', 'Technology sector growth', 'Low unemployment']
    }
  }

  const determineOptimalStrategy = (intent, offers) => {
    const strategies = ['Collaborative', 'Competitive', 'Accommodating', 'Avoiding', 'Compromising']
    return strategies[Math.floor(Math.random() * strategies.length)]
  }

  const identifyLeveragePoints = (intent, offers) => {
    return [
      'Strong ESG credentials',
      'Multiple competing offers',
      'Favorable market conditions',
      'Long-term relationship potential'
    ]
  }

  const generateNegotiationTactics = (intent, offers) => {
    return [
      'Lead with ESG benefits',
      'Emphasize long-term partnership',
      'Use competitive pressure',
      'Highlight unique value proposition'
    ]
  }

  const calculateSuccessProbability = (intent, offers) => {
    return Math.random() * 30 + 70 // 70-100% success probability
  }

  const getRecommendedApproach = (intent, offers) => {
    return 'Focus on ESG benefits and long-term partnership value while maintaining competitive pressure'
  }

  const analyzeESGTrends = (intent, offers) => {
    return {
      increasing: true,
      momentum: 'Strong',
      keyDrivers: ['Regulatory pressure', 'Investor demand', 'Consumer preferences']
    }
  }

  const calculateSustainabilityImpact = (intent, offers) => {
    return {
      carbonReduction: Math.random() * 20 + 10, // 10-30% reduction
      socialImpact: Math.random() * 15 + 20, // 20-35% improvement
      governanceImprovement: Math.random() * 10 + 15 // 15-25% improvement
    }
  }

  const predictCarbonFootprint = (intent, offers) => {
    return Math.random() * 100 + 50 // 50-150 tons CO2
  }

  const identifyESGOpportunities = (intent, offers) => {
    return [
      'Carbon offset programs',
      'Renewable energy integration',
      'Social impact initiatives',
      'Governance improvements'
    ]
  }

  const assessRegulatoryCompliance = (intent, offers) => {
    return {
      current: 85,
      projected: 92,
      requirements: ['ESG reporting', 'Carbon disclosure', 'Social impact metrics']
    }
  }

  const analyzeCounterpartyBehavior = (offers) => {
    return {
      aggressiveness: Math.random() * 40 + 30, // 30-70%
      flexibility: Math.random() * 30 + 50, // 50-80%
      riskTolerance: Math.random() * 50 + 25, // 25-75%
      decisionSpeed: Math.random() * 20 + 40 // 40-60%
    }
  }

  const identifyNegotiationPatterns = (history) => {
    return {
      frequency: 'High',
      duration: 'Medium',
      outcomes: 'Mixed',
      keyFactors: ['Rate sensitivity', 'ESG focus', 'Relationship building']
    }
  }

  const analyzeDecisionMakingStyle = (intent, offers) => {
    return {
      style: 'Analytical',
      speed: 'Moderate',
      riskAppetite: 'Conservative',
      keyInfluences: ['Data-driven', 'ESG factors', 'Long-term thinking']
    }
  }

  const identifyCommunicationPreferences = (offers) => {
    return {
      frequency: 'Regular',
      format: 'Formal',
      detail: 'Comprehensive',
      channels: ['Email', 'Video calls', 'Documentation']
    }
  }

  const assessTrustIndicators = (offers) => {
    return {
      overall: 78,
      factors: ['Verification status', 'Historical performance', 'Transparency', 'Communication quality']
    }
  }

  const predictInterestRateChange = (days) => {
    const change = (Math.random() - 0.5) * 2 // -1% to +1%
    return {
      change: change,
      direction: change > 0 ? 'Increase' : 'Decrease',
      confidence: Math.random() * 0.3 + 0.7 // 70-100%
    }
  }

  const predictMarketVolatility = (days) => {
    return Math.random() * 20 + 15 // 15-35%
  }

  const predictDealSuccess = (days) => {
    return Math.random() * 30 + 70 // 70-100%
  }

  const predictESGImprovement = (days) => {
    return Math.random() * 15 + 5 // 5-20% improvement
  }

  const predictNegotiationOutcome = (days) => {
    const outcomes = ['Successful', 'Partial Success', 'Unsuccessful']
    const probabilities = [0.6, 0.3, 0.1]
    return { outcome: outcomes[0], probability: probabilities[0] }
  }

  if (!intent) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
        <div className="text-4xl mb-4">🤖</div>
        <h3 className="text-lg font-semibold text-gray-700 mb-2">No Intent Selected</h3>
        <p className="text-gray-600">Select an intent to perform AI analysis</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* AI Analysis Header */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">AI Intelligence Center</h2>
            <p className="text-gray-600">
              Intent #{intent.id} - {intent.companyName} • Advanced AI Analysis
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {isAnalyzing ? 'AI models analyzing data...' : 'AI analysis complete'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
              🤖 AI Powered
            </span>
            {aiPerformance && (
              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                {aiPerformance.overallAccuracy}% Accuracy
              </span>
            )}
          </div>
        </div>
      </div>

      {/* AI Models */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Models</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {aiModels.map(model => (
            <div key={model.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-gray-900">{model.name}</h4>
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                  model.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {model.status}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-3">{model.description}</p>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Accuracy:</span>
                  <span className="font-semibold text-green-600">{model.accuracy}%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Last Trained:</span>
                  <span className="text-gray-900">{format(new Date(model.lastTrained), 'MMM dd, yyyy')}</span>
                </div>
                <div className="text-xs text-gray-500">
                  Capabilities: {model.capabilities.join(', ')}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AI Insights */}
      {aiInsights && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Risk Assessment */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Risk Assessment</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Credit Risk</span>
                <span className="text-lg font-semibold text-blue-600">
                  {aiInsights.riskAssessment.creditRisk.toFixed(1)}/100
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Market Risk</span>
                <span className="text-lg font-semibold text-orange-600">
                  {aiInsights.riskAssessment.marketRisk.toFixed(1)}/100
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Liquidity Risk</span>
                <span className="text-lg font-semibold text-purple-600">
                  {aiInsights.riskAssessment.liquidityRisk.toFixed(1)}/100
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Operational Risk</span>
                <span className="text-lg font-semibold text-red-600">
                  {aiInsights.riskAssessment.operationalRisk.toFixed(1)}/100
                </span>
              </div>
              <div className="border-t border-gray-200 pt-3">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-900">Overall Risk Score</span>
                  <span className="text-xl font-bold text-gray-900">
                    {aiInsights.riskAssessment.overallRiskScore.toFixed(1)}/100
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Market Analysis */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Market Analysis</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Interest Rate Trend</span>
                <span className="text-lg font-semibold text-blue-600">
                  {aiInsights.marketAnalysis.interestRateTrend.trend}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Market Volatility</span>
                <span className="text-lg font-semibold text-orange-600">
                  {aiInsights.marketAnalysis.marketVolatility.toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Sector Performance</span>
                <span className="text-lg font-semibold text-green-600">
                  {aiInsights.marketAnalysis.sectorPerformance}/100
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Market Sentiment</span>
                <span className="text-lg font-semibold text-purple-600">
                  {aiInsights.marketAnalysis.marketSentiment.overall}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Predictions */}
      {predictions && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Predictions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Object.entries(predictions).filter(([key]) => key !== 'confidence').map(([period, data]) => (
              <div key={period} className="text-center">
                <h4 className="font-semibold text-gray-900 mb-3 capitalize">{period} Term</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Interest Rate:</span>
                    <span className="font-semibold">
                      {data.interestRateChange.change > 0 ? '+' : ''}{data.interestRateChange.change.toFixed(2)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Volatility:</span>
                    <span className="font-semibold">{data.marketVolatility.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Success Rate:</span>
                    <span className="font-semibold text-green-600">{data.dealSuccessProbability.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">ESG Improvement:</span>
                    <span className="font-semibold text-blue-600">+{data.esgScoreImprovement.toFixed(1)}%</span>
                  </div>
                </div>
                <div className="mt-3 text-xs text-gray-500">
                  Confidence: {Math.round(predictions.confidence[period] * 100)}%
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Recommendations</h3>
          <div className="space-y-4">
            {recommendations.map(rec => (
              <div key={rec.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        rec.priority === 'High' ? 'bg-red-100 text-red-800' :
                        rec.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {rec.priority}
                      </span>
                      <span className="text-sm font-medium text-gray-900">{rec.title}</span>
                      <span className="text-xs text-gray-500">({rec.category})</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{rec.description}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>Impact: {rec.impact}</span>
                      <span>Confidence: {Math.round(rec.confidence * 100)}%</span>
                      <span>Implementation: {rec.implementation}</span>
                    </div>
                    <div className="mt-2 text-xs text-green-600 font-medium">
                      Expected Benefit: {rec.expectedBenefit}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Processing Indicator */}
      {isAnalyzing && (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-purple-800 font-medium">AI models analyzing data and generating insights...</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default WFAPAI
