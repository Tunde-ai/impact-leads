import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { resend } from '@/lib/resend'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { lead_id } = body

    if (!lead_id) {
      return NextResponse.json(
        { error: 'Lead ID is required' },
        { status: 400 }
      )
    }

    // Fetch lead from Supabase by ID
    const { data: lead, error: fetchError } = await supabaseAdmin
      .from('leads')
      .select('*')
      .eq('id', lead_id)
      .single()

    if (fetchError || !lead) {
      console.error('Failed to fetch lead:', fetchError)
      return NextResponse.json(
        { error: 'Lead not found' },
        { status: 404 }
      )
    }

    // Format the created_at date nicely
    const createdAt = new Date(lead.created_at)
    const formattedDate = createdAt.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
    const formattedTime = createdAt.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    })
    const receivedAt = `${formattedDate} at ${formattedTime}`

    // Determine source display
    const sourceDisplay = lead.source_platform || 'Direct Form Submission'

    // Format homeowner status
    const homeownerStatus = lead.homeowner ? 'Yes' : lead.homeowner === false ? 'No' : 'Unknown'

    // Create the email subject
    const subject = `New Hot Lead — ${lead.city || 'Unknown'}, FL | Score: ${lead.score || '??'}/100`

    // Create the plain text email body
    const emailBody = `HOT LEAD ALERT
From: Tunde Ogunjulugbe | Lead Generation Partner

Name: ${lead.full_name || 'Not provided'}
Phone: ${lead.phone || 'Not provided'}
Email: ${lead.email || 'Not provided'}
Address: ${lead.address || 'Not provided'}, ${lead.city || 'Unknown'}, FL ${lead.zip || 'Unknown'}

Windows: ${lead.window_count || 'Not specified'}
Doors: ${lead.door_count || 'Not specified'}
Timeline: ${lead.urgency || 'Not specified'}
Homeowner: ${homeownerStatus}

Lead Score: ${lead.score || '??'}/100
Why: ${lead.score_reason || 'Not available'}

Source: ${sourceDisplay}
Received: ${receivedAt}

---
Call or text this lead directly.
Questions? Tunde at (786) 709-1027
---`

    // Send email via Resend
    const emailResult = await resend.emails.send({
      from: 'olatunde@jamaicahousebrand.com',
      to: 'floridawindowanddoors@gmail.com',
      subject: subject,
      text: emailBody
    })

    if (emailResult.error) {
      console.error('Failed to send Dennis alert:', emailResult.error)
      return NextResponse.json(
        { error: 'Failed to send alert email' },
        { status: 500 }
      )
    }

    // Update lead: status = 'sent_to_dennis', sent_to_dennis_at = NOW()
    const { error: updateError } = await supabaseAdmin
      .from('leads')
      .update({
        status: 'sent_to_dennis',
        sent_to_dennis_at: new Date().toISOString()
      })
      .eq('id', lead_id)

    if (updateError) {
      console.error('Failed to update lead status:', updateError)
      // Continue anyway - email was sent successfully
    }

    return NextResponse.json({
      success: true
    })

  } catch (error) {
    console.error('Alert Dennis error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}