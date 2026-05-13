import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || 'placeholder-api-key',
})

export interface Lead {
  name: string
  email: string
  phone?: string
  company?: string
  message?: string
  source?: string
  utm_campaign?: string
  utm_source?: string
  utm_medium?: string
}

export interface LeadScore {
  score: number
  reasoning: string
  hotLead: boolean
  factors: {
    companySize?: string
    urgency?: string
    budget?: string
    authority?: string
    fit?: string
  }
}

export const scoreLead = async (lead: Lead): Promise<LeadScore> => {
  try {
    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1000,
      messages: [{
        role: 'user',
        content: `You are an AI lead scoring specialist. Analyze this lead and provide a score from 0-100 based on quality indicators.

Lead Information:
- Name: ${lead.name}
- Email: ${lead.email}
- Company: ${lead.company || 'Not provided'}
- Phone: ${lead.phone || 'Not provided'}
- Message: ${lead.message || 'Not provided'}
- Source: ${lead.source || 'Not provided'}
- UTM Campaign: ${lead.utm_campaign || 'Not provided'}
- UTM Source: ${lead.utm_source || 'Not provided'}
- UTM Medium: ${lead.utm_medium || 'Not provided'}

Scoring Criteria (consider these factors):
1. **Email Quality** (0-20 points): Professional vs personal email, domain credibility
2. **Company Information** (0-20 points): Is company provided? Does it seem legitimate/substantial?
3. **Message Quality** (0-20 points): Specific business need, urgency indicators, budget hints
4. **Contact Completeness** (0-15 points): Phone provided, complete information
5. **Source Quality** (0-15 points): Organic search, referral, paid ads, etc.
6. **Intent Signals** (0-10 points): UTM parameters, specific pages visited

A lead scores 80+ to be flagged as "hot lead" requiring immediate attention.

Respond with a JSON object in this exact format:
{
  "score": 85,
  "reasoning": "High-quality lead with corporate email domain, specific business inquiry showing clear intent and budget awareness. Complete contact information provided.",
  "hotLead": true,
  "factors": {
    "companySize": "Medium enterprise based on email domain",
    "urgency": "Moderate - mentions upcoming project",
    "budget": "Likely qualified - mentions investment",
    "authority": "Appears to be decision maker based on title/company",
    "fit": "Good fit for service offering"
  }
}`
      }]
    })

    const content = message.content[0]
    if (content.type !== 'text') {
      throw new Error('Unexpected response format from Claude')
    }

    const response = JSON.parse(content.text) as LeadScore

    // Validate the response
    if (typeof response.score !== 'number' || response.score < 0 || response.score > 100) {
      throw new Error('Invalid score returned from Claude')
    }

    return response
  } catch (error) {
    console.error('Error scoring lead with Claude:', error)
    // Return a default score if AI fails
    return {
      score: 50,
      reasoning: 'AI scoring failed, manual review required',
      hotLead: false,
      factors: {}
    }
  }
}

export const batchScoreLeads = async (leads: Lead[]): Promise<(LeadScore & { leadIndex: number })[]> => {
  const scores = await Promise.allSettled(
    leads.map(async (lead, index) => {
      const score = await scoreLead(lead)
      return { ...score, leadIndex: index }
    })
  )

  return scores
    .map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value
      } else {
        console.error(`Failed to score lead ${index}:`, result.reason)
        return {
          score: 50,
          reasoning: 'Scoring failed, manual review required',
          hotLead: false,
          factors: {},
          leadIndex: index
        }
      }
    })
}