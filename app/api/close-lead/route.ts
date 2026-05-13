import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { resend } from '@/lib/resend'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { lead_id, contract_value } = body

    if (!lead_id || !contract_value) {
      return NextResponse.json(
        { error: 'Lead ID and contract value are required' },
        { status: 400 }
      )
    }

    // Validate contract_value is a positive number
    const contractAmount = parseFloat(contract_value)
    if (isNaN(contractAmount) || contractAmount <= 0) {
      return NextResponse.json(
        { error: 'Contract value must be a positive number' },
        { status: 400 }
      )
    }

    // Update lead in Supabase
    const { data: updatedLead, error: updateError } = await supabaseAdmin
      .from('leads')
      .update({
        status: 'closed',
        closed_at: new Date().toISOString(),
        contract_value: contractAmount
      })
      .eq('id', lead_id)
      .select('*')
      .single()

    if (updateError || !updatedLead) {
      console.error('Failed to update lead:', updateError)
      return NextResponse.json(
        { error: 'Lead not found or failed to update' },
        { status: 404 }
      )
    }

    // Calculate commission (3%)
    const commission = contractAmount * 0.03

    // Fetch total commissions earned across all closed leads
    const { data: closedLeads, error: fetchError } = await supabaseAdmin
      .from('leads')
      .select('commission_earned')
      .eq('status', 'closed')

    let totalEarned = 0
    if (!fetchError && closedLeads) {
      totalEarned = closedLeads.reduce((sum, lead) => {
        return sum + (lead.commission_earned || 0)
      }, 0)
    }

    // Send confirmation email to Tunde
    const emailBody = `CLOSED DEAL

Lead: ${updatedLead.full_name || 'Unknown'}
Contract Value: $${contractAmount.toLocaleString()}
Your Commission (3%): $${commission.toLocaleString()}

Total Commissions Earned To Date: $${totalEarned.toLocaleString()}

---`

    const emailResult = await resend.emails.send({
      from: 'signhere@signaturebytundeo.com',
      to: 'olatunde@jamaicahousebrand.com',
      subject: 'Lead Closed — Commission Earned!',
      text: emailBody
    })

    if (emailResult.error) {
      console.error('Failed to send commission email:', emailResult.error)
      // Continue - lead is already closed successfully
    }

    console.log(`Lead ${lead_id} closed for $${contractAmount}, commission: $${commission}`)

    return NextResponse.json({
      success: true,
      commission: commission
    })

  } catch (error) {
    console.error('Close lead error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}