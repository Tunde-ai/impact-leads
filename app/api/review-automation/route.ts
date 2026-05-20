import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { resend } from '@/lib/resend'

// Review request timing and platforms
const REVIEW_SCHEDULE = {
  initial_request: {
    delay_days: 30, // 30 days after project completion
    platforms: ['google', 'yelp', 'angie']
  },
  follow_up_1: {
    delay_days: 45, // 15 days after initial if no response
    platforms: ['facebook', 'bbb']
  },
  follow_up_2: {
    delay_days: 60, // 15 days after follow_up_1 if no response
    platforms: ['nextdoor', 'homeadvisor']
  }
}

// Review platform details
const REVIEW_PLATFORMS = {
  google: {
    name: "Google",
    url: "https://search.google.com/local/writereview",
    priority: 1,
    description: "Most visible to potential customers"
  },
  yelp: {
    name: "Yelp",
    url: "https://www.yelp.com/writeareview/biz/",
    priority: 2,
    description: "Trusted by local homeowners"
  },
  facebook: {
    name: "Facebook",
    url: "https://www.facebook.com/pg/[page]/reviews/",
    priority: 3,
    description: "Social proof for your network"
  },
  angie: {
    name: "Angie's List",
    url: "https://www.angi.com/companyprofile/",
    priority: 2,
    description: "Professional service reviews"
  },
  bbb: {
    name: "Better Business Bureau",
    url: "https://www.bbb.org/us/fl/",
    priority: 3,
    description: "Business credibility"
  },
  nextdoor: {
    name: "Nextdoor",
    url: "https://nextdoor.com/business/",
    priority: 3,
    description: "Neighborhood recommendations"
  },
  homeadvisor: {
    name: "HomeAdvisor",
    url: "https://www.homeadvisor.com/",
    priority: 2,
    description: "Home improvement reviews"
  }
}

// Email templates for review requests
const REVIEW_EMAIL_TEMPLATES = {
  initial_request: {
    subject: "How was your impact windows experience?",
    content: `Hi {customer_name},

It's been about a month since we completed your impact windows installation at {address}.

I hope you're already enjoying:
• Lower energy bills
• Quieter indoor environment
• Peace of mind during storms
• Increased home comfort

Your experience matters to us and helps other {city} homeowners make informed decisions.

Would you mind sharing a quick review? It takes just 2 minutes:

🌟 Google (Most Important): {google_review_link}
🌟 Yelp: {yelp_review_link}
🌟 Facebook: {facebook_review_link}

What to mention in your review:
• Energy savings you've noticed
• Comfort improvements
• Installation experience
• Peace of mind for hurricane season

If you experienced any issues, please reply to this email so we can address them immediately.

Thank you for choosing us for your home protection needs!

Best regards,
The Impact Windows Team

P.S. Reviews help local families find trusted contractors. Your recommendation means the world to us and your neighbors.`
  },

  follow_up_gentle: {
    subject: "Quick favor - 2-minute review?",
    content: `Hi {customer_name},

Following up on my previous email about your impact windows experience.

I know you're busy, but online reviews are how most homeowners find reliable contractors these days.

Your honest feedback would be incredibly helpful:

⭐ Leave a Google review: {google_review_link}

Just share:
• How your energy bills changed
• Your experience with our team
• How you feel about hurricane protection

Takes 2 minutes, helps families in {city} for years.

If there's anything we can improve, please let me know directly.

Thanks so much,
Impact Windows Team`
  },

  follow_up_value: {
    subject: "Help other {city} families find good contractors",
    content: `{customer_name},

Every month, dozens of {city} homeowners ask: "Who can I trust for impact windows?"

Your review helps them find us instead of unreliable contractors.

Quick request: Share your experience here:
{primary_review_link}

What happened after your installation:
✓ Energy bills decreased
✓ Home comfort increased
✓ Hurricane protection in place
✓ Property value improved

Help your neighbors get the same results.

🌟 Quick review: {review_links}

Appreciate your time,
Impact Windows Team

P.S. Happy customers like you are our best marketing. Thank you for helping us grow through referrals and reviews.`
  },

  incentive_offer: {
    subject: "Thank you gift for your review",
    content: `Hi {customer_name},

As a thank you for being such a great customer, I'd like to offer you something special.

Leave us a review on any of these platforms:
• Google: {google_review_link}
• Yelp: {yelp_review_link}
• Facebook: {facebook_review_link}

And receive:
🎁 $50 Home Depot gift card
🏡 Free annual window maintenance check
📞 Priority scheduling for future projects

Simply forward your review screenshot to this email, and we'll send your thank you gift.

Your honest feedback helps other {city} homeowners find quality contractors.

Grateful for your business,
Impact Windows Team

*Limit one gift per household. Offer expires in 30 days.*`
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action = 'schedule_review_requests', lead_id } = body

    if (action === 'schedule_review_requests') {
      // Find completed projects that need review requests
      const { data: completedLeads, error: leadsError } = await supabaseAdmin
        .from('leads')
        .select('*')
        .eq('status', 'closed')
        .not('contract_value', 'is', null)
        .is('review_request_started', null)

      if (leadsError) {
        console.error('Failed to fetch completed leads:', leadsError)
        return NextResponse.json({ error: 'Failed to fetch completed leads' }, { status: 500 })
      }

      const scheduledRequests = []

      for (const lead of completedLeads || []) {
        if (!lead.closed_at || !lead.email) continue

        const closedDate = new Date(lead.closed_at)

        // Schedule initial review request (30 days after completion)
        const initialRequestDate = new Date(closedDate)
        initialRequestDate.setDate(closedDate.getDate() + REVIEW_SCHEDULE.initial_request.delay_days)

        // Schedule follow-ups
        const followUp1Date = new Date(closedDate)
        followUp1Date.setDate(closedDate.getDate() + REVIEW_SCHEDULE.follow_up_1.delay_days)

        const followUp2Date = new Date(closedDate)
        followUp2Date.setDate(closedDate.getDate() + REVIEW_SCHEDULE.follow_up_2.delay_days)

        const requests = [
          {
            lead_id: lead.id,
            request_type: 'initial_request',
            email_template: 'initial_request',
            scheduled_send_time: initialRequestDate.toISOString(),
            platforms: REVIEW_SCHEDULE.initial_request.platforms,
            status: 'scheduled'
          },
          {
            lead_id: lead.id,
            request_type: 'follow_up_1',
            email_template: 'follow_up_gentle',
            scheduled_send_time: followUp1Date.toISOString(),
            platforms: REVIEW_SCHEDULE.follow_up_1.platforms,
            status: 'scheduled'
          },
          {
            lead_id: lead.id,
            request_type: 'follow_up_2',
            email_template: 'incentive_offer',
            scheduled_send_time: followUp2Date.toISOString(),
            platforms: REVIEW_SCHEDULE.follow_up_2.platforms,
            status: 'scheduled'
          }
        ]

        scheduledRequests.push(...requests)

        // Mark lead as having review requests scheduled
        await supabaseAdmin
          .from('leads')
          .update({ review_request_started: new Date().toISOString() })
          .eq('id', lead.id)
      }

      if (scheduledRequests.length > 0) {
        const { error: insertError } = await supabaseAdmin
          .from('review_requests')
          .insert(scheduledRequests)

        if (insertError) {
          console.error('Failed to schedule review requests:', insertError)
          return NextResponse.json({ error: 'Failed to schedule review requests' }, { status: 500 })
        }
      }

      return NextResponse.json({
        success: true,
        message: `Scheduled ${scheduledRequests.length} review requests for ${completedLeads?.length || 0} completed projects`,
        scheduled_leads: completedLeads?.length || 0
      })

    } else if (action === 'send_due_requests') {
      // Send review requests that are due
      const now = new Date()

      const { data: dueRequests, error: fetchError } = await supabaseAdmin
        .from('review_requests')
        .select(`
          *,
          leads (*)
        `)
        .eq('status', 'scheduled')
        .lte('scheduled_send_time', now.toISOString())
        .limit(20) // Process in batches

      if (fetchError) {
        console.error('Failed to fetch due review requests:', fetchError)
        return NextResponse.json({ error: 'Failed to fetch due requests' }, { status: 500 })
      }

      const sentRequests = []

      for (const request of dueRequests || []) {
        const lead = request.leads
        if (!lead || !lead.email) continue

        // Check if customer already left a review (skip if they did)
        const hasRecentReview = await checkForRecentReview(lead.id)
        if (hasRecentReview && request.request_type !== 'initial_request') {
          // Mark as completed, skip sending
          await supabaseAdmin
            .from('review_requests')
            .update({ status: 'skipped_has_review' })
            .eq('id', request.id)
          continue
        }

        const template = REVIEW_EMAIL_TEMPLATES[request.email_template as keyof typeof REVIEW_EMAIL_TEMPLATES]
        if (!template) continue

        // Generate review links
        const reviewLinks = generateReviewLinks(lead, request.platforms)

        // Personalize email content
        const personalizedContent = personalizeReviewEmail(template.content, lead, reviewLinks)

        try {
          const emailResult = await resend.emails.send({
            from: 'Impact Windows <olatunde@jamaicahousebrand.com>',
            to: lead.email,
            subject: personalizeReviewEmail(template.subject, lead, reviewLinks),
            text: personalizedContent
          })

          if (!emailResult.error) {
            // Mark as sent
            await supabaseAdmin
              .from('review_requests')
              .update({
                status: 'sent',
                sent_at: new Date().toISOString(),
                email_id: emailResult.data?.id
              })
              .eq('id', request.id)

            sentRequests.push({
              id: request.id,
              lead_name: lead.full_name,
              email: lead.email,
              request_type: request.request_type
            })
          }
        } catch (error) {
          console.error(`Failed to send review request to ${lead.email}:`, error)
        }
      }

      return NextResponse.json({
        success: true,
        sent_count: sentRequests.length,
        sent_requests: sentRequests
      })

    } else if (action === 'track_review') {
      // Track when a review is received
      const { lead_id, platform, review_url, rating } = body

      if (!lead_id || !platform || !rating) {
        return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
      }

      const { error: trackError } = await supabaseAdmin
        .from('customer_reviews')
        .insert({
          lead_id,
          platform,
          review_url,
          rating,
          received_at: new Date().toISOString()
        })

      if (trackError) {
        console.error('Failed to track review:', trackError)
        return NextResponse.json({ error: 'Failed to track review' }, { status: 500 })
      }

      // Cancel future review requests for this customer
      await supabaseAdmin
        .from('review_requests')
        .update({ status: 'cancelled_review_received' })
        .eq('lead_id', lead_id)
        .eq('status', 'scheduled')

      return NextResponse.json({
        success: true,
        message: 'Review tracked and future requests cancelled'
      })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })

  } catch (error) {
    console.error('Review automation error:', error)
    return NextResponse.json(
      { error: 'Failed to process review automation' },
      { status: 500 }
    )
  }
}

function generateReviewLinks(lead: any, platforms: string[]): { [key: string]: string } {
  const links: { [key: string]: string } = {}

  for (const platform of platforms) {
    const platformData = REVIEW_PLATFORMS[platform as keyof typeof REVIEW_PLATFORMS]
    if (platformData) {
      // In a real implementation, these would be actual review URLs for your business
      links[platform] = `${platformData.url}?business=impact-windows&utm_source=email&utm_medium=review_request&customer=${lead.id}`
    }
  }

  return links
}

function personalizeReviewEmail(content: string, lead: any, reviewLinks: any): string {
  let personalizedContent = content
    .replace(/{customer_name}/g, lead.full_name || 'there')
    .replace(/{address}/g, lead.address || 'your home')
    .replace(/{city}/g, lead.city || 'your area')

  // Replace review links
  for (const [platform, link] of Object.entries(reviewLinks)) {
    const linkPattern = new RegExp(`{${platform}_review_link}`, 'g')
    personalizedContent = personalizedContent.replace(linkPattern, link)
  }

  // Replace generic review links
  const primaryLink = reviewLinks.google || reviewLinks.yelp || Object.values(reviewLinks)[0] || '#'
  personalizedContent = personalizedContent
    .replace(/{primary_review_link}/g, primaryLink)
    .replace(/{review_links}/g, Object.entries(reviewLinks).map(([platform, url]) =>
      `${REVIEW_PLATFORMS[platform as keyof typeof REVIEW_PLATFORMS]?.name}: ${url}`
    ).join('\n'))

  return personalizedContent
}

async function checkForRecentReview(leadId: string): Promise<boolean> {
  const { data, error } = await supabaseAdmin
    .from('customer_reviews')
    .select('id')
    .eq('lead_id', leadId)
    .limit(1)

  return !error && data && data.length > 0
}

// GET endpoint to show review request status
export async function GET() {
  try {
    const { data: upcomingRequests, error } = await supabaseAdmin
      .from('review_requests')
      .select('*, leads(full_name, email, city, closed_at)')
      .eq('status', 'scheduled')
      .order('scheduled_send_time', { ascending: true })
      .limit(10)

    return NextResponse.json({
      upcoming_requests: upcomingRequests || [],
      review_platforms: REVIEW_PLATFORMS,
      schedule: REVIEW_SCHEDULE,
      usage: {
        schedule_requests: 'POST {"action": "schedule_review_requests"}',
        send_due_requests: 'POST {"action": "send_due_requests"}',
        track_review: 'POST {"action": "track_review", "lead_id": "uuid", "platform": "google", "rating": 5}'
      }
    })
  } catch (error) {
    return NextResponse.json({
      message: 'Review Request Automation System',
      platforms: Object.keys(REVIEW_PLATFORMS),
      usage: 'POST to schedule or send review requests'
    })
  }
}