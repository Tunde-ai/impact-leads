import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { resend } from '@/lib/resend'

export async function POST(request: NextRequest) {
  try {
    // Calculate last 24 hours
    const now = new Date()
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)

    // Fetch all leads created in last 24 hours, sorted by score DESC
    const { data: recentLeads, error: fetchError } = await supabaseAdmin
      .from('leads')
      .select('*')
      .gte('created_at', twentyFourHoursAgo.toISOString())
      .order('score', { ascending: false, nullsFirst: false })

    if (fetchError) {
      console.error('Failed to fetch recent leads:', fetchError)
      return NextResponse.json(
        { error: 'Failed to fetch leads' },
        { status: 500 }
      )
    }

    const leads = recentLeads || []

    // Calculate metrics
    const totalNewLeads = leads.length
    const hotLeads = leads.filter(l => l.score && l.score >= 70)
    const hotLeadsCount = hotLeads.length

    // Calculate average score (only for leads that have been scored)
    const scoredLeads = leads.filter(l => l.score !== null && l.score !== undefined)
    const averageScore = scoredLeads.length > 0
      ? Math.round(scoredLeads.reduce((sum, l) => sum + l.score, 0) / scoredLeads.length)
      : 0

    // Calculate pipeline and commission
    const estimatedPipeline = totalNewLeads * 15000
    const potentialCommission = estimatedPipeline * 0.03

    // Get total commissions earned to date from closed leads
    const { data: closedLeads, error: closedError } = await supabaseAdmin
      .from('leads')
      .select('commission_earned')
      .eq('status', 'closed')

    const totalEarnedToDate = closedLeads && !closedError
      ? closedLeads.reduce((sum, lead) => sum + (lead.commission_earned || 0), 0)
      : 0

    // Format today's date
    const today = now.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })

    // Create email subject
    const subject = `Impact Leads Report — ${today} | ${totalNewLeads} New Leads`

    // Build hot leads section
    let hotLeadsSection = ''
    if (hotLeads.length > 0) {
      hotLeadsSection = hotLeads.map((lead, index) => {
        const rank = index + 1
        return `${rank}. ${lead.full_name || 'Unknown'} | ${lead.city || 'Unknown'} | Score: ${lead.score}/100
   Phone: ${lead.phone || 'Not provided'} | Email: ${lead.email || 'Not provided'}
   Windows: ${lead.window_count || 'Not specified'} | Timeline: ${lead.urgency || 'Not specified'}
   Why: ${lead.score_reason || 'Not available'}
   Status: ${lead.status || 'new'}`
      }).join('\n\n')
    } else {
      hotLeadsSection = 'No hot leads today.'
    }

    // Build all leads section (condensed)
    let allLeadsSection = ''
    if (leads.length > 0) {
      allLeadsSection = leads.map(lead => {
        const score = lead.score ? `${lead.score}` : '??'
        return `${lead.full_name || 'Unknown'} | ${lead.city || 'Unknown'} | ${score} | ${lead.source || 'Unknown'} | ${lead.status || 'new'}`
      }).join('\n')
    } else {
      allLeadsSection = 'No leads today.'
    }

    // Create the email body
    const emailBody = `DAILY LEAD DIGEST
Florida Impact Windows & Doors

Date: ${today}
New Leads: ${totalNewLeads}
Hot Leads (70+): ${hotLeadsCount}
Avg Score: ${averageScore}
Est. Pipeline: $${estimatedPipeline.toLocaleString()}
Potential Commission (3%): $${potentialCommission.toLocaleString()}
Total Earned To Date: $${totalEarnedToDate.toLocaleString()}

--- HOT LEADS ---
${hotLeadsSection}

--- ALL LEADS ---
${allLeadsSection}

---
To mark a lead closed, reply:
CLOSE [lead_id] $[contract_value]
---`

    // Send email via Resend
    const emailResult = await resend.emails.send({
      from: 'olatunde@jamaicahousebrand.com',
      to: 'signhere@signaturebytundeo.com',
      subject: subject,
      text: emailBody
    })

    if (emailResult.error) {
      console.error('Failed to send daily digest:', emailResult.error)
      return NextResponse.json(
        { error: 'Failed to send daily digest' },
        { status: 500 }
      )
    }

    console.log(`Daily digest sent with ${totalNewLeads} leads, ${hotLeadsCount} hot leads`)

    return NextResponse.json({
      success: true,
      leads_sent: totalNewLeads
    })

  } catch (error) {
    console.error('Daily digest error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Also support GET for testing purposes
export async function GET(request: NextRequest) {
  return POST(request)
}