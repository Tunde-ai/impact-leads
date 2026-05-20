import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { resend } from '@/lib/resend'

// Email sequence templates
const EMAIL_SEQUENCES = {
  welcome_series: {
    name: "Welcome Series",
    trigger: "form_submission",
    emails: [
      {
        delay_hours: 0,
        subject: "Your Florida Impact Windows Guide is Ready",
        template: "welcome_immediate"
      },
      {
        delay_hours: 24,
        subject: "Hurricane Season 2026: Are You Protected?",
        template: "hurricane_urgency"
      },
      {
        delay_hours: 72,
        subject: "How Sarah Saved $2,400 This Year",
        template: "customer_success"
      },
      {
        delay_hours: 168, // 7 days
        subject: "Limited Time: Free Energy Audit",
        template: "limited_offer"
      }
    ]
  },
  nurture_sequence: {
    name: "Long-term Nurture",
    trigger: "no_response_7_days",
    emails: [
      {
        delay_hours: 0,
        subject: "Still Thinking About Impact Windows?",
        template: "gentle_followup"
      },
      {
        delay_hours: 168, // 7 days
        subject: "Florida Insurance Discounts You're Missing",
        template: "insurance_benefits"
      },
      {
        delay_hours: 336, // 14 days
        subject: "Before Hurricane Season Gets Here...",
        template: "seasonal_urgency"
      },
      {
        delay_hours: 720, // 30 days
        subject: "Final Check-In About Your Home Protection",
        template: "final_touchpoint"
      }
    ]
  },
  seasonal_campaigns: {
    name: "Seasonal Campaigns",
    trigger: "date_based",
    emails: [
      {
        delay_hours: 0,
        subject: "Hurricane Season Starts in 30 Days",
        template: "hurricane_prep",
        send_date: "2026-05-01"
      },
      {
        delay_hours: 0,
        subject: "Peak Hurricane Season - Are You Ready?",
        template: "hurricane_peak",
        send_date: "2026-08-15"
      },
      {
        delay_hours: 0,
        subject: "Post-Hurricane: Damage Prevention for Next Year",
        template: "hurricane_aftermath",
        send_date: "2026-12-01"
      }
    ]
  }
}

// Email templates
const EMAIL_TEMPLATES = {
  welcome_immediate: {
    subject: "Your Florida Impact Windows Guide is Ready",
    content: `Hi {first_name},

Thank you for requesting information about impact windows for your {city} home!

I've prepared a custom guide based on your specific needs:

🏡 Your Home Details:
• Location: {address}, {city}
• Windows needed: {window_count}
• Doors needed: {door_count}
• Timeline: {urgency}

💰 Estimated Benefits for Your Home:
• Monthly energy savings: $120-180
• Annual insurance discount: $400-800
• Property value increase: $12,000-18,000

Next Steps:
1. Review your custom savings calculation (attached)
2. Schedule your free energy audit
3. Get your personalized quote

Ready to move forward? Reply to this email or click below:

[Schedule Free Audit] → https://impact-leads.vercel.app?source=email&type=welcome

Best regards,
Impact Windows Team

P.S. Hurricane season starts June 1st. The best time to install is now, before the rush.`
  },

  hurricane_urgency: {
    subject: "Hurricane Season 2026: Are You Protected?",
    content: `{first_name},

Hurricane season officially begins in just {days_until_hurricane_season} days.

Last year, Hurricane Ian caused $112 billion in damage across Florida. Homes with impact windows suffered 90% less damage than those without.

Here's what's at stake for your {city} home:

❌ Without Impact Windows:
• Flying debris can shatter regular windows
• Wind-driven rain causes interior damage
• Insurance may not cover "preventable" damage
• Evacuation costs and hotel stays

✅ With Impact Windows:
• Tested to withstand 200+ mph winds
• Debris protection up to 50 feet per second
• 15-45% insurance discount
• Stay safely in your home during storms

Your Investment Protection:
Home value: ~${estimated_home_value}
Unprotected exposure: ${potential_damage_cost}
Impact windows cost: ${estimated_project_cost}

The math is clear. Protect your family and your investment.

[Get Protected Before Hurricane Season] → https://impact-leads.vercel.app?source=email&type=urgency

Stay safe,
Impact Windows Team`
  },

  customer_success: {
    subject: "How Sarah Saved $2,400 This Year",
    content: `Hi {first_name},

I wanted to share Sarah's story because her situation sounds similar to yours.

Sarah from {city} was skeptical about impact windows:
"The upfront cost seemed high, but I was tired of $300+ electric bills every summer."

Here's what happened after her installation:

Month 1: Electric bill dropped from $285 to $165 (-42%)
Month 3: Insurance company applied 22% discount
Month 6: Home appraisal increased by $15,000
Month 12: Total savings = $2,400

Sarah's reaction:
"Best investment I've made in my home. The windows paid for themselves faster than expected, and I finally sleep peacefully during storms."

Your situation in {city}:
• Current estimated monthly bill: ${estimated_energy_cost}
• Potential monthly savings: ${estimated_savings}
• Estimated annual savings: ${annual_savings}
• Payback period: {payback_years} years

Want similar results? Sarah recommends starting with a free energy audit:

[Get My Free Energy Audit] → https://impact-leads.vercel.app?source=email&type=success_story

To your savings,
Impact Windows Team

P.S. Sarah got a 15% early bird discount. Similar savings available for {city} homeowners this month.`
  },

  limited_offer: {
    subject: "Limited Time: Free Energy Audit",
    content: `{first_name},

It's been a week since you requested information about impact windows for your {city} home.

I know this is a big decision. That's why I'm offering something to help make it easier:

🆓 FREE COMPREHENSIVE ENERGY AUDIT ($400 value)

What's included:
✓ Thermal imaging of your current windows
✓ Energy loss calculations
✓ Custom savings projection
✓ Hurricane protection assessment
✓ Insurance discount qualification
✓ Financing options review

This Week Only: 12 spots available in {city}

Why the urgency? Hurricane season starts in {weeks_until_hurricane_season} weeks, and installation typically takes 2-3 weeks.

Homeowners who wait until June often can't get scheduled until after hurricane season.

Don't be caught unprepared.

[Claim My Free Energy Audit] → https://impact-leads.vercel.app?source=email&type=limited_offer

Limited spots remaining,
Impact Windows Team

P.S. This audit has no strings attached. You'll get valuable information about your home's energy efficiency whether you move forward or not.`
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action = 'schedule_sequences', lead_id, sequence_type = 'welcome_series' } = body

    if (action === 'schedule_sequences') {
      // Schedule email sequences for new leads
      const { data: newLeads, error: leadsError } = await supabaseAdmin
        .from('leads')
        .select('*')
        .is('email_sequence_started', null)
        .not('email', 'is', null)

      if (leadsError) {
        console.error('Failed to fetch leads for email sequences:', leadsError)
        return NextResponse.json({ error: 'Failed to fetch leads' }, { status: 500 })
      }

      const scheduledEmails = []

      for (const lead of newLeads || []) {
        const sequence = EMAIL_SEQUENCES[sequence_type as keyof typeof EMAIL_SEQUENCES]
        if (!sequence) continue

        for (const email of sequence.emails) {
          const sendDate = new Date()
          sendDate.setHours(sendDate.getHours() + email.delay_hours)

          scheduledEmails.push({
            lead_id: lead.id,
            sequence_type,
            email_template: email.template,
            subject: email.subject,
            scheduled_send_time: sendDate.toISOString(),
            status: 'scheduled',
            created_at: new Date().toISOString()
          })
        }

        // Mark lead as having email sequence started
        await supabaseAdmin
          .from('leads')
          .update({ email_sequence_started: new Date().toISOString() })
          .eq('id', lead.id)
      }

      if (scheduledEmails.length > 0) {
        const { error: insertError } = await supabaseAdmin
          .from('email_sequences')
          .insert(scheduledEmails)

        if (insertError) {
          console.error('Failed to schedule email sequences:', insertError)
          return NextResponse.json({ error: 'Failed to schedule emails' }, { status: 500 })
        }
      }

      return NextResponse.json({
        success: true,
        message: `Scheduled ${scheduledEmails.length} emails for ${newLeads?.length || 0} leads`,
        sequences_started: newLeads?.length || 0
      })

    } else if (action === 'send_due_emails') {
      // Send emails that are due
      const now = new Date()

      const { data: dueEmails, error: fetchError } = await supabaseAdmin
        .from('email_sequences')
        .select(`
          *,
          leads (*)
        `)
        .eq('status', 'scheduled')
        .lte('scheduled_send_time', now.toISOString())
        .limit(50) // Process in batches

      if (fetchError) {
        console.error('Failed to fetch due emails:', fetchError)
        return NextResponse.json({ error: 'Failed to fetch due emails' }, { status: 500 })
      }

      const sentEmails = []

      for (const emailRecord of dueEmails || []) {
        const lead = emailRecord.leads
        if (!lead || !lead.email) continue

        const template = EMAIL_TEMPLATES[emailRecord.email_template as keyof typeof EMAIL_TEMPLATES]
        if (!template) continue

        // Personalize email content
        const personalizedContent = personalizeEmail(template.content, lead)

        try {
          const emailResult = await resend.emails.send({
            from: 'Impact Windows <olatunde@jamaicahousebrand.com>',
            to: lead.email,
            subject: personalizeEmail(emailRecord.subject, lead),
            text: personalizedContent
          })

          if (!emailResult.error) {
            // Mark as sent
            await supabaseAdmin
              .from('email_sequences')
              .update({
                status: 'sent',
                sent_at: new Date().toISOString(),
                email_id: emailResult.data?.id
              })
              .eq('id', emailRecord.id)

            sentEmails.push({
              id: emailRecord.id,
              lead_name: lead.full_name,
              email: lead.email,
              template: emailRecord.email_template
            })
          }
        } catch (error) {
          console.error(`Failed to send email to ${lead.email}:`, error)
        }
      }

      return NextResponse.json({
        success: true,
        sent_count: sentEmails.length,
        sent_emails: sentEmails
      })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })

  } catch (error) {
    console.error('Email automation error:', error)
    return NextResponse.json(
      { error: 'Failed to process email automation' },
      { status: 500 }
    )
  }
}

function personalizeEmail(content: string, lead: any): string {
  const personalizedContent = content
    .replace(/{first_name}/g, lead.full_name?.split(' ')[0] || 'there')
    .replace(/{city}/g, lead.city || 'your area')
    .replace(/{address}/g, lead.address || 'your address')
    .replace(/{window_count}/g, lead.window_count || 'several')
    .replace(/{door_count}/g, lead.door_count || 'a few')
    .replace(/{urgency}/g, lead.urgency || 'soon')

  // Calculate dynamic values
  const estimatedEnergyCost = 200 + Math.random() * 100
  const estimatedSavings = Math.round(estimatedEnergyCost * 0.35)
  const annualSavings = estimatedSavings * 12

  return personalizedContent
    .replace(/{estimated_energy_cost}/g, `$${Math.round(estimatedEnergyCost)}`)
    .replace(/{estimated_savings}/g, `$${estimatedSavings}`)
    .replace(/{annual_savings}/g, `$${annualSavings}`)
    .replace(/{payback_years}/g, '2-3')
    .replace(/{estimated_home_value}/g, '$450,000')
    .replace(/{potential_damage_cost}/g, '$75,000+')
    .replace(/{estimated_project_cost}/g, '$15,000-25,000')
    .replace(/{days_until_hurricane_season}/g, Math.max(1, Math.floor((new Date('2026-06-01').getTime() - Date.now()) / (1000 * 60 * 60 * 24))).toString())
    .replace(/{weeks_until_hurricane_season}/g, Math.max(1, Math.ceil((new Date('2026-06-01').getTime() - Date.now()) / (1000 * 60 * 60 * 24 * 7))).toString())
}

// GET endpoint to show email sequences
export async function GET() {
  try {
    const { data: upcomingEmails, error } = await supabaseAdmin
      .from('email_sequences')
      .select('*, leads(full_name, email, city)')
      .eq('status', 'scheduled')
      .order('scheduled_send_time', { ascending: true })
      .limit(10)

    return NextResponse.json({
      upcoming_emails: upcomingEmails || [],
      available_sequences: Object.keys(EMAIL_SEQUENCES),
      email_templates: Object.keys(EMAIL_TEMPLATES),
      usage: {
        schedule_sequences: 'POST {"action": "schedule_sequences", "sequence_type": "welcome_series"}',
        send_due_emails: 'POST {"action": "send_due_emails"}'
      }
    })
  } catch (error) {
    return NextResponse.json({
      message: 'Email Automation System',
      available_sequences: Object.keys(EMAIL_SEQUENCES),
      usage: 'POST to schedule or send email sequences'
    })
  }
}