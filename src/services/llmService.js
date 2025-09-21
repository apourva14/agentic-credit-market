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

// Generate initial bank offer using LLM
export const generateOfferLLM = async (intent, bankConfig, bankName) => {
  try {
    // Calculate estimated project emissions based on purpose and amount
    const estimatedEmissions = calculateProjectEmissions(intent.purpose, intent.amount)
    
    const systemPrompt = `You are an AI representing ${bankName}, a financial institution. Based on the bank's configuration and the company's credit request, generate a professional loan offer. Be specific about terms including interest rate, duration, collateral requirements, and any conditions.

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

Generate a professional, concise loan offer (2-3 sentences) that reflects the bank's style and requirements. Consider ESG factors if the bank has ESG focus.`

    const userContent = `Company: ${intent.companyName}
Requested Amount: $${intent.amount.toLocaleString()}
Duration: ${intent.duration} months
Purpose: ${intent.purpose}
Estimated Project Emissions: ${estimatedEmissions} tCO2/year`

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
    throw new Error('Failed to generate offer. Please try again.')
  }
}

// Generate bank counter-offer using chat history
export const generateCounterOfferLLM = async (conversation, bankConfig, bankName, intent) => {
  try {
    const chatHistory = conversation.map(msg => 
      `${msg.sender}: ${msg.content}`
    ).join('\n')

    const estimatedEmissions = calculateProjectEmissions(intent.purpose, intent.amount)

    const systemPrompt = `You are an AI representing ${bankName}. Based on the ongoing negotiation and your bank's configuration, generate a counter-offer response. Consider the company's previous response and adjust terms accordingly while staying within your bank's parameters.

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

Generate a professional counter-offer (2-3 sentences) that shows willingness to negotiate while protecting the bank's interests. Consider ESG factors if the bank has ESG focus.`

    const userContent = `Previous conversation:
${chatHistory}

Generate your counter-offer response.`

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
    throw new Error('Failed to generate counter-offer. Please try again.')
  }
}

// Evaluate offer and generate company response
export const evaluateOfferLLM = async (intent, bankOffer, companyConfig, conversation = []) => {
  try {
    const chatHistory = conversation.length > 0 ? 
      conversation.map(msg => `${msg.sender}: ${msg.content}`).join('\n') : 
      'This is the first offer from the bank.'

    const estimatedEmissions = calculateProjectEmissions(intent.purpose, intent.amount)

    const systemPrompt = `You are an AI representing ${intent.companyName}. Based on your company's configuration and the bank's offer, decide whether to accept the offer or provide a counter-offer. Be realistic about what terms are acceptable.

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
- If estimated emissions exceed esg_max_emissions and esg_priority is "High", reject the offer
- If interest rate exceeds max_acceptable_rate, reject or counter-offer
- If amount is less than min_amount_required, reject or counter-offer
- Consider decision_strategy: "ESG_Focused" prioritizes ESG, "Cost_Focused" prioritizes cost, "Balanced" considers both

If the offer is acceptable, respond with acceptance. If not, provide a professional counter-offer (2-3 sentences) that addresses your concerns while being reasonable.`

    const userContent = `Original Request:
Amount: $${intent.amount.toLocaleString()}
Duration: ${intent.duration} months
Purpose: ${intent.purpose}
Estimated Project Emissions: ${estimatedEmissions} tCO2/year

Conversation so far:
${chatHistory}

Current Bank Offer: ${bankOffer}

Respond with either acceptance or a counter-offer.`

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
    
    return {
      content: responseContent,
      isAcceptance
    }
  } catch (error) {
    console.error('OpenRouter API error:', error)
    throw new Error('Failed to evaluate offer. Please try again.')
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