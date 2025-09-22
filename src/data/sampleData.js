export const sampleData = {
  intents: [
    {
      // Basic fields for backward compatibility
      id: 1001,
      companyName: "TechStart Solutions",
      amount: 500000,
      duration: 12,
      purpose: "Equipment purchase and expansion",
      status: "open",
      timestamp: "2025-09-20T01:30:00Z",
      
      // WFAP-compliant fields
      messageId: "req-2025-0001",
      messageType: "Intent",
      version: "WFAP/1.0",
      senderId: "TECHSTART_SOLUTIONS",
      senderType: "Organization",
      productType: "BusinessLineOfCredit",
      currency: "USD",
      term: 12,
      maxRate: 8.5,
      esgPriority: "Medium",
      
      // Full intent schema
      intent_id: "INTENT_1001",
      customer_id: "TechStart Solutions",
      product_type: "business_line_of_credit",
      requested_amount: 500000,
      desired_term: 12,
      
      // Customer profile
      customer_profile: {
        industry: "Technology",
        annual_revenue: 2500000,
        credit_score: 720,
        esg_profile: "Standard"
      },
      
      // ESG preferences
      esg_preferences: {
        exclude_high_carbon: false,
        preferred_green_certification: "None"
      },
      
      // WFAP Security fields (mock)
      credentials: {
        certificate: "-----BEGIN CERTIFICATE-----\nMOCK_CERT_TECHSTART_SOLUTIONS\n-----END CERTIFICATE-----",
        certificateId: "TECHSTART_SOLUTIONS_CERT_1734567890"
      },
      signature: "MOCK_SIGNATURE_TECHSTART_SOLUTIONS_1734567890",
      signatureCertId: "TechStartSolutionsCert#001",
      
      // Additional fields for internal use
      industry: "Technology",
      creditScore: 720,
      esgProfile: "Standard",
      excludeHighCarbon: false,
      greenCertification: "None",
      annualRevenue: 2500000
    },
    {
      // Basic fields for backward compatibility
      id: 1002,
      companyName: "Green Energy Corp",
      amount: 2000000,
      duration: 24,
      purpose: "Solar panel manufacturing facility",
      status: "open",
      timestamp: "2025-09-20T01:15:00Z",
      
      // WFAP-compliant fields
      messageId: "req-2025-0002",
      messageType: "Intent",
      version: "WFAP/1.0",
      senderId: "GREEN_ENERGY_CORP",
      senderType: "Organization",
      productType: "BusinessLineOfCredit",
      currency: "USD",
      term: 24,
      maxRate: 7.0,
      esgPriority: "High",
      
      // Full intent schema
      intent_id: "INTENT_1002",
      customer_id: "Green Energy Corp",
      product_type: "business_line_of_credit",
      requested_amount: 2000000,
      desired_term: 24,
      
      // Customer profile
      customer_profile: {
        industry: "Renewable Energy",
        annual_revenue: 15000000,
        credit_score: 780,
        esg_profile: "CarbonNeutralCertified"
      },
      
      // ESG preferences
      esg_preferences: {
        exclude_high_carbon: true,
        preferred_green_certification: "GreenLoanPrinciples"
      },
      
      // WFAP Security fields (mock)
      credentials: {
        certificate: "-----BEGIN CERTIFICATE-----\nMOCK_CERT_GREEN_ENERGY_CORP\n-----END CERTIFICATE-----",
        certificateId: "GREEN_ENERGY_CORP_CERT_1734567891"
      },
      signature: "MOCK_SIGNATURE_GREEN_ENERGY_CORP_1734567891",
      signatureCertId: "GreenEnergyCorpCert#002",
      
      // Additional fields for internal use
      industry: "Renewable Energy",
      creditScore: 780,
      esgProfile: "CarbonNeutralCertified",
      excludeHighCarbon: true,
      greenCertification: "GreenLoanPrinciples",
      annualRevenue: 15000000
    },
    {
      // Basic fields for backward compatibility
      id: 1003,
      companyName: "HealthTech Innovations",
      amount: 750000,
      duration: 18,
      purpose: "Medical device development",
      status: "open",
      timestamp: "2025-09-20T02:00:00Z",
      
      // WFAP-compliant fields
      messageId: "req-2025-0003",
      messageType: "Intent",
      version: "WFAP/1.0",
      senderId: "HEALTHTECH_INNOVATIONS",
      senderType: "Organization",
      productType: "BusinessLineOfCredit",
      currency: "USD",
      term: 18,
      maxRate: 7.5,
      esgPriority: "Medium",
      
      // Full intent schema
      intent_id: "INTENT_1003",
      customer_id: "HealthTech Innovations",
      product_type: "business_line_of_credit",
      requested_amount: 750000,
      desired_term: 18,
      
      // Customer profile
      customer_profile: {
        industry: "Healthcare",
        annual_revenue: 5000000,
        credit_score: 690,
        esg_profile: "ISO14001Certified"
      },
      
      // ESG preferences
      esg_preferences: {
        exclude_high_carbon: true,
        preferred_green_certification: "SustainabilityLinkedLoan"
      },
      
      // WFAP Security fields (mock)
      credentials: {
        certificate: "-----BEGIN CERTIFICATE-----\nMOCK_CERT_HEALTHTECH_INNOVATIONS\n-----END CERTIFICATE-----",
        certificateId: "HEALTHTECH_INNOVATIONS_CERT_1734567892"
      },
      signature: "MOCK_SIGNATURE_HEALTHTECH_INNOVATIONS_1734567892",
      signatureCertId: "HealthTechInnovationsCert#003",
      
      // Additional fields for internal use
      industry: "Healthcare",
      creditScore: 690,
      esgProfile: "ISO14001Certified",
      excludeHighCarbon: true,
      greenCertification: "SustainabilityLinkedLoan",
      annualRevenue: 5000000
    }
  ],
  ongoingDeals: [
    {
      id: "deal-1",
      intentId: 1001,
      companyName: "TechStart Solutions",
      bankName: "Alpha Bank",
      timestamp: "2025-09-20T01:35:00Z"
    },
    {
      id: "deal-2",
      intentId: 1002,
      companyName: "Green Energy Corp",
      bankName: "Beta Financial",
      timestamp: "2025-09-20T01:25:00Z"
    },
    {
      id: "deal-3",
      intentId: 1002,
      companyName: "Green Energy Corp",
      bankName: "Gamma Capital",
      timestamp: "2025-09-20T01:28:00Z"
    },
    {
      id: "deal-4",
      intentId: 1003,
      companyName: "HealthTech Innovations",
      bankName: "Delta Bank",
      timestamp: "2025-09-20T02:05:00Z"
    }
  ],
  closedDeals: [
    {
      // Basic fields for backward compatibility
      id: 1000,
      companyName: "Manufacturing Plus",
      winningBank: "Delta Bank",
      amount: 750000,
      duration: 18,
      purpose: "Equipment upgrade and facility expansion",
      timestamp: "2025-09-19T15:45:00Z",
      
      // Full intent schema
      intent_id: "INTENT_1000",
      customer_id: "Manufacturing Plus",
      product_type: "business_line_of_credit",
      requested_amount: 750000,
      currency: "USD",
      desired_term: 18,
      
      // Customer profile
      customer_profile: {
        industry: "Manufacturing",
        annual_revenue: 12000000,
        credit_score: 750,
        esg_profile: "Standard"
      },
      
      // ESG preferences
      esg_preferences: {
        exclude_high_carbon: false,
        preferred_green_certification: "None"
      },
      
      // Additional fields for internal use
      industry: "Manufacturing",
      creditScore: 750,
      esgProfile: "Standard",
      excludeHighCarbon: false,
      greenCertification: "None",
      annualRevenue: 12000000
    },
    {
      // Basic fields for backward compatibility
      id: 999,
      companyName: "Retail Dynamics",
      winningBank: "Alpha Bank",
      amount: 300000,
      duration: 12,
      purpose: "Working capital and inventory management",
      timestamp: "2025-09-19T10:30:00Z",
      
      // Full intent schema
      intent_id: "INTENT_999",
      customer_id: "Retail Dynamics",
      product_type: "business_line_of_credit",
      requested_amount: 300000,
      currency: "USD",
      desired_term: 12,
      
      // Customer profile
      customer_profile: {
        industry: "Retail",
        annual_revenue: 8000000,
        credit_score: 680,
        esg_profile: "Standard"
      },
      
      // ESG preferences
      esg_preferences: {
        exclude_high_carbon: false,
        preferred_green_certification: "None"
      },
      
      // Additional fields for internal use
      industry: "Retail",
      creditScore: 680,
      esgProfile: "Standard",
      excludeHighCarbon: false,
      greenCertification: "None",
      annualRevenue: 8000000
    }
  ]
}

export const availableBanks = [
  "Alpha Bank",
  "Beta Financial", 
  "Gamma Capital",
  "Delta Bank",
  "Epsilon Trust",
  "Zeta Commercial"
]

export const availableCompanies = [
  "TechStart Solutions",
  "Green Energy Corp", 
  "HealthTech Innovations",
  "Manufacturing Plus",
  "Retail Dynamics"
]

export const roles = [
  {
    id: "company",
    name: "Company",
    description: "Create intents and close deals"
  },
  {
    id: "bank", 
    name: "Bank",
    description: "Express interest and manage deals"
  },
  {
    id: "admin",
    name: "Admin", 
    description: "Full system access and management"
  },
  {
    id: "guest",
    name: "Guest",
    description: "View-only access to all data" 
  }
]