import React, { useState, useEffect } from 'react'
import { MESSAGE_TYPES } from '../../schemas/wfapSchemas'

const WFAPESG = ({ 
  intent, 
  offers = [], 
  onESGAnalysisComplete,
  onCarbonImpactCalculated 
}) => {
  const [esgAnalysis, setEsgAnalysis] = useState(null)
  const [carbonImpact, setCarbonImpact] = useState(null)
  const [sustainabilityMetrics, setSustainabilityMetrics] = useState(null)
  const [esgRecommendations, setEsgRecommendations] = useState([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  useEffect(() => {
    if (intent && offers.length > 0) {
      performESGAnalysis()
    }
  }, [intent, offers])

  const performESGAnalysis = async () => {
    setIsAnalyzing(true)
    
    try {
      // Perform comprehensive ESG analysis
      const analysis = await analyzeESGImpact(intent, offers)
      setEsgAnalysis(analysis)
      
      // Calculate carbon impact
      const carbon = await calculateCarbonImpact(intent, offers)
      setCarbonImpact(carbon)
      
      // Generate sustainability metrics
      const metrics = await generateSustainabilityMetrics(intent, offers)
      setSustainabilityMetrics(metrics)
      
      // Generate ESG recommendations
      const recommendations = await generateESGRecommendations(intent, offers, analysis)
      setEsgRecommendations(recommendations)
      
      if (onESGAnalysisComplete) {
        onESGAnalysisComplete(analysis)
      }
      
      if (onCarbonImpactCalculated) {
        onCarbonImpactCalculated(carbon)
      }
    } catch (error) {
      console.error('ESG analysis error:', error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const analyzeESGImpact = async (intent, offers) => {
    // Simulate ESG analysis delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const industryESGFactors = {
      'Clean Technology': { baseScore: 85, carbonFactor: 0.8, socialFactor: 0.9, governanceFactor: 0.85 },
      'Technology': { baseScore: 70, carbonFactor: 0.6, socialFactor: 0.8, governanceFactor: 0.75 },
      'Manufacturing': { baseScore: 60, carbonFactor: 0.4, socialFactor: 0.7, governanceFactor: 0.7 },
      'Energy': { baseScore: 45, carbonFactor: 0.2, socialFactor: 0.6, governanceFactor: 0.65 },
      'Finance': { baseScore: 75, carbonFactor: 0.9, socialFactor: 0.8, governanceFactor: 0.9 },
      'Healthcare': { baseScore: 80, carbonFactor: 0.7, socialFactor: 0.95, governanceFactor: 0.85 }
    }

    const industry = intent.industry || 'Technology'
    const factors = industryESGFactors[industry] || industryESGFactors['Technology']
    
    // Calculate ESG scores for each offer
    const offerESGScores = offers.map(offer => {
      const baseScore = factors.baseScore
      const carbonScore = (offer.carbonAdjustment || 0) * 100 + 50
      const esgScore = offer.esgScore || baseScore
      
      return {
        ...offer,
        calculatedESGScore: Math.min(100, Math.max(0, 
          (baseScore * 0.4) + 
          (carbonScore * 0.3) + 
          (esgScore * 0.3)
        )),
        carbonImpact: calculateCarbonImpactForOffer(offer, intent),
        socialImpact: calculateSocialImpactForOffer(offer, intent),
        governanceScore: calculateGovernanceScoreForOffer(offer, intent)
      }
    })

    // Calculate overall ESG metrics
    const avgESGScore = offerESGScores.reduce((sum, offer) => sum + offer.calculatedESGScore, 0) / offerESGScores.length
    const bestESGOffer = offerESGScores.reduce((best, current) => 
      current.calculatedESGScore > best.calculatedESGScore ? current : best
    )

    return {
      industryFactors: factors,
      offerScores: offerESGScores,
      averageESGScore: avgESGScore,
      bestESGOffer,
      industryRanking: getIndustryESGRanking(industry),
      esgTrends: calculateESGTrends(offerESGScores),
      recommendations: generateESGRecommendationsForOffers(offerESGScores)
    }
  }

  const calculateCarbonImpact = async (intent, offers) => {
    // Simulate carbon impact calculation
    await new Promise(resolve => setTimeout(resolve, 800))
    
    const industryCarbonFactors = {
      'Clean Technology': 0.1, // Very low carbon intensity
      'Technology': 0.3,       // Low carbon intensity
      'Manufacturing': 0.7,    // Medium carbon intensity
      'Energy': 1.2,           // High carbon intensity
      'Finance': 0.2,          // Very low carbon intensity
      'Healthcare': 0.4        // Low carbon intensity
    }

    const industry = intent.industry || 'Technology'
    const carbonFactor = industryCarbonFactors[industry] || 0.5
    
    const intentCarbonFootprint = (intent.amount / 1000000) * carbonFactor * 1000 // tons CO2 per $1M
    const projectLifetime = intent.term || 12 // months
    
    const carbonImpacts = offers.map(offer => {
      const carbonAdjustment = offer.carbonAdjustment || 0
      const adjustedFootprint = intentCarbonFootprint * (1 + carbonAdjustment)
      const lifetimeEmissions = adjustedFootprint * (projectLifetime / 12)
      const carbonSavings = carbonAdjustment < 0 ? Math.abs(carbonAdjustment) * intentCarbonFootprint : 0
      
      return {
        ...offer,
        carbonFootprint: adjustedFootprint,
        lifetimeEmissions,
        carbonSavings,
        carbonIntensity: adjustedFootprint / (offer.approvedAmount / 1000000),
        carbonRating: getCarbonRating(adjustedFootprint, intent.amount)
      }
    })

    const totalCarbonFootprint = carbonImpacts.reduce((sum, impact) => sum + impact.carbonFootprint, 0)
    const avgCarbonIntensity = totalCarbonFootprint / offers.length
    const bestCarbonOffer = carbonImpacts.reduce((best, current) => 
      current.carbonFootprint < best.carbonFootprint ? current : best
    )

    return {
      intentCarbonFootprint,
      projectLifetime,
      offerImpacts: carbonImpacts,
      averageCarbonIntensity: avgCarbonIntensity,
      bestCarbonOffer,
      totalPotentialSavings: carbonImpacts.reduce((sum, impact) => sum + impact.carbonSavings, 0),
      carbonNeutralityPotential: calculateCarbonNeutralityPotential(carbonImpacts),
      carbonOffsetRecommendations: generateCarbonOffsetRecommendations(carbonImpacts)
    }
  }

  const generateSustainabilityMetrics = async (intent, offers) => {
    // Simulate sustainability metrics calculation
    await new Promise(resolve => setTimeout(resolve, 600))
    
    const metrics = {
      environmental: {
        carbonFootprint: carbonImpact?.intentCarbonFootprint || 0,
        renewableEnergyPotential: calculateRenewableEnergyPotential(intent),
        wasteReductionPotential: calculateWasteReductionPotential(intent),
        waterConservationPotential: calculateWaterConservationPotential(intent),
        biodiversityImpact: calculateBiodiversityImpact(intent)
      },
      social: {
        jobCreationPotential: calculateJobCreationPotential(intent),
        communityImpact: calculateCommunityImpact(intent),
        diversityAndInclusion: calculateDiversityAndInclusion(intent),
        healthAndSafety: calculateHealthAndSafety(intent),
        educationAndTraining: calculateEducationAndTraining(intent)
      },
      governance: {
        transparencyScore: calculateTransparencyScore(intent, offers),
        riskManagement: calculateRiskManagementScore(intent, offers),
        complianceScore: calculateComplianceScore(intent, offers),
        stakeholderEngagement: calculateStakeholderEngagement(intent),
        ethicalStandards: calculateEthicalStandards(intent, offers)
      }
    }

    // Calculate overall sustainability score
    const environmentalScore = Object.values(metrics.environmental).reduce((sum, val) => sum + val, 0) / Object.keys(metrics.environmental).length
    const socialScore = Object.values(metrics.social).reduce((sum, val) => sum + val, 0) / Object.keys(metrics.social).length
    const governanceScore = Object.values(metrics.governance).reduce((sum, val) => sum + val, 0) / Object.keys(metrics.governance).length
    
    const overallScore = (environmentalScore + socialScore + governanceScore) / 3

    return {
      ...metrics,
      overallScore,
      environmentalScore,
      socialScore,
      governanceScore,
      sustainabilityRating: getSustainabilityRating(overallScore),
      improvementAreas: identifyImprovementAreas(metrics),
      bestPractices: getBestPractices(intent.industry)
    }
  }

  const generateESGRecommendations = async (intent, offers, analysis) => {
    const recommendations = []
    
    // Environmental recommendations
    if (analysis.averageESGScore < 70) {
      recommendations.push({
        category: 'Environmental',
        priority: 'High',
        title: 'Improve Environmental Impact',
        description: 'Consider implementing renewable energy solutions and carbon offset programs',
        impact: 'High',
        cost: 'Medium',
        timeline: '6-12 months'
      })
    }
    
    // Social recommendations
    if (intent.industry === 'Manufacturing' || intent.industry === 'Energy') {
      recommendations.push({
        category: 'Social',
        priority: 'Medium',
        title: 'Enhance Community Engagement',
        description: 'Develop community outreach programs and local hiring initiatives',
        impact: 'Medium',
        cost: 'Low',
        timeline: '3-6 months'
      })
    }
    
    // Governance recommendations
    if (analysis.industryRanking < 50) {
      recommendations.push({
        category: 'Governance',
        priority: 'High',
        title: 'Strengthen Governance Framework',
        description: 'Implement comprehensive ESG reporting and risk management systems',
        impact: 'High',
        cost: 'High',
        timeline: '12-18 months'
      })
    }
    
    return recommendations
  }

  // Helper functions
  const calculateCarbonImpactForOffer = (offer, intent) => {
    const baseImpact = (intent.amount / 1000000) * 0.5 // Base carbon impact
    const adjustment = offer.carbonAdjustment || 0
    return baseImpact * (1 + adjustment)
  }

  const calculateSocialImpactForOffer = (offer, intent) => {
    const baseScore = 70
    const esgBonus = (offer.esgScore || 0) * 0.3
    return Math.min(100, baseScore + esgBonus)
  }

  const calculateGovernanceScoreForOffer = (offer, intent) => {
    const baseScore = 75
    const verificationBonus = offer.verification?.isValid ? 10 : 0
    const complianceBonus = offer.compliance?.kycVerified ? 15 : 0
    return Math.min(100, baseScore + verificationBonus + complianceBonus)
  }

  const getIndustryESGRanking = (industry) => {
    const rankings = {
      'Clean Technology': 95,
      'Healthcare': 85,
      'Finance': 80,
      'Technology': 75,
      'Manufacturing': 60,
      'Energy': 45
    }
    return rankings[industry] || 50
  }

  const calculateESGTrends = (offerScores) => {
    return {
      improving: offerScores.filter(offer => offer.calculatedESGScore > 80).length,
      stable: offerScores.filter(offer => offer.calculatedESGScore >= 60 && offer.calculatedESGScore <= 80).length,
      declining: offerScores.filter(offer => offer.calculatedESGScore < 60).length
    }
  }

  const generateESGRecommendationsForOffers = (offerScores) => {
    return offerScores.map(offer => ({
      offerId: offer.messageId,
      bankName: offer.bankName,
      currentScore: offer.calculatedESGScore,
      recommendations: offer.calculatedESGScore < 70 ? [
        'Improve ESG documentation',
        'Consider carbon offset programs',
        'Enhance social impact reporting'
      ] : [
        'Maintain current ESG standards',
        'Consider additional sustainability initiatives'
      ]
    }))
  }

  const getCarbonRating = (footprint, amount) => {
    const intensity = footprint / (amount / 1000000)
    if (intensity < 0.1) return 'A+'
    if (intensity < 0.3) return 'A'
    if (intensity < 0.5) return 'B'
    if (intensity < 0.7) return 'C'
    return 'D'
  }

  const calculateCarbonNeutralityPotential = (carbonImpacts) => {
    const totalSavings = carbonImpacts.reduce((sum, impact) => sum + impact.carbonSavings, 0)
    const totalFootprint = carbonImpacts.reduce((sum, impact) => sum + impact.carbonFootprint, 0)
    return totalSavings / totalFootprint
  }

  const generateCarbonOffsetRecommendations = (carbonImpacts) => {
    return carbonImpacts.map(impact => ({
      offerId: impact.messageId,
      recommendedOffsets: [
        'Renewable energy certificates',
        'Forest conservation projects',
        'Carbon capture technology'
      ],
      estimatedCost: impact.carbonFootprint * 50, // $50 per ton CO2
      potentialSavings: impact.carbonSavings * 50
    }))
  }

  // Additional helper functions for sustainability metrics
  const calculateRenewableEnergyPotential = (intent) => 85
  const calculateWasteReductionPotential = (intent) => 70
  const calculateWaterConservationPotential = (intent) => 75
  const calculateBiodiversityImpact = (intent) => 60
  const calculateJobCreationPotential = (intent) => 80
  const calculateCommunityImpact = (intent) => 75
  const calculateDiversityAndInclusion = (intent) => 70
  const calculateHealthAndSafety = (intent) => 85
  const calculateEducationAndTraining = (intent) => 65
  const calculateTransparencyScore = (intent, offers) => 80
  const calculateRiskManagementScore = (intent, offers) => 75
  const calculateComplianceScore = (intent, offers) => 85
  const calculateStakeholderEngagement = (intent) => 70
  const calculateEthicalStandards = (intent, offers) => 80

  const getSustainabilityRating = (score) => {
    if (score >= 90) return 'Excellent'
    if (score >= 80) return 'Very Good'
    if (score >= 70) return 'Good'
    if (score >= 60) return 'Fair'
    return 'Needs Improvement'
  }

  const identifyImprovementAreas = (metrics) => {
    const areas = []
    if (metrics.environmentalScore < 70) areas.push('Environmental Impact')
    if (metrics.socialScore < 70) areas.push('Social Responsibility')
    if (metrics.governanceScore < 70) areas.push('Governance')
    return areas
  }

  const getBestPractices = (industry) => {
    const practices = {
      'Clean Technology': ['Renewable energy integration', 'Circular economy principles', 'Carbon neutrality'],
      'Technology': ['Green data centers', 'Sustainable software development', 'Digital inclusion'],
      'Manufacturing': ['Lean manufacturing', 'Waste reduction', 'Energy efficiency'],
      'Energy': ['Renewable energy transition', 'Carbon capture', 'Grid modernization'],
      'Finance': ['Green finance', 'ESG investing', 'Sustainable lending'],
      'Healthcare': ['Patient safety', 'Medical waste reduction', 'Community health']
    }
    return practices[industry] || ['General sustainability practices']
  }

  if (!intent) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
        <div className="text-4xl mb-4">🌱</div>
        <h3 className="text-lg font-semibold text-gray-700 mb-2">No Intent Selected</h3>
        <p className="text-gray-600">Select an intent to perform ESG analysis</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* ESG Analysis Header */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">ESG Impact Analysis</h2>
            <p className="text-gray-600">
              Intent #{intent.id} - {intent.companyName} • {intent.industry}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {isAnalyzing ? 'Analyzing ESG impact...' : 'ESG analysis complete'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
              🌱 ESG Analysis
            </span>
            {esgAnalysis && (
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                Score: {esgAnalysis.averageESGScore.toFixed(1)}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ESG Scores Overview */}
      {esgAnalysis && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">ESG Scores</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Average Score</span>
                <span className="text-2xl font-bold text-green-600">
                  {esgAnalysis.averageESGScore.toFixed(1)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Best Offer</span>
                <span className="text-lg font-semibold text-blue-600">
                  {esgAnalysis.bestESGOffer.calculatedESGScore.toFixed(1)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Industry Ranking</span>
                <span className="text-lg font-semibold text-purple-600">
                  {esgAnalysis.industryRanking}/100
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Carbon Impact</h3>
            {carbonImpact && (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Footprint</span>
                  <span className="text-lg font-semibold text-orange-600">
                    {carbonImpact.intentCarbonFootprint.toFixed(1)}t CO2
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Best Offer</span>
                  <span className="text-lg font-semibold text-green-600">
                    {carbonImpact.bestCarbonOffer.carbonRating}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Potential Savings</span>
                  <span className="text-lg font-semibold text-blue-600">
                    {carbonImpact.totalPotentialSavings.toFixed(1)}t CO2
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Sustainability</h3>
            {sustainabilityMetrics && (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Overall Score</span>
                  <span className="text-2xl font-bold text-green-600">
                    {sustainabilityMetrics.overallScore.toFixed(1)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Rating</span>
                  <span className="text-lg font-semibold text-blue-600">
                    {sustainabilityMetrics.sustainabilityRating}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Areas to Improve</span>
                  <span className="text-lg font-semibold text-orange-600">
                    {sustainabilityMetrics.improvementAreas.length}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Detailed ESG Analysis */}
      {esgAnalysis && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Detailed ESG Analysis</h3>
          <div className="space-y-4">
            {esgAnalysis.offerScores.map((offer, index) => (
              <div key={offer.messageId} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-sm font-semibold text-green-600">
                      {index + 1}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{offer.bankName}</h4>
                      <p className="text-sm text-gray-600">ESG Score: {offer.calculatedESGScore.toFixed(1)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-green-600">
                      {offer.calculatedESGScore.toFixed(1)}/100
                    </div>
                    <div className="text-sm text-gray-600">
                      {offer.carbonImpact.toFixed(1)}t CO2
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Environmental:</span>
                    <div className="font-semibold text-green-600">{offer.carbonImpact.toFixed(1)}t CO2</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Social:</span>
                    <div className="font-semibold text-blue-600">{offer.socialImpact.toFixed(1)}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Governance:</span>
                    <div className="font-semibold text-purple-600">{offer.governanceScore.toFixed(1)}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ESG Recommendations */}
      {esgRecommendations.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">ESG Recommendations</h3>
          <div className="space-y-3">
            {esgRecommendations.map((rec, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        rec.priority === 'High' ? 'bg-red-100 text-red-800' :
                        rec.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {rec.priority}
                      </span>
                      <span className="text-sm font-medium text-gray-900">{rec.title}</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{rec.description}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>Impact: {rec.impact}</span>
                      <span>Cost: {rec.cost}</span>
                      <span>Timeline: {rec.timeline}</span>
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
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 border-2 border-green-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-green-800 font-medium">Analyzing ESG impact and sustainability metrics...</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default WFAPESG
