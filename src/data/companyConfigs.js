// Company configurations for negotiation preferences
export const companyConfigs = {
  "TechStart Solutions": {
    // Interest Tolerance
    max_acceptable_rate: 8.5,
    min_amount_required: 100000,
    
    // ESG Priority/Thresholds
    esg_priority: "Medium",
    esg_max_emissions: 500, // tCO2/year
    min_esg_rating: 60,
    
    // Decision Strategy
    decision_strategy: "Cost_Focused",
    negotiation_strategy: "CounterOfferTop2",
    
    // Other Preferences
    preferred_bank_features: ["NoCollateral", "FastProcessing"],
    communication_tone: "Professional",
    
    // Legacy fields for backward compatibility
    urgency: "high",
    acceptableInterestRate: "up to 8%",
    collateralAvailability: "limited equipment",
    creditScore: 720,
    cashFlow: "positive but variable",
    businessStage: "growth",
    negotiationStyle: "flexible",
    priorityFactors: ["speed", "low collateral requirements"],
    maxAcceptableRate: 8.5,
    preferredDuration: "12-24 months",
    industry: "technology",
    riskProfile: "medium"
  },
  "Green Energy Corp": {
    // Interest Tolerance
    max_acceptable_rate: 7.0,
    min_amount_required: 500000,
    
    // ESG Priority/Thresholds
    esg_priority: "High",
    esg_max_emissions: 100, // tCO2/year - very strict
    min_esg_rating: 85,
    
    // Decision Strategy
    decision_strategy: "ESG_Focused",
    negotiation_strategy: "WalkAwayIfNoESG",
    
    // Other Preferences
    preferred_bank_features: ["ESGCommitment", "LongTermPartnership"],
    communication_tone: "Professional",
    
    // Legacy fields for backward compatibility
    urgency: "medium",
    acceptableInterestRate: "up to 6%",
    collateralAvailability: "substantial assets and equipment",
    creditScore: 780,
    cashFlow: "strong and stable",
    businessStage: "expansion",
    negotiationStyle: "thorough",
    priorityFactors: ["low interest rate", "long term"],
    maxAcceptableRate: 7.0,
    preferredDuration: "36-60 months",
    industry: "renewable energy",
    riskProfile: "low-medium"
  },
  "HealthTech Innovations": {
    // Interest Tolerance
    max_acceptable_rate: 7.5,
    min_amount_required: 200000,
    
    // ESG Priority/Thresholds
    esg_priority: "Medium",
    esg_max_emissions: 300, // tCO2/year
    min_esg_rating: 70,
    
    // Decision Strategy
    decision_strategy: "Balanced",
    negotiation_strategy: "CounterOfferTop2",
    
    // Other Preferences
    preferred_bank_features: ["IndustryExpertise", "FlexibleTerms"],
    communication_tone: "Professional",
    
    // Legacy fields for backward compatibility
    urgency: "medium-high",
    acceptableInterestRate: "up to 7%",
    collateralAvailability: "intellectual property and equipment",
    creditScore: 690,
    cashFlow: "growing but uneven",
    businessStage: "development",
    negotiationStyle: "cautious",
    priorityFactors: ["flexible terms", "understanding of industry"],
    maxAcceptableRate: 7.5,
    preferredDuration: "18-36 months",
    industry: "healthcare technology",
    riskProfile: "medium-high"
  },
  "Manufacturing Plus": {
    // Interest Tolerance
    max_acceptable_rate: 7.0,
    min_amount_required: 750000,
    
    // ESG Priority/Thresholds
    esg_priority: "Low",
    esg_max_emissions: 800, // tCO2/year - more lenient
    min_esg_rating: 50,
    
    // Decision Strategy
    decision_strategy: "Cost_Focused",
    negotiation_strategy: "CounterOfferTop2",
    
    // Other Preferences
    preferred_bank_features: ["CompetitiveRates", "EstablishedRelationship"],
    communication_tone: "Professional",
    
    // Legacy fields for backward compatibility
    urgency: "low",
    acceptableInterestRate: "up to 6.5%",
    collateralAvailability: "extensive machinery and property",
    creditScore: 750,
    cashFlow: "stable and predictable",
    businessStage: "established",
    negotiationStyle: "methodical",
    priorityFactors: ["competitive rates", "established relationship"],
    maxAcceptableRate: 7.0,
    preferredDuration: "24-48 months",
    industry: "manufacturing",
    riskProfile: "low"
  },
  "Retail Dynamics": {
    // Interest Tolerance
    max_acceptable_rate: 9.5,
    min_amount_required: 150000,
    
    // ESG Priority/Thresholds
    esg_priority: "Low",
    esg_max_emissions: 600, // tCO2/year
    min_esg_rating: 55,
    
    // Decision Strategy - Special pattern: Always negotiate first, accept second
    decision_strategy: "Cost_Focused",
    negotiation_strategy: "AlwaysNegotiateFirst",
    negotiation_pattern: "negotiate_then_accept",
    
    // Other Preferences
    preferred_bank_features: ["QuickApproval", "SeasonalFlexibility"],
    communication_tone: "Results-Oriented",
    
    // Legacy fields for backward compatibility
    urgency: "high",
    acceptableInterestRate: "up to 9%",
    collateralAvailability: "inventory and store assets",
    creditScore: 680,
    cashFlow: "seasonal variations",
    businessStage: "mature",
    negotiationStyle: "results-oriented",
    priorityFactors: ["quick approval", "seasonal flexibility"],
    maxAcceptableRate: 9.5,
    preferredDuration: "12-30 months",
    industry: "retail",
    riskProfile: "medium"
  }
}

// Generate company config for any company not in the predefined list
export const generateCompanyConfig = (companyName, intent) => {
  // Determine industry from purpose or company name
  const purpose = intent.purpose.toLowerCase()
  let industry = "general business"
  
  if (purpose.includes("tech") || purpose.includes("software") || purpose.includes("digital")) {
    industry = "technology"
  } else if (purpose.includes("health") || purpose.includes("medical") || purpose.includes("pharma")) {
    industry = "healthcare"
  } else if (purpose.includes("energy") || purpose.includes("solar") || purpose.includes("renewable")) {
    industry = "renewable energy"
  } else if (purpose.includes("manufacturing") || purpose.includes("production") || purpose.includes("factory")) {
    industry = "manufacturing"
  } else if (purpose.includes("retail") || purpose.includes("store") || purpose.includes("shop")) {
    industry = "retail"
  }

  // Generate config based on loan amount and industry
  const amount = intent.amount
  let urgency = "medium"
  let maxRate = 7.5
  let riskProfile = "medium"
  let esgPriority = "Medium"
  let esgMaxEmissions = 500
  let minEsgRating = 60
  
  if (amount > 1000000) {
    urgency = "low"
    maxRate = 7.0
    riskProfile = "low-medium"
    esgPriority = "High"
    esgMaxEmissions = 300
    minEsgRating = 75
  } else if (amount < 250000) {
    urgency = "high"
    maxRate = 9.0
    riskProfile = "medium-high"
    esgPriority = "Low"
    esgMaxEmissions = 800
    minEsgRating = 50
  }

  // Adjust ESG preferences based on industry
  if (industry === "renewable energy") {
    esgPriority = "High"
    esgMaxEmissions = 100
    minEsgRating = 85
  } else if (industry === "technology") {
    esgPriority = "Medium"
    esgMaxEmissions = 400
    minEsgRating = 65
  } else if (industry === "manufacturing") {
    esgPriority = "Low"
    esgMaxEmissions = 700
    minEsgRating = 55
  }

  return {
    // New schema fields
    max_acceptable_rate: maxRate,
    min_amount_required: Math.max(amount * 0.8, 50000), // At least 80% of requested amount
    
    esg_priority: esgPriority,
    esg_max_emissions: esgMaxEmissions,
    min_esg_rating: minEsgRating,
    
    decision_strategy: esgPriority === "High" ? "ESG_Focused" : "Cost_Focused",
    negotiation_strategy: "CounterOfferTop2",
    
    preferred_bank_features: ["CompetitiveRates", "ProfessionalService"],
    communication_tone: "Professional",
    
    // Legacy fields for backward compatibility
    urgency,
    acceptableInterestRate: `up to ${maxRate}%`,
    collateralAvailability: "standard business assets",
    creditScore: 650 + Math.floor(Math.random() * 100),
    cashFlow: "variable",
    businessStage: "growth",
    negotiationStyle: "balanced",
    priorityFactors: ["competitive terms", "reasonable timeline"],
    maxAcceptableRate: maxRate,
    preferredDuration: `${intent.duration}-${intent.duration + 12} months`,
    industry,
    riskProfile
  }
}