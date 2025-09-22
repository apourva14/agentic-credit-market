import axios from 'axios'
import { 
  convertToWFAPIntent, 
  convertToWFAPOffer, 
  verifyIdentityWFAP,
  processWFAPMessage,
  generateWFAPAuditEntry
} from './wfapService'
import { 
  createCounterOfferMessage,
  createRejectionMessage,
  createAcceptanceMessage,
  MESSAGE_TYPES
} from '../schemas/wfapSchemas'

// Mock identity verification function (legacy - use verifyIdentityWFAP for WFAP compliance)
export const verifyIdentity = async (companyName, intent) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  // Return random boolean for now (80% success rate)
  // return true
  return Math.random() > 0.2
}

// WFAP-compliant identity verification
export const verifyIdentityWFAPCompliant = async (intent) => {
  // Convert to WFAP intent message if not already
  const wfapIntent = intent.messageType === "Intent" ? intent : convertToWFAPIntent(intent)
  
  // Use WFAP verification service
  return await verifyIdentityWFAP(wfapIntent)
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

// Generate WFAP-compliant offer using LLM
export const generateWFAPOfferLLM = async (intent, bankConfig, bankName) => {
  try {
    // Check if API key is available
    if (!import.meta.env.VITE_OPENROUTER_API_KEY) {
      throw new Error('OpenRouter API key is not configured. Please set VITE_OPENROUTER_API_KEY in your environment variables.')
    }

    // Convert intent to WFAP format if not already
    const wfapIntent = intent.messageType === "Intent" ? intent : convertToWFAPIntent(intent)

    // Calculate estimated project emissions
    const estimatedEmissions = calculateProjectEmissions(intent.purpose, intent.amount)

    const systemPrompt = `You are a loan officer for ${bankName} following the WFAP 1.0 protocol. You will receive a WFAP-compliant Intent message and must respond with a structured offer that includes all required WFAP fields.

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

Generate a WFAP-compliant offer that includes all necessary fields and an explanation. Ensure the offer follows the WFAP 1.0 protocol specification.`

    const userContent = `WFAP Intent Message:
{
  "messageId": "${wfapIntent.messageId}",
  "messageType": "Intent",
  "version": "${wfapIntent.version}",
  "senderId": "${wfapIntent.senderId}",
  "senderName": "${wfapIntent.senderName}",
  "senderType": "${wfapIntent.senderType}",
  "productType": "${wfapIntent.productType}",
  "amount": ${wfapIntent.amount},
  "currency": "${wfapIntent.currency}",
  "term": ${wfapIntent.term},
  "purpose": "${wfapIntent.purpose}",
  "maxRate": ${wfapIntent.maxRate || 10.0},
  "esgPriority": "${wfapIntent.esgPriority}",
  "customerProfile": {
    "industry": "${wfapIntent.customerProfile?.industry || 'General Business'}",
    "annualRevenue": ${wfapIntent.customerProfile?.annualRevenue || 1000000},
    "creditScore": ${wfapIntent.customerProfile?.creditScore || 700},
    "esgProfile": "${wfapIntent.customerProfile?.esgProfile || 'Standard'}"
  },
  "esgPreferences": {
    "excludeHighCarbon": ${wfapIntent.esgPreferences?.excludeHighCarbon || false},
    "preferredGreenCertification": "${wfapIntent.esgPreferences?.preferredGreenCertification || 'None'}"
  }
}

Task: Generate a WFAP-compliant Offer message for ${bankName} that responds to this Intent.

IMPORTANT: Format your response as follows:
1. First, provide the JSON offer (exactly as specified below)
2. Then, provide a separate explanation paragraph

Required JSON Schema (WFAP-compliant):
{
  "offer_id": "OFFER_${bankName.replace(/\s+/g, '')}_${Date.now()}",
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
  "estimated_project_emissions": ${estimatedEmissions},
  "esg_rating": [number 1-100],
  "carbon_adjustment": [number],
  "esg_summary": "[detailed ESG assessment]",
  "offer_explanation": "[brief explanation]"
}

After the JSON, provide a detailed explanation paragraph that reflects ${bankName}'s WFAP-compliant approach and ESG considerations.`

    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'gpt-oss-20b:free',
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
    
    // Convert to WFAP Offer message
    const wfapOffer = convertToWFAPOffer(parsedResponse, bankName, wfapIntent)
    
    return {
      content: parsedResponse.content,
      offer: parsedResponse.offer,
      wfapMessage: wfapOffer
    }
  } catch (error) {
    console.error('WFAP Offer generation error:', error)
    throw new Error(`Failed to generate WFAP-compliant offer: ${error.response?.data?.error?.message || error.message}`)
  }
}

// Generate initial bank offer using LLM (legacy function)
export const generateOfferLLM = async (intent, bankConfig, bankName) => {
  try {
    // Check if API key is available
    if (!import.meta.env.VITE_OPENROUTER_API_KEY) {
      throw new Error('OpenRouter API key is not configured. Please set VITE_OPENROUTER_API_KEY in your environment variables.')
    }

    // Calculate estimated project emissions based on purpose and amount
    const estimatedEmissions = calculateProjectEmissions(intent.purpose, intent.amount)

    const systemPrompt = `You are a loan officer for ${bankName}. You will receive a loan request and must respond with a JSON offer and a brief explanation. Only output valid JSON and concise reasoning. Adhere to the bank's policies provided.

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

Task: Based on the above Customer Intent and Bank Configuration, generate the best possible offer from ${bankName}.

IMPORTANT: Format your response as follows:
1. First, provide the JSON offer (exactly as specified below)
2. Then, provide a separate explanation paragraph

Required JSON Schema (exactly as specified):
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
  "estimated_project_emissions": ${estimatedEmissions},
  "esg_rating": [number 1-100],
  "offer_explanation": "[brief explanation]"
}

After the JSON, provide a detailed explanation paragraph that reflects ${bankName}'s config (risk ${bankConfig.risk_appetite}: appropriate terms, and since esg_focus is ${bankConfig.esg_focus}, note any ESG-related adjustments).`

    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'gpt-oss-20b:free',
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

    const systemPrompt = `You are a loan officer for ${bankName}. Based on the ongoing negotiation and your bank's configuration, generate a counter-offer response in JSON format. Consider the company's previous response and adjust terms accordingly while staying within your bank's parameters.

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

Task: Generate a counter-offer from ${bankName} that addresses the customer's concerns while staying within bank parameters.

IMPORTANT: Format your response as follows:
1. First, provide the JSON counter-offer (exactly as specified below)
2. Then, provide a separate explanation paragraph

Required JSON Schema (exactly as specified):
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
  "estimated_project_emissions": ${estimatedEmissions},
  "esg_rating": [number 1-100],
  "offer_explanation": "[brief explanation]"
}

After the JSON, provide a detailed explanation paragraph explaining the changes made and reasoning.`

    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'gpt-oss-20b:free',
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
        model: 'gpt-oss-20b:free',
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

// WFAP-compliant evaluation of all offers
export const evaluateAllOffersWFAP = async (intent, bankOffers, companyConfig) => {
  try {
    // Check if API key is available
    if (!import.meta.env.VITE_OPENROUTER_API_KEY) {
      throw new Error('OpenRouter API key is not configured. Please set VITE_OPENROUTER_API_KEY in your environment variables.')
    }

    // Convert intent to WFAP format if not already
    const wfapIntent = intent.messageType === "Intent" ? intent : convertToWFAPIntent(intent)

    const estimatedEmissions = calculateProjectEmissions(intent.purpose, intent.amount)
    
    // Format all offers for the prompt
    const offersText = bankOffers.map((offer, index) => 
      `Offer ${index + 1} from ${offer.bankName}:
${offer.content}

WFAP Message Details:
- Message ID: ${offer.wfapMessage?.messageId || 'N/A'}
- Approved Amount: $${offer.wfapMessage?.approvedAmount?.toLocaleString() || 'N/A'}
- Interest Rate: ${offer.wfapMessage?.interestRate ? (offer.wfapMessage.interestRate * 100).toFixed(2) + '%' : 'N/A'}
- ESG Score: ${offer.wfapMessage?.esgScore || 'N/A'}
- Carbon Adjustment: ${offer.wfapMessage?.carbonAdjustment || 0}`
    ).join('\n\n')

    const systemPrompt = `You are an AI agent representing ${intent.companyName} following the WFAP 1.0 protocol. You have received multiple WFAP-compliant loan offers from different banks and need to make strategic decisions about which banks to negotiate with and which to reject or accept.

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

WFAP Protocol Requirements:
- All offers must be digitally signed and verified
- Consider ESG impact and carbon adjustments
- Evaluate compliance with regulatory requirements
- Ensure proper message flow and audit trail

Decision Strategy:
1. Identify the best 1-2 offers to focus negotiation on
2. Decide which offers to reject immediately (too expensive, poor terms, ESG conflicts)
3. For top offers, decide whether to accept immediately or negotiate further

Respond with a structured decision that includes:
- Which bank offer to ACCEPT (if any is good enough)
- Which banks to NEGOTIATE with (1-2 banks maximum) 
- Which banks to REJECT outright
- Brief reasoning for each decision
- WFAP compliance considerations

Format your response clearly with sections: ACCEPT, NEGOTIATE, REJECT`

    const userContent = `WFAP Intent Message:
{
  "messageId": "${wfapIntent.messageId}",
  "messageType": "Intent",
  "version": "${wfapIntent.version}",
  "senderId": "${wfapIntent.senderId}",
  "senderName": "${wfapIntent.senderName}",
  "requested_amount": ${wfapIntent.amount},
  "purpose": "${wfapIntent.purpose}",
  "desired_term": ${wfapIntent.term},
  "esgPriority": "${wfapIntent.esgPriority}"
}

All WFAP-Compliant Bank Offers Received:
${offersText}

Task: Based on your company's configuration, WFAP protocol requirements, and ESG considerations, make strategic decisions about these offers. Consider financial terms, ESG impact, carbon adjustments, and alignment with your company's values.

Provide a structured response with clear ACCEPT/NEGOTIATE/REJECT decisions and reasoning, ensuring WFAP protocol compliance.`

    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'gpt-oss-20b:free',
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
    
    // Parse the decision from the response
    const decisions = {
      accept: null,
      negotiate: [],
      reject: []
    }

    // Extract bank decisions from the response
    const lines = responseContent.split('\n')
    let currentSection = null
    
    for (const line of lines) {
      const trimmed = line.trim().toLowerCase()
      if (trimmed.includes('accept')) {
        currentSection = 'accept'
      } else if (trimmed.includes('negotiate')) {
        currentSection = 'negotiate'
      } else if (trimmed.includes('reject')) {
        currentSection = 'reject'
      } else if (currentSection && line.trim()) {
        // Look for bank names in the line
        bankOffers.forEach(offer => {
          if (line.toLowerCase().includes(offer.bankName.toLowerCase())) {
            if (currentSection === 'accept' && !decisions.accept) {
              decisions.accept = offer.bankName
            } else if (currentSection === 'negotiate' && !decisions.negotiate.includes(offer.bankName)) {
              decisions.negotiate.push(offer.bankName)
            } else if (currentSection === 'reject' && !decisions.reject.includes(offer.bankName)) {
              decisions.reject.push(offer.bankName)
            }
          }
        })
      }
    }

    return {
      content: responseContent,
      decisions,
      wfapCompliant: true
    }
  } catch (error) {
    console.error('WFAP evaluation error:', error)
    throw new Error(`Failed to evaluate WFAP offers: ${error.response?.data?.error?.message || error.message}`)
  }
}

// New function for market simulation: Company evaluates all bank offers and makes decisions (legacy)
export const evaluateAllOffersLLM = async (intent, bankOffers, companyConfig) => {
  try {
    // Check if API key is available
    if (!import.meta.env.VITE_OPENROUTER_API_KEY) {
      throw new Error('OpenRouter API key is not configured. Please set VITE_OPENROUTER_API_KEY in your environment variables.')
    }

    const estimatedEmissions = calculateProjectEmissions(intent.purpose, intent.amount)
    
    // Format all offers for the prompt
    const offersText = bankOffers.map((offer, index) => 
      `Offer ${index + 1} from ${offer.bankName}:
${offer.content}`
    ).join('\n\n')

    const systemPrompt = `You are an AI agent representing ${intent.companyName}. You have received multiple loan offers from different banks and need to make strategic decisions about which banks to negotiate with and which to reject or accept.

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

Decision Strategy:
1. Identify the best 1-2 offers to focus negotiation on
2. Decide which offers to reject immediately (too expensive, poor terms, ESG conflicts)
3. For top offers, decide whether to accept immediately or negotiate further

Respond with a structured decision that includes:
- Which bank offer to ACCEPT (if any is good enough)
- Which banks to NEGOTIATE with (1-2 banks maximum) 
- Which banks to REJECT outright
- Brief reasoning for each decision

Format your response clearly with sections: ACCEPT, NEGOTIATE, REJECT`

    const userContent = `Original Intent:
{
  "intent_id": "${intent.id}",
  "customer_id": "${intent.companyName}",
  "requested_amount": ${intent.amount},
  "purpose": "${intent.purpose}",
  "desired_term": ${intent.duration}
}

All Bank Offers Received:
${offersText}

Task: Based on your company's configuration and requirements, make strategic decisions about these offers. Consider financial terms, ESG impact, and alignment with your company's values.

Provide a structured response with clear ACCEPT/NEGOTIATE/REJECT decisions and reasoning.`

    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'gpt-oss-20b:free',
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
    
    // Parse the decision from the response
    const decisions = {
      accept: null,
      negotiate: [],
      reject: []
    }

    // Extract bank decisions from the response
    const lines = responseContent.split('\n')
    let currentSection = null
    
    for (const line of lines) {
      const trimmed = line.trim().toLowerCase()
      if (trimmed.includes('accept')) {
        currentSection = 'accept'
      } else if (trimmed.includes('negotiate')) {
        currentSection = 'negotiate'
      } else if (trimmed.includes('reject')) {
        currentSection = 'reject'
      } else if (currentSection && line.trim()) {
        // Look for bank names in the line
        bankOffers.forEach(offer => {
          if (line.toLowerCase().includes(offer.bankName.toLowerCase())) {
            if (currentSection === 'accept' && !decisions.accept) {
              decisions.accept = offer.bankName
            } else if (currentSection === 'negotiate' && !decisions.negotiate.includes(offer.bankName)) {
              decisions.negotiate.push(offer.bankName)
            } else if (currentSection === 'reject' && !decisions.reject.includes(offer.bankName)) {
              decisions.reject.push(offer.bankName)
            }
          }
        })
      }
    }

    return {
      content: responseContent,
      decisions
    }
  } catch (error) {
    console.error('OpenRouter API error:', error)
    console.error('Error details:', error.response?.data || error.message)
    throw new Error(`Failed to evaluate all offers: ${error.response?.data?.error?.message || error.message}`)
  }
}

// Generate conversation summary for closed deals
export const generateConversationSummary = async (conversation, intent, deal) => {
  try {
    const chatHistory = conversation
      .filter(msg => msg.type !== 'system')
      .map(msg => `${msg.sender}: ${msg.content}`)
      .join('\n')

    const systemPrompt = `You are tasked with creating a comprehensive audit summary of a completed loan negotiation between ${intent.companyName} and ${deal.bankName}. Create a professional summary that includes:

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
        model: 'gpt-oss-20b:free',
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

// ===== ADVANCED WFAP LLM FUNCTIONS =====

/**
 * Generate WFAP counter-offer using LLM with advanced reasoning
 */
export const generateWFAPCounterOfferLLM = async (originalOffer, intent, companyConfig, negotiationHistory = []) => {
  try {
    const systemPrompt = `You are representing ${intent.companyName} in a WFAP (Wells Fargo Agent Protocol) negotiation. You must generate a counter-offer that:

1. Follows WFAP 1.0 protocol standards
2. Considers the company's ESG priorities and financial constraints
3. Provides strategic reasoning for the counter-offer terms
4. Maintains professional negotiation standards

Company Profile:
- Industry: ${intent.industry || 'Technology'}
- Annual Revenue: $${intent.annualRevenue?.toLocaleString() || '5,000,000'}
- Credit Score: ${intent.creditScore || 700}
- ESG Priority: ${intent.esgPriority || 'Medium'}
- Max Acceptable Rate: ${intent.maxRate || 8.0}%

Current Offer Analysis:
- Amount: $${originalOffer.approvedAmount?.toLocaleString()}
- Interest Rate: ${(originalOffer.interestRate * 100).toFixed(2)}%
- Term: ${originalOffer.term} months
- ESG Score: ${originalOffer.esgScore || 'Not provided'}
- Carbon Adjustment: ${originalOffer.carbonAdjustment ? (originalOffer.carbonAdjustment * 100).toFixed(2) + '%' : 'None'}

Generate a counter-offer that strategically improves the terms while remaining realistic and professional.`

    const userContent = `Original Intent:
- Requested Amount: $${intent.amount?.toLocaleString()}
- Desired Term: ${intent.term || intent.duration} months
- Purpose: ${intent.purpose}
- ESG Requirements: ${intent.excludeHighCarbon ? 'Exclude high-carbon projects' : 'No specific exclusions'}

Current Offer:
- Bank: ${originalOffer.senderName}
- Approved Amount: $${originalOffer.approvedAmount?.toLocaleString()}
- Interest Rate: ${(originalOffer.interestRate * 100).toFixed(2)}%
- Term: ${originalOffer.term} months
- ESG Summary: ${originalOffer.esgSummary || 'Standard assessment'}

Negotiation History:
${negotiationHistory.map(msg => `${msg.sender}: ${msg.content}`).join('\n')}

Generate a strategic counter-offer with:
1. Proposed amount (with reasoning)
2. Proposed interest rate (with reasoning)
3. Proposed term (with reasoning)
4. ESG considerations and requirements
5. Rationale for the counter-offer

Format as JSON with the following structure:
{
  "counterAmount": number,
  "counterRate": number (as decimal, e.g., 0.065 for 6.5%),
  "counterTerm": number,
  "rationale": "string",
  "esgRequirements": "string",
  "negotiationStrategy": "string"
}`

    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'gpt-oss-20b:free',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userContent },
        ],
        temperature: 0.7,
        max_tokens: 1000
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_OPENROUTER_API_KEY}`,
        },
      }
    )

    const llmResponse = response.data.choices[0].message.content
    const counterOfferData = JSON.parse(llmResponse)

    // Create WFAP counter-offer message
    const counterOfferMessage = createCounterOfferMessage(originalOffer, intent, counterOfferData)
    
    // Process through WFAP protocol
    const processingResult = await processWFAPMessage(counterOfferMessage)
    
    return {
      message: counterOfferMessage,
      processingResult,
      llmReasoning: counterOfferData
    }
  } catch (error) {
    console.error('WFAP Counter-offer generation error:', error)
    throw new Error('Failed to generate WFAP counter-offer')
  }
}

/**
 * Generate WFAP rejection with detailed reasoning
 */
export const generateWFAPRejectionLLM = async (offer, intent, companyConfig, reason = null) => {
  try {
    const systemPrompt = `You are representing ${intent.companyName} in a WFAP negotiation. Generate a professional rejection message that:

1. Follows WFAP 1.0 protocol standards
2. Provides clear, professional reasoning for the rejection
3. Maintains good business relationships
4. Includes specific feedback for future negotiations

Company Profile:
- Industry: ${intent.industry || 'Technology'}
- ESG Priority: ${intent.esgPriority || 'Medium'}
- Max Acceptable Rate: ${intent.maxRate || 8.0}%`

    const userContent = `Offer to Reject:
- Bank: ${offer.senderName}
- Amount: $${offer.approvedAmount?.toLocaleString()}
- Interest Rate: ${(offer.interestRate * 100).toFixed(2)}%
- Term: ${offer.term} months
- ESG Score: ${offer.esgScore || 'Not provided'}

Original Requirements:
- Requested Amount: $${intent.amount?.toLocaleString()}
- Max Rate: ${intent.maxRate || 8.0}%
- ESG Priority: ${intent.esgPriority || 'Medium'}

${reason ? `Specific Reason: ${reason}` : 'Generate appropriate rejection reasoning based on the offer terms.'}

Generate a professional rejection message that:
1. Acknowledges the offer respectfully
2. Explains the specific reasons for rejection
3. Provides constructive feedback
4. Leaves door open for future negotiations if appropriate

Format as JSON:
{
  "reason": "string",
  "specificIssues": ["string"],
  "suggestions": "string",
  "futureConsiderations": "string"
}`

    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'gpt-oss-20b:free',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userContent },
        ],
        temperature: 0.5,
        max_tokens: 800
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_OPENROUTER_API_KEY}`,
        },
      }
    )

    const llmResponse = response.data.choices[0].message.content
    const rejectionData = JSON.parse(llmResponse)

    // Create WFAP rejection message
    const rejectionMessage = createRejectionMessage(offer, intent, rejectionData.reason)
    
    // Process through WFAP protocol
    const processingResult = await processWFAPMessage(rejectionMessage)
    
    return {
      message: rejectionMessage,
      processingResult,
      llmReasoning: rejectionData
    }
  } catch (error) {
    console.error('WFAP Rejection generation error:', error)
    throw new Error('Failed to generate WFAP rejection')
  }
}

/**
 * Generate WFAP acceptance with decision rationale
 */
export const generateWFAPAcceptanceLLM = async (offer, intent, companyConfig, decisionFactors = {}) => {
  try {
    const systemPrompt = `You are representing ${intent.companyName} in a WFAP negotiation. Generate a professional acceptance message that:

1. Follows WFAP 1.0 protocol standards
2. Provides clear rationale for the acceptance decision
3. Highlights key benefits and considerations
4. Confirms final terms and next steps

Company Profile:
- Industry: ${intent.industry || 'Technology'}
- ESG Priority: ${intent.esgPriority || 'Medium'}
- Credit Score: ${intent.creditScore || 700}`

    const userContent = `Accepted Offer:
- Bank: ${offer.senderName}
- Amount: $${offer.approvedAmount?.toLocaleString()}
- Interest Rate: ${(offer.interestRate * 100).toFixed(2)}%
- Term: ${offer.term} months
- ESG Score: ${offer.esgScore || 'Not provided'}
- Carbon Adjustment: ${offer.carbonAdjustment ? (offer.carbonAdjustment * 100).toFixed(2) + '%' : 'None'}

Original Requirements:
- Requested Amount: $${intent.amount?.toLocaleString()}
- Max Rate: ${intent.maxRate || 8.0}%
- ESG Priority: ${intent.esgPriority || 'Medium'}

Decision Factors:
${Object.entries(decisionFactors).map(([key, value]) => `- ${key}: ${value}`).join('\n')}

Generate a professional acceptance message that:
1. Confirms acceptance of the offer
2. Explains the decision rationale
3. Highlights key benefits (ESG, financial, etc.)
4. Confirms final terms
5. Outlines next steps

Format as JSON:
{
  "decisionRationale": "string",
  "keyBenefits": ["string"],
  "esgConsiderations": "string",
  "finalTerms": {
    "amount": number,
    "rate": number,
    "term": number
  },
  "nextSteps": "string"
}`

    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'gpt-oss-20b:free',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userContent },
        ],
        temperature: 0.5,
        max_tokens: 800
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_OPENROUTER_API_KEY}`,
        },
      }
    )

    const llmResponse = response.data.choices[0].message.content
    const acceptanceData = JSON.parse(llmResponse)

    // Create WFAP acceptance message
    const acceptanceMessage = createAcceptanceMessage(offer, intent)
    
    // Process through WFAP protocol
    const processingResult = await processWFAPMessage(acceptanceMessage)
    
    return {
      message: acceptanceMessage,
      processingResult,
      llmReasoning: acceptanceData
    }
  } catch (error) {
    console.error('WFAP Acceptance generation error:', error)
    throw new Error('Failed to generate WFAP acceptance')
  }
}

/**
 * Analyze WFAP message for compliance and quality
 */
export const analyzeWFAPMessageLLM = async (message, analysisType = 'compliance') => {
  try {
    const systemPrompt = `You are a WFAP (Wells Fargo Agent Protocol) compliance expert. Analyze the provided message for:

1. Protocol compliance (WFAP 1.0 standards)
2. Message quality and completeness
3. Security and verification requirements
4. ESG compliance and impact
5. Business logic and reasonableness

Provide detailed analysis with specific recommendations.`

    const userContent = `Message to Analyze:
Type: ${message.messageType}
ID: ${message.messageId}
Sender: ${message.senderName}
Timestamp: ${message.timestamp}

Message Content:
${JSON.stringify(message, null, 2)}

Analysis Type: ${analysisType}

Provide analysis in JSON format:
{
  "complianceScore": number (0-100),
  "qualityScore": number (0-100),
  "securityScore": number (0-100),
  "esgScore": number (0-100),
  "issues": ["string"],
  "recommendations": ["string"],
  "overallAssessment": "string"
}`

    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'gpt-oss-20b:free',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userContent },
        ],
        temperature: 0.3,
        max_tokens: 1000
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_OPENROUTER_API_KEY}`,
        },
      }
    )

    const llmResponse = response.data.choices[0].message.content
    const analysis = JSON.parse(llmResponse)
    
    // Generate audit entry
    const auditEntry = generateWFAPAuditEntry(message, {
      analysisType,
      analysisResult: analysis,
      analyzedAt: new Date().toISOString()
    })
    
    return {
      analysis,
      auditEntry,
      messageId: message.messageId
    }
  } catch (error) {
    console.error('WFAP Message analysis error:', error)
    throw new Error('Failed to analyze WFAP message')
  }
}

/**
 * Generate WFAP negotiation strategy recommendations
 */
export const generateWFAPStrategyLLM = async (intent, availableOffers, companyConfig, marketConditions = {}) => {
  try {
    const systemPrompt = `You are a WFAP negotiation strategy expert. Analyze the situation and provide strategic recommendations for:

1. Optimal negotiation approach
2. Counter-offer strategies
3. ESG leverage opportunities
4. Risk assessment and mitigation
5. Timeline and urgency considerations

Consider market conditions, company profile, and available options.`

    const userContent = `Negotiation Context:
Company: ${intent.companyName}
Industry: ${intent.industry || 'Technology'}
ESG Priority: ${intent.esgPriority || 'Medium'}
Credit Score: ${intent.creditScore || 700}
Requested Amount: $${intent.amount?.toLocaleString()}

Available Offers:
${availableOffers.map((offer, index) => `
${index + 1}. ${offer.senderName}
   - Amount: $${offer.approvedAmount?.toLocaleString()}
   - Rate: ${(offer.interestRate * 100).toFixed(2)}%
   - ESG Score: ${offer.esgScore || 'N/A'}
   - Term: ${offer.term} months
`).join('\n')}

Market Conditions:
${Object.entries(marketConditions).map(([key, value]) => `- ${key}: ${value}`).join('\n')}

Generate strategic recommendations in JSON format:
{
  "recommendedStrategy": "string",
  "priorityActions": ["string"],
  "esgLeverage": ["string"],
  "riskFactors": ["string"],
  "timelineRecommendations": "string",
  "counterOfferGuidance": "string"
}`

    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'gpt-oss-20b:free',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userContent },
        ],
        temperature: 0.6,
        max_tokens: 1200
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_OPENROUTER_API_KEY}`,
        },
      }
    )

    const llmResponse = response.data.choices[0].message.content
    const strategy = JSON.parse(llmResponse)
    
    return {
      strategy,
      generatedAt: new Date().toISOString(),
      context: {
        intent,
        availableOffers,
        companyConfig,
        marketConditions
      }
    }
  } catch (error) {
    console.error('WFAP Strategy generation error:', error)
    throw new Error('Failed to generate WFAP strategy')
  }
}