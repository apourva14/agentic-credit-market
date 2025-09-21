import axios from 'axios'

// Mock identity verification function
export const verifyIdentity = async (companyName, intent) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  // Return random boolean for now (80% success rate)
  return Math.random() > 0.2
}

// Generate initial bank offer using LLM
export const generateOfferLLM = async (intent, bankConfig, bankName) => {
  try {
    const systemPrompt = `You are an AI representing ${bankName}, a financial institution. Based on the bank's configuration and the company's credit request, generate a professional loan offer. Be specific about terms including interest rate, duration, collateral requirements, and any conditions.

Bank Configuration:
- Risk Tolerance: ${bankConfig.riskTolerance}
- Preferred Interest Rate Range: ${bankConfig.preferredInterestRate}
- Max Loan Amount: $${bankConfig.maxLoanAmount.toLocaleString()}
- Min Loan Amount: $${bankConfig.minLoanAmount.toLocaleString()}
- Preferred Duration: ${bankConfig.preferredDuration}
- Collateral Requirements: ${bankConfig.requiredCollateral}
- Credit Score Requirement: ${bankConfig.creditScoreRequirement}
- Processing Fee: ${bankConfig.processingFee}
- Negotiation Style: ${bankConfig.negotiationStyle}
- Specializations: ${bankConfig.specializations.join(', ')}

Generate a professional, concise loan offer (2-3 sentences) that reflects the bank's style and requirements.`

    const userContent = `Company: ${intent.companyName}
Requested Amount: $${intent.amount.toLocaleString()}
Duration: ${intent.duration} months
Purpose: ${intent.purpose}`

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

    const systemPrompt = `You are an AI representing ${bankName}. Based on the ongoing negotiation and your bank's configuration, generate a counter-offer response. Consider the company's previous response and adjust terms accordingly while staying within your bank's parameters.

Bank Configuration:
- Risk Tolerance: ${bankConfig.riskTolerance}
- Preferred Interest Rate Range: ${bankConfig.preferredInterestRate}
- Negotiation Style: ${bankConfig.negotiationStyle}
- Flexibility: ${bankConfig.flexibility}

Generate a professional counter-offer (2-3 sentences) that shows willingness to negotiate while protecting the bank's interests.`

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

    const systemPrompt = `You are an AI representing ${intent.companyName}. Based on your company's configuration and the bank's offer, decide whether to accept the offer or provide a counter-offer. Be realistic about what terms are acceptable.

Company Configuration:
- Urgency: ${companyConfig.urgency}
- Acceptable Interest Rate: ${companyConfig.acceptableInterestRate}
- Max Acceptable Rate: ${companyConfig.maxAcceptableRate}%
- Preferred Duration: ${companyConfig.preferredDuration}
- Collateral Availability: ${companyConfig.collateralAvailability}
- Credit Score: ${companyConfig.creditScore}
- Negotiation Style: ${companyConfig.negotiationStyle}
- Priority Factors: ${companyConfig.priorityFactors.join(', ')}

If the offer is acceptable, respond with acceptance. If not, provide a professional counter-offer (2-3 sentences) that addresses your concerns while being reasonable.`

    const userContent = `Original Request:
Amount: $${intent.amount.toLocaleString()}
Duration: ${intent.duration} months
Purpose: ${intent.purpose}

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

Format this as a professional audit report suitable for business documentation.`

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