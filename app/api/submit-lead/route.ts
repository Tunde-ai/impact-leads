import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const {
      full_name,
      phone,
      email,
      address,
      city,
      zip,
      window_count,
      door_count,
      urgency,
      homeowner,
      notes,
      utm_campaign,
      utm_source,
      utm_medium
    } = body

    // Validate required fields
    if (!full_name || !phone || !address) {
      return NextResponse.json(
        { error: 'Name, phone, and address are required' },
        { status: 400 }
      )
    }

    try {
      // Insert lead into database with source = 'form'
      const { data, error: insertError } = await supabaseAdmin
        .from('leads')
        .insert({
          full_name,
          phone,
          email: email || null,
          address,
          city: city || null,
          zip: zip || null,
          window_count: window_count ?
            (window_count === '1-5' ? 3 :
             window_count === '6-10' ? 8 :
             window_count === '11-20' ? 15 : 25) : null,
          door_count: door_count === 'None' ? 0 :
                     door_count === '1-2' ? 1 :
                     door_count === '3+' ? 3 : null,
          urgency: urgency || null,
          homeowner: homeowner === 'Yes',
          notes: notes || null,
          source: 'form',
          utm_campaign: utm_campaign || null,
          utm_source: utm_source || null,
          utm_medium: utm_medium || null,
          status: 'new'
        })
        .select('id')
        .single()

      if (insertError) {
        console.error('Database insert error:', insertError)
        return NextResponse.json(
          { error: 'Unable to process your request' },
          { status: 500 }
        )
      }

      const leadId = data.id

      // Call score-leads API to score the new lead immediately
      try {
        await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/score-leads`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ leadId })
        })
      } catch (scoreError) {
        console.error('Failed to score lead:', scoreError)
        // Continue - scoring failure shouldn't fail the form submission
      }

      // Get the scored lead to check if we need to alert Dennis
      try {
        const { data: scoredLead } = await supabaseAdmin
          .from('leads')
          .select('score')
          .eq('id', leadId)
          .single()

        // If score >= 70, call alert-dennis API
        if (scoredLead?.score && scoredLead.score >= 70) {
          try {
            await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/alert-dennis`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ lead_id: leadId })
            })
          } catch (alertError) {
            console.error('Failed to alert Dennis:', alertError)
            // Continue - alert failure shouldn't fail the form submission
          }
        }
      } catch (checkError) {
        console.error('Failed to check lead score:', checkError)
        // Continue - checking score failure shouldn't fail the form submission
      }

      return NextResponse.json({
        success: true,
        lead_id: leadId
      })

    } catch (dbError) {
      console.error('Database operation failed:', dbError)
      return NextResponse.json(
        { error: 'Unable to process your request' },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('Submit lead error:', error)
    return NextResponse.json(
      { error: 'Invalid request format' },
      { status: 400 }
    )
  }
}