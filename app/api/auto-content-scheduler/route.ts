import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// Content publishing schedule
const PUBLISHING_SCHEDULE = [
  { day: 'Monday', time: '09:00', topic_focus: 'Hurricane Preparation' },
  { day: 'Wednesday', time: '14:00', topic_focus: 'Energy Savings' },
  { day: 'Friday', time: '11:00', topic_focus: 'Property Value' },
  { day: 'Sunday', time: '16:00', topic_focus: 'Insurance Discounts' }
]

// Florida cities to target for local content
const FLORIDA_CITIES = [
  'Miami', 'Orlando', 'Tampa', 'Jacksonville', 'Fort Lauderdale',
  'West Palm Beach', 'Sarasota', 'Naples', 'Fort Myers', 'Gainesville'
]

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action = 'schedule_week', weeks_ahead = 4 } = body

    if (action === 'schedule_week') {
      // Generate content calendar for multiple weeks
      const contentCalendar = []
      const startDate = new Date()

      for (let week = 0; week < weeks_ahead; week++) {
        for (const schedule of PUBLISHING_SCHEDULE) {
          const publishDate = getNextDate(schedule.day, week)
          const targetCity = FLORIDA_CITIES[Math.floor(Math.random() * FLORIDA_CITIES.length)]

          // Generate topic index based on focus
          const topicIndex = getTopicIndex(schedule.topic_focus)

          // Generate content
          const contentResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/generate-content`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              topic_index: topicIndex,
              target_city: targetCity,
              article_type: 'blog'
            })
          })

          if (contentResponse.ok) {
            const contentData = await contentResponse.json()

            const calendarItem = {
              scheduled_date: publishDate.toISOString(),
              scheduled_time: schedule.time,
              day_of_week: schedule.day,
              target_city: targetCity,
              topic_focus: schedule.topic_focus,
              article: contentData.article,
              social_posts: contentData.suggested_social_posts,
              seo_data: contentData.seo_data,
              status: 'scheduled',
              created_at: new Date().toISOString()
            }

            contentCalendar.push(calendarItem)
          }
        }
      }

      // Store content calendar in Supabase
      const { data: savedCalendar, error: saveError } = await supabaseAdmin
        .from('content_calendar')
        .insert(contentCalendar)
        .select('*')

      if (saveError) {
        // If table doesn't exist, create it
        if (saveError.message.includes('does not exist')) {
          await createContentCalendarTable()

          // Try inserting again
          const { data: retryData, error: retryError } = await supabaseAdmin
            .from('content_calendar')
            .insert(contentCalendar)
            .select('*')

          if (retryError) {
            console.error('Failed to save content calendar:', retryError)
            return NextResponse.json({ error: 'Failed to save content calendar' }, { status: 500 })
          }

          return NextResponse.json({
            success: true,
            message: `Scheduled ${contentCalendar.length} articles for ${weeks_ahead} weeks`,
            calendar: retryData,
            next_publish: contentCalendar[0]?.scheduled_date
          })
        }

        console.error('Failed to save content calendar:', saveError)
        return NextResponse.json({ error: 'Failed to save content calendar' }, { status: 500 })
      }

      return NextResponse.json({
        success: true,
        message: `Scheduled ${contentCalendar.length} articles for ${weeks_ahead} weeks`,
        calendar: savedCalendar,
        next_publish: contentCalendar[0]?.scheduled_date
      })

    } else if (action === 'publish_due') {
      // Check for content due to be published
      const now = new Date()
      const currentTime = now.toTimeString().slice(0, 5) // HH:MM format

      const { data: dueContent, error: fetchError } = await supabaseAdmin
        .from('content_calendar')
        .select('*')
        .eq('status', 'scheduled')
        .lte('scheduled_date', now.toISOString().split('T')[0])
        .eq('scheduled_time', currentTime)

      if (fetchError) {
        console.error('Failed to fetch due content:', fetchError)
        return NextResponse.json({ error: 'Failed to fetch due content' }, { status: 500 })
      }

      const publishedItems = []

      if (dueContent && dueContent.length > 0) {
        for (const item of dueContent) {
          // Here you would integrate with your blog platform
          // For now, we'll mark as published and return the data

          const { error: updateError } = await supabaseAdmin
            .from('content_calendar')
            .update({
              status: 'published',
              published_at: new Date().toISOString()
            })
            .eq('id', item.id)

          if (!updateError) {
            publishedItems.push({
              id: item.id,
              headline: item.article.headline,
              target_city: item.target_city,
              social_posts: item.social_posts
            })
          }
        }
      }

      return NextResponse.json({
        success: true,
        published_count: publishedItems.length,
        published_items: publishedItems,
        message: publishedItems.length > 0 ? 'Content published successfully' : 'No content due for publishing'
      })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })

  } catch (error) {
    console.error('Auto content scheduler error:', error)
    return NextResponse.json(
      { error: 'Failed to process content scheduling' },
      { status: 500 }
    )
  }
}

// Helper functions
function getNextDate(dayOfWeek: string, weeksAhead: number): Date {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  const targetDay = days.indexOf(dayOfWeek)

  const today = new Date()
  const currentDay = today.getDay()

  let daysUntilTarget = targetDay - currentDay
  if (daysUntilTarget < 0) daysUntilTarget += 7

  const targetDate = new Date(today)
  targetDate.setDate(today.getDate() + daysUntilTarget + (weeksAhead * 7))

  return targetDate
}

function getTopicIndex(topicFocus: string): number {
  const topicMap: { [key: string]: number } = {
    'Hurricane Preparation': 0,
    'Energy Savings': 1,
    'Insurance Discounts': 2,
    'Property Value': 3,
    'Hurricane Season Updates': 4
  }

  return topicMap[topicFocus] ?? Math.floor(Math.random() * 5)
}

async function createContentCalendarTable() {
  // This would typically be done in your database setup
  // For now, we'll handle it gracefully
  console.log('Content calendar table needs to be created in Supabase')
}

// GET endpoint to show scheduled content
export async function GET() {
  try {
    const { data: scheduledContent, error } = await supabaseAdmin
      .from('content_calendar')
      .select('*')
      .eq('status', 'scheduled')
      .order('scheduled_date', { ascending: true })
      .limit(10)

    if (error && error.message.includes('does not exist')) {
      return NextResponse.json({
        message: 'Content calendar not set up yet',
        setup_required: true,
        usage: 'POST {"action": "schedule_week", "weeks_ahead": 4} to get started'
      })
    }

    return NextResponse.json({
      upcoming_content: scheduledContent || [],
      schedule: PUBLISHING_SCHEDULE,
      target_cities: FLORIDA_CITIES,
      usage: {
        schedule_content: 'POST {"action": "schedule_week", "weeks_ahead": 4}',
        publish_due: 'POST {"action": "publish_due"}'
      }
    })
  } catch (error) {
    return NextResponse.json({
      message: 'Auto Content Scheduler API',
      error: 'Database connection issue',
      usage: 'POST to schedule or publish content'
    })
  }
}