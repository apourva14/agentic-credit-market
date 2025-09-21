export const bankConfigs = {
  "Alpha Bank": {
    // Risk and Interest Policy
    risk_appetite: "Medium",
    min_interest_rate: 6.0,
    max_interest_rate: 8.0,
    base_rate: 4.5,
    target_margin: 2.0,
    
    // ESG Policy
    esg_focus: true,
    esg_exclusions: ["Coal Mining", "Deforestation"],
    carbon_threshold: 800, // tCO2/year
    esg_policy: "GreenIncentive", // Offers 0.5% discount for green projects
    
    // Competitive Behavior
    competitive_index: 7,
    speed_vs_quality: "Balanced",
    
    // Lending Limits and Specializations
    max_credit_limit: 5000000,
    preferred_sectors: ["technology", "healthcare"],
    collateral_policy: "Unsecured up to $200k for high-credit customers, otherwise require collateral",
    
    // Legacy fields for backward compatibility
    riskTolerance: "medium",
    preferredInterestRate: "6-8%",
    maxLoanAmount: 5000000,
    minLoanAmount: 100000,
    preferredDuration: "12-36 months",
    requiredCollateral: "property or assets",
    creditScoreRequirement: "700+",
    processingFee: "1-2%",
    negotiationStyle: "conservative",
    specializations: ["technology", "healthcare"],
    decisionSpeed: "fast",
    flexibility: "medium"
  },
  "Beta Financial": {
    // Risk and Interest Policy
    risk_appetite: "High",
    min_interest_rate: 4.0,
    max_interest_rate: 7.0,
    base_rate: 3.5,
    target_margin: 1.5,
    
    // ESG Policy
    esg_focus: false,
    esg_exclusions: [],
    carbon_threshold: 2000, // tCO2/year - very high threshold
    esg_policy: "FinancialOnly", // Focus purely on financial returns
    
    // Competitive Behavior
    competitive_index: 9,
    speed_vs_quality: "FastApproval",
    
    // Lending Limits and Specializations
    max_credit_limit: 10000000,
    preferred_sectors: ["renewable energy", "manufacturing"],
    collateral_policy: "Flexible - case by case basis",
    
    // Legacy fields for backward compatibility
    riskTolerance: "high",
    preferredInterestRate: "5-7%",
    maxLoanAmount: 10000000,
    minLoanAmount: 250000,
    preferredDuration: "24-60 months",
    requiredCollateral: "flexible",
    creditScoreRequirement: "650+",
    processingFee: "0.5-1.5%",
    negotiationStyle: "aggressive",
    specializations: ["renewable energy", "manufacturing"],
    decisionSpeed: "medium",
    flexibility: "high"
  },
  "Gamma Capital": {
    // Risk and Interest Policy
    risk_appetite: "Low",
    min_interest_rate: 6.5,
    max_interest_rate: 9.0,
    base_rate: 5.0,
    target_margin: 2.5,
    
    // ESG Policy
    esg_focus: true,
    esg_exclusions: ["Coal Mining", "Oil Drilling", "Deforestation", "Fossil Fuels"],
    carbon_threshold: 500, // tCO2/year - very strict
    esg_policy: "GreenOnly", // Only funds green projects
    
    // Competitive Behavior
    competitive_index: 5,
    speed_vs_quality: "ThoroughCheck",
    
    // Lending Limits and Specializations
    max_credit_limit: 3000000,
    preferred_sectors: ["retail", "services"],
    collateral_policy: "Always require collateral for risk mitigation",
    
    // Legacy fields for backward compatibility
    riskTolerance: "low",
    preferredInterestRate: "7-9%",
    maxLoanAmount: 3000000,
    minLoanAmount: 50000,
    preferredDuration: "6-24 months",
    requiredCollateral: "required",
    creditScoreRequirement: "750+",
    processingFee: "2-3%",
    negotiationStyle: "cautious",
    specializations: ["retail", "services"],
    decisionSpeed: "slow",
    flexibility: "low"
  },
  "Delta Bank": {
    // Risk and Interest Policy
    risk_appetite: "Medium",
    min_interest_rate: 5.5,
    max_interest_rate: 7.5,
    base_rate: 4.0,
    target_margin: 2.0,
    
    // ESG Policy
    esg_focus: true,
    esg_exclusions: ["Coal Mining"],
    carbon_threshold: 1000, // tCO2/year
    esg_policy: "ESGConsidered", // Considers ESG but not deal-breaker
    
    // Competitive Behavior
    competitive_index: 8,
    speed_vs_quality: "Balanced",
    
    // Lending Limits and Specializations
    max_credit_limit: 7500000,
    preferred_sectors: ["technology", "manufacturing", "healthcare"],
    collateral_policy: "Preferred but flexible for established companies",
    
    // Legacy fields for backward compatibility
    riskTolerance: "medium-high",
    preferredInterestRate: "5.5-7.5%",
    maxLoanAmount: 7500000,
    minLoanAmount: 200000,
    preferredDuration: "18-48 months",
    requiredCollateral: "preferred but flexible",
    creditScoreRequirement: "680+",
    processingFee: "1-2%",
    negotiationStyle: "balanced",
    specializations: ["technology", "manufacturing", "healthcare"],
    decisionSpeed: "fast",
    flexibility: "high"
  },
  "Epsilon Trust": {
    // Risk and Interest Policy
    risk_appetite: "Low",
    min_interest_rate: 6.5,
    max_interest_rate: 8.5,
    base_rate: 5.0,
    target_margin: 2.5,
    
    // ESG Policy
    esg_focus: true,
    esg_exclusions: ["Coal Mining", "Deforestation", "Fossil Fuels"],
    carbon_threshold: 600, // tCO2/year - strict
    esg_policy: "SustainableFirst", // Prioritizes sustainable projects
    
    // Competitive Behavior
    competitive_index: 6,
    speed_vs_quality: "ThoroughCheck",
    
    // Lending Limits and Specializations
    max_credit_limit: 4000000,
    preferred_sectors: ["real estate", "construction"],
    collateral_policy: "Always require collateral for security",
    
    // Legacy fields for backward compatibility
    riskTolerance: "low-medium",
    preferredInterestRate: "6.5-8.5%",
    maxLoanAmount: 4000000,
    minLoanAmount: 75000,
    preferredDuration: "12-30 months",
    requiredCollateral: "required",
    creditScoreRequirement: "720+",
    processingFee: "1.5-2.5%",
    negotiationStyle: "methodical",
    specializations: ["real estate", "construction"],
    decisionSpeed: "medium",
    flexibility: "medium"
  },
  "Zeta Commercial": {
    // Risk and Interest Policy
    risk_appetite: "High",
    min_interest_rate: 4.5,
    max_interest_rate: 6.5,
    base_rate: 3.0,
    target_margin: 1.5,
    
    // ESG Policy
    esg_focus: false,
    esg_exclusions: [],
    carbon_threshold: 3000, // tCO2/year - very high threshold
    esg_policy: "FinancialOnly", // Pure financial focus
    
    // Competitive Behavior
    competitive_index: 10,
    speed_vs_quality: "FastApproval",
    
    // Lending Limits and Specializations
    max_credit_limit: 15000000,
    preferred_sectors: ["technology", "renewable energy", "innovation"],
    collateral_policy: "Not required for established companies with strong financials",
    
    // Legacy fields for backward compatibility
    riskTolerance: "high",
    preferredInterestRate: "4.5-6.5%",
    maxLoanAmount: 15000000,
    minLoanAmount: 500000,
    preferredDuration: "36-72 months",
    requiredCollateral: "not required for established companies",
    creditScoreRequirement: "600+",
    processingFee: "0.25-1%",
    negotiationStyle: "competitive",
    specializations: ["technology", "renewable energy", "innovation"],
    decisionSpeed: "very fast",
    flexibility: "very high"
  }
}