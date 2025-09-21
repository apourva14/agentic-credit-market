export const sampleData = {
  intents: [
    {
      id: 1001,
      companyName: "TechStart Solutions",
      amount: 500000,
      duration: 12,
      purpose: "Equipment purchase and expansion",
      status: "open",
      timestamp: "2025-09-20T01:30:00Z"
    },
    {
      id: 1002,
      companyName: "Green Energy Corp",
      amount: 2000000,
      duration: 24,
      purpose: "Solar panel manufacturing facility",
      status: "open",
      timestamp: "2025-09-20T01:15:00Z"
    },
    {
      id: 1003,
      companyName: "HealthTech Innovations",
      amount: 750000,
      duration: 18,
      purpose: "Medical device development",
      status: "open",
      timestamp: "2025-09-20T02:00:00Z"
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
      id: 1000,
      companyName: "Manufacturing Plus",
      winningBank: "Delta Bank",
      amount: 750000,
      duration: 18,
      purpose: "Equipment upgrade and facility expansion",
      timestamp: "2025-09-19T15:45:00Z"
    },
    {
      id: 999,
      companyName: "Retail Dynamics",
      winningBank: "Alpha Bank",
      amount: 300000,
      duration: 12,
      purpose: "Working capital and inventory management",
      timestamp: "2025-09-19T10:30:00Z"
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