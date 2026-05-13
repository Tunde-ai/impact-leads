import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))
    const { leadId } = body

    let unscoredLeads

    if (leadId) {
      // Score a specific lead
      const { data: specificLead, error: fetchError } = await supabaseAdmin
        .from('leads')
        .select('*')
        .eq('id', leadId)
        .is('scored_at', null)
        .single()

      if (fetchError || !specificLead) {
        console.log(`Lead ${leadId} not found or already scored`)
        return NextResponse.json({
          scored: 0,
          high_quality: 0
        })
      }

      unscoredLeads = [specificLead]
    } else {
      // Fetch all leads where scored_at IS NULL
      const { data, error: fetchError } = await supabaseAdmin
        .from('leads')
        .select('*')
        .is('scored_at', null)
        .order('created_at', { ascending: true })

      if (fetchError) {
        console.error('Failed to fetch unscored leads:', fetchError)
        return NextResponse.json(
          { error: 'Failed to fetch leads' },
          { status: 500 }
        )
      }

      unscoredLeads = data || []
    }

    if (!unscoredLeads || unscoredLeads.length === 0) {
      return NextResponse.json({
        scored: 0,
        high_quality: 0
      })
    }

    console.log(`Found ${unscoredLeads.length} unscored leads`)

    let scored = 0
    let high_quality = 0

    // Process each lead individually
    for (const lead of unscoredLeads) {
      try {
        // Call Anthropic API directly
        const response = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': process.env.ANTHROPIC_API_KEY || '',
            'anthropic-version': '2023-06-01'
          },
          body: JSON.stringify({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 300,
            system: `You are a lead quality scorer for a Florida impact windows and doors company. Score each lead from 0-100 based on:
- Urgency: ASAP = high score, just looking = low score
- Window/door count: more units = higher value
- Homeowner status: non-owners score very low
- Location: South Florida = highest, rest of FL = medium
- Contact completeness: phone + email = better score
Respond ONLY with valid JSON, no markdown:
{ "score": <0-100>, "reason": "<one sentence>" }`,
            messages: [{
              role: 'user',
              content: `Name: ${lead.full_name || 'Not provided'}
City: ${lead.city || 'Not provided'}, ZIP: ${lead.zip || 'Not provided'}
Windows: ${lead.window_count || 'Not provided'}, Doors: ${lead.door_count || 'Not provided'}
Urgency: ${lead.urgency || 'Not provided'}
Homeowner: ${lead.homeowner ? 'Yes' : 'No'}
Notes: ${lead.notes || 'None'}
Source: ${lead.source || 'Not provided'}
Raw text: ${lead.raw_post_text || 'None'}`
            }]
          })
        })

        if (!response.ok) {
          console.error(`Anthropic API error for lead ${lead.id}:`, response.status, response.statusText)
          continue
        }

        const anthropicResult = await response.json()
        const messageContent = anthropicResult.content?.[0]?.text

        if (!messageContent) {
          console.error(`No content returned from Anthropic for lead ${lead.id}`)
          continue
        }

        // Parse the JSON response
        let scoreData
        try {
          // Clean the response in case there's any markdown formatting
          const cleanContent = messageContent.replace(/```json\s*|\s*```/g, '').trim()
          scoreData = JSON.parse(cleanContent)
        } catch (parseError) {
          console.error(`Failed to parse JSON response for lead ${lead.id}:`, messageContent)
          continue
        }

        const score = scoreData.score
        const reason = scoreData.reason

        if (typeof score !== 'number' || score < 0 || score > 100) {
          console.error(`Invalid score for lead ${lead.id}:`, score)
          continue
        }

        // Update the lead in the database
        const { error: updateError } = await supabaseAdmin
          .from('leads')
          .update({
            score: score,
            score_reason: reason,
            scored_at: new Date().toISOString()
          })
          .eq('id', lead.id)

        if (updateError) {
          console.error(`Failed to update lead ${lead.id}:`, updateError)
          continue
        }

        scored++
        if (score >= 70) {
          high_quality++
        }

        console.log(`Scored lead ${lead.id}: ${score}/100 - ${reason}`)

      } catch (error) {
        console.error(`Error processing lead ${lead.id}:`, error)
        continue
      }
    }

    console.log(`Successfully scored ${scored} leads, ${high_quality} are high quality`)

    return NextResponse.json({
      scored,
      high_quality
    })

  } catch (error) {
    console.error('Score leads error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}