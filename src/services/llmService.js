import axios from 'axios'

// Mock identity verification function
export const verifyIdentity = async (companyName, intent) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  // Return random boolean for now (80% success rate)
  return true
  return Math.random() > 0.2
}

// Calculate estimated project emissions based on purpose and amount
const calculateProjectEmissions = (purpose, amount) => {
  const purposeLower = purpose.toLowerCase()
  let baseEmissions = 0
  
  // Base emissions per $100k of funding
  if (purposeLower.includes('renewable') || purposeLower.includes('solar') || purposeLower.includes('wind')) {
    baseEmissions = 50 // Low emissions for green projects
  } else if (purposeLower.includes('tech') || purposeLower.includes('software') || purposeLower.includes('digital')) {
    baseEmissions = 100 // Medium-low emissions for tech
  } else if (purposeLower.includes('manufacturing') || purposeLower.includes('production')) {
    baseEmissions = 300 // High emissions for manufacturing
  } else if (purposeLower.includes('energy') || purposeLower.includes('coal') || purposeLower.includes('oil')) {
    baseEmissions = 500 // Very high emissions for fossil fuel projects
  } else {
    baseEmissions = 200 // Default medium emissions
  }
  
  return Math.round((amount / 100000) * baseEmissions)
}

// Parse JSON offer from LLM response
const parseOfferFromResponse = (responseContent) => {
  try {
    // Try to extract JSON from the response
    const jsonMatch = responseContent.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      const offer = JSON.parse(jsonMatch[0])
      return {
        content: responseContent,
        offer: offer
      }
    }
    // If no JSON found, return the content as is
    return {
      content: responseContent,
      offer: null
    }
  } catch (error) {
    console.error('Error parsing offer JSON:', error)
    console.error('Response content:', responseContent)
    // Return the original content even if JSON parsing fails
    return {
      content: responseContent,
      offer: null
    }
  }
}

// Generate initial bank offer using LLM
export const generateOfferLLM = async (intent, bankConfig, bankName) => {
  try {
    // Check if API key is available
    if (!import.meta.env.VITE_OPENROUTER_API_KEY) {
      throw new Error('OpenRouter API key is not configured. Please set VITE_OPENROUTER_API_KEY in your environment variables.')
    }
    
    // Calculate estimated project emissions based on purpose and amount
    const estimatedEmissions = calculateProjectEmissions(intent.purpose, intent.amount)
    
    const systemPrompt = `You are an AI assistant operating as a loan officer for ${bankName}. You will receive a loan request and must respond with a JSON offer and a brief explanation. Only output valid JSON and concise reasoning. Adhere to the bank's policies provided.

Bank Configuration:
- Risk Appetite: ${bankConfig.risk_appetite}
- Interest Rate Range: ${bankConfig.min_interest_rate}% - ${bankConfig.max_interest_rate}%
- Base Rate: ${bankConfig.base_rate}%
- Target Margin: ${bankConfig.target_margin}%
- Max Credit Limit: $${bankConfig.max_credit_limit.toLocaleString()}
- Preferred Sectors: ${bankConfig.preferred_sectors.join(', ')}
- Collateral Policy: ${bankConfig.collateral_policy}
- ESG Focus: ${bankConfig.esg_focus ? 'Yes' : 'No'}
- ESG Exclusions: ${bankConfig.esg_exclusions.join(', ') || 'None'}
- Carbon Threshold: ${bankConfig.carbon_threshold} tCO2/year
- ESG Policy: ${bankConfig.esg_policy}
- Competitive Index: ${bankConfig.competitive_index}/10
- Speed vs Quality: ${bankConfig.speed_vs_quality}

Project Information:
- Estimated Project Emissions: ${estimatedEmissions} tCO2/year
- Project Purpose: ${intent.purpose}

Generate a JSON offer that includes all necessary fields (interest_rate, credit_limit, term_length, fees, ESG metrics, etc.) and an explanation of why these terms were offered. Make sure the explanation aligns with the bank's behavior and ESG policy.`

    const userContent = `Customer Intent:
{
  "intent_id": "${intent.id || 'INTENT_' + Date.now()}",
  "customer_id": "${intent.companyName}",
  "product_type": "business_line_of_credit",
  "requested_amount": ${intent.amount},
  "currency": "USD",
  "purpose": "${intent.purpose}",
  "desired_term": ${intent.duration},
  "customer_profile": {
    "industry": "${intent.industry || 'General Business'}",
    "credit_score": ${intent.creditScore || 700},
    "esg_profile": "${intent.esgProfile || 'Standard'}",
    "annual_revenue": ${intent.annualRevenue || 1000000}
  },
  "esg_preferences": {
    "exclude_high_carbon": ${intent.excludeHighCarbon || false},
    "preferred_green_certification": "${intent.greenCertification || 'None'}"
  }
}

Task: Based on the above Customer Intent and Bank Configuration, generate the best possible offer from ${bankName} in JSON format. Include:
- Interest rate, credit limit, term_length, fees, etc.
- An ESG impact metric (estimated_project_emissions or esg_rating) in the offer.
- An "offer_explanation" field explaining the rationale (one paragraph).

Make sure the explanation reflects ${bankName}'s config (risk ${bankConfig.risk_appetite}: appropriate terms, and since esg_focus is ${bankConfig.esg_focus}, note any ESG-related adjustments).

Required JSON Schema:
{
  "offer_id": "OFFER_[unique_id]",
  "bank_id": "${bankName}",
  "interest_rate": [number],
  "credit_limit": [number],
  "term_length": [number],
  "fees": {
    "origination_fee": [number],
    "annual_fee": [number],
    "early_closure_fee": [number]
  },
  "collateral_required": "[string description]",
  "esg_impact_metric": {
    "estimated_project_emissions": ${estimatedEmissions},
    "esg_rating": [number 1-100]
  },
  "offer_explanation": "[detailed explanation of terms and reasoning]"
}`

    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'openai/gpt-oss-20b:free',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userContent },
        ],
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_OPENROUTER_API_KEY}`,
        },
      }
    )

    const responseContent = response.data.choices[0].message.content
    const parsedResponse = parseOfferFromResponse(responseContent)
    
    return parsedResponse
  } catch (error) {
    console.error('OpenRouter API error:', error)
    console.error('Error details:', error.response?.data || error.message)
    throw new Error(`Failed to generate offer: ${error.response?.data?.error?.message || error.message}`)
  }
}

// Generate bank counter-offer using chat history
export const generateCounterOfferLLM = async (conversation, bankConfig, bankName, intent) => {
  try {
    // Check if API key is available
    if (!import.meta.env.VITE_OPENROUTER_API_KEY) {
      throw new Error('OpenRouter API key is not configured. Please set VITE_OPENROUTER_API_KEY in your environment variables.')
    }
    
    const chatHistory = conversation.map(msg => 
      `${msg.sender}: ${msg.content}`
    ).join('\n')

    const estimatedEmissions = calculateProjectEmissions(intent.purpose, intent.amount)

    const systemPrompt = `You are an AI assistant operating as a loan officer for ${bankName}. Based on the ongoing negotiation and your bank's configuration, generate a counter-offer response in JSON format. Consider the company's previous response and adjust terms accordingly while staying within your bank's parameters.

Bank Configuration:
- Risk Appetite: ${bankConfig.risk_appetite}
- Interest Rate Range: ${bankConfig.min_interest_rate}% - ${bankConfig.max_interest_rate}%
- ESG Focus: ${bankConfig.esg_focus ? 'Yes' : 'No'}
- ESG Exclusions: ${bankConfig.esg_exclusions.join(', ') || 'None'}
- Carbon Threshold: ${bankConfig.carbon_threshold} tCO2/year
- ESG Policy: ${bankConfig.esg_policy}
- Competitive Index: ${bankConfig.competitive_index}/10
- Speed vs Quality: ${bankConfig.speed_vs_quality}
- Collateral Policy: ${bankConfig.collateral_policy}

Project Information:
- Estimated Project Emissions: ${estimatedEmissions} tCO2/year
- Project Purpose: ${intent.purpose}

Generate a JSON counter-offer that shows willingness to negotiate while protecting the bank's interests. Consider ESG factors if the bank has ESG focus.`

    const userContent = `Previous conversation:
${chatHistory}

Task: Generate a counter-offer in JSON format that addresses the customer's concerns while staying within ${bankName}'s parameters. Include:
- Updated interest rate, credit limit, term_length, fees, etc.
- ESG impact metrics and reasoning
- An "offer_explanation" field explaining the changes made

Required JSON Schema:
{
  "offer_id": "OFFER_[unique_id]_COUNTER",
  "bank_id": "${bankName}",
  "interest_rate": [number],
  "credit_limit": [number],
  "term_length": [number],
  "fees": {
    "origination_fee": [number],
    "annual_fee": [number],
    "early_closure_fee": [number]
  },
  "collateral_required": "[string description]",
  "esg_impact_metric": {
    "estimated_project_emissions": ${estimatedEmissions},
    "esg_rating": [number 1-100]
  },
  "offer_explanation": "[detailed explanation of changes and reasoning]"
}`

    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'openai/gpt-oss-20b:free',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userContent },
        ],
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_OPENROUTER_API_KEY}`,
        },
      }
    )

    const responseContent = response.data.choices[0].message.content
    const parsedResponse = parseOfferFromResponse(responseContent)
    
    return parsedResponse
  } catch (error) {
    console.error('OpenRouter API error:', error)
    console.error('Error details:', error.response?.data || error.message)
    throw new Error(`Failed to generate counter-offer: ${error.response?.data?.error?.message || error.message}`)
  }
}

// Evaluate offer and generate company response
export const evaluateOfferLLM = async (intent, bankOffer, companyConfig, conversation = []) => {
  try {
    // Check if API key is available
    if (!import.meta.env.VITE_OPENROUTER_API_KEY) {
      throw new Error('OpenRouter API key is not configured. Please set VITE_OPENROUTER_API_KEY in your environment variables.')
    }
    
    const chatHistory = conversation.length > 0 ? 
      conversation.map(msg => `${msg.sender}: ${msg.content}`).join('\n') : 
      'This is the first offer from the bank.'

    const estimatedEmissions = calculateProjectEmissions(intent.purpose, intent.amount)

    const systemPrompt = `You are an AI agent representing ${intent.companyName}. Your goal is to choose the best financing offer, considering both financial terms and the customer's ESG guidelines. You will be given offers from banks and the original request. If one offer meets the requirements and is favorable, you will accept it on behalf of the customer (and explain why). If none are satisfactory, you will propose up to two counter-offer intents (negotiate) for the top competing offers, with reasoning.

Company Configuration:
- Max Acceptable Rate: ${companyConfig.max_acceptable_rate}%
- Min Amount Required: $${companyConfig.min_amount_required.toLocaleString()}
- ESG Priority: ${companyConfig.esg_priority}
- ESG Max Emissions: ${companyConfig.esg_max_emissions} tCO2/year
- Min ESG Rating: ${companyConfig.min_esg_rating}/100
- Decision Strategy: ${companyConfig.decision_strategy}
- Negotiation Strategy: ${companyConfig.negotiation_strategy}
- Preferred Bank Features: ${companyConfig.preferred_bank_features.join(', ')}

Project Information:
- Estimated Project Emissions: ${estimatedEmissions} tCO2/year
- Project Purpose: ${intent.purpose}

Decision Guidelines:
- Reject any offer with interest > ${companyConfig.max_acceptable_rate}% or credit_limit < $${companyConfig.min_amount_required.toLocaleString()} (doesn't meet basic needs)
- Among acceptable offers, consider ESG impact: prefer offers with lower carbon emissions and higher ESG ratings
- Use ESG-adjusted scoring: Effective_Score = interest_rate + (estimated_project_emissions / 100)
- If esg_priority is "High" and estimated_project_emissions > ${companyConfig.esg_max_emissions}, reject the offer
- Consider decision_strategy: "ESG_Focused" prioritizes ESG, "Cost_Focused" prioritizes cost, "Balanced" considers both

Output format: Either accept the best offer with reasoning, or generate counter-offer intents for negotiation.`

    const userContent = `Original Intent:
{
  "intent_id": "${intent.id || 'INTENT_' + Date.now()}",
  "customer_id": "${intent.companyName}",
  "product_type": "business_line_of_credit",
  "requested_amount": ${intent.amount},
  "currency": "USD",
  "purpose": "${intent.purpose}",
  "desired_term": ${intent.duration},
  "customer_profile": {
    "industry": "${intent.industry || 'General Business'}",
    "credit_score": ${intent.creditScore || 700},
    "esg_profile": "${intent.esgProfile || 'Standard'}",
    "annual_revenue": ${intent.annualRevenue || 1000000}
  },
  "esg_preferences": {
    "exclude_high_carbon": ${intent.excludeHighCarbon || false},
    "preferred_green_certification": "${intent.greenCertification || 'None'}"
  }
}

Conversation so far:
${chatHistory}

Current Bank Offer: ${bankOffer}

Task: Evaluate the above offer against the customer's requirements:
1. Reject any offer with interest > ${companyConfig.max_acceptable_rate}% or credit_limit < $${companyConfig.min_amount_required.toLocaleString()}
2. Among acceptable offers, consider ESG impact using Effective_Score = interest_rate + (estimated_project_emissions / 100)
3. If esg_priority is "High" and estimated_project_emissions > ${companyConfig.esg_max_emissions}, reject the offer

If the offer is acceptable, respond with acceptance and reasoning. If not, provide a professional counter-offer that addresses your concerns while being reasonable.`

    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'openai/gpt-oss-20b:free',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userContent },
        ],
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_OPENROUTER_API_KEY}`,
        },
      }
    )

    const responseContent = response.data.choices[0].message.content
    
    // Determine if this is an acceptance or counter-offer
    const isAcceptance = responseContent.toLowerCase().includes('accept') || 
                        responseContent.toLowerCase().includes('agree') ||
                        responseContent.toLowerCase().includes('deal')
    
    // Try to parse any JSON in the response for structured counter-offers
    const parsedResponse = parseOfferFromResponse(responseContent)
    
    return {
      content: responseContent,
      isAcceptance,
      offer: parsedResponse.offer
    }
  } catch (error) {
    console.error('OpenRouter API error:', error)
    console.error('Error details:', error.response?.data || error.message)
    throw new Error(`Failed to evaluate offer: ${error.response?.data?.error?.message || error.message}`)
  }
}

// Generate conversation summary for closed deals
export const generateConversationSummary = async (conversation, intent, deal) => {
  try {
    const chatHistory = conversation
      .filter(msg => msg.type !== 'system')
      .map(msg => `${msg.sender}: ${msg.content}`)
      .join('\n')

    const systemPrompt = `You are an AI assistant tasked with creating a comprehensive audit summary of a completed loan negotiation between ${intent.companyName} and ${deal.bankName}. Create a professional summary that includes:

1. Final agreed terms (extract from the conversation)
2. Key negotiation points and concessions made
3. Timeline of the negotiation process
4. Participants and their roles
5. Final outcome

Format this as a professional audit report using proper markdown formatting:
- Use # for main title, ## for major sections, ### for subsections
- Use **bold** for important terms and values
- Use bullet points (-) for lists
- Use tables for structured data when appropriate
- Use > blockquotes for important quotes or key decisions
- Use \`code\` formatting for specific terms or amounts
- Ensure proper spacing and readability

Make it suitable for business documentation with clear hierarchy and professional presentation.`

    const userContent = `Negotiation Details:
Company: ${intent.companyName}
Bank: ${deal.bankName}
Original Request: $${intent.amount.toLocaleString()} for ${intent.duration} months
Purpose: ${intent.purpose}

Complete Conversation History:
${chatHistory}

Generate a comprehensive audit summary of this negotiation.`

    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'openai/gpt-oss-20b:free',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userContent },
        ],
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_OPENROUTER_API_KEY}`,
        },
      }
    )

    return response.data.choices[0].message.content
  } catch (error) {
    console.error('OpenRouter API error:', error)
    throw new Error('Failed to generate summary. Please try again.')
  }
}