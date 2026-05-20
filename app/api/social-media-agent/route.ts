import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// Social media posting schedule
const SOCIAL_PLATFORMS = {
  facebook: {
    post_times: ['09:00', '13:00', '17:00'], // 3x daily
    content_types: ['tips', 'testimonials', 'educational', 'seasonal'],
    character_limit: 2200,
    hashtag_limit: 30
  },
  instagram: {
    post_times: ['11:00', '15:00', '19:00'], // 3x daily
    content_types: ['visual', 'tips', 'before_after'],
    character_limit: 2200,
    hashtag_limit: 30
  },
  twitter: {
    post_times: ['08:00', '12:00', '16:00', '20:00'], // 4x daily
    content_types: ['tips', 'news', 'quick_facts'],
    character_limit: 280,
    hashtag_limit: 2
  },
  linkedin: {
    post_times: ['09:00', '17:00'], // 2x daily (business hours)
    content_types: ['professional', 'case_studies', 'industry_news'],
    character_limit: 3000,
    hashtag_limit: 5
  },
  nextdoor: {
    post_times: ['10:00', '18:00'], // 2x daily
    content_types: ['neighborhood_tips', 'local_advice', 'helpful_info'],
    character_limit: 1000,
    hashtag_limit: 3
  }
}

// Content templates for different types
const CONTENT_TEMPLATES = {
  tips: [
    "💡 Florida homeowner tip: {tip_content} This can save you ${savings_amount} annually! #FloridaHomes #EnergySavings",
    "🏡 Quick tip for {city} homeowners: {tip_content} Want to learn more? {link} #ImpactWindows #{city}",
    "⚡ Energy saving hack: {tip_content} Perfect for Florida's hot summers! #EnergyEfficiency #Florida"
  ],
  testimonials: [
    "✨ Real results from {city}: '{testimonial_text}' - {customer_name}. {cta} #CustomerSuccess #{city}",
    "🙌 Success story: {customer_name} from {city} {result_description}. See how: {link} #{city} #Energysavings"
  ],
  educational: [
    "📚 Did you know? {fact_content} This is why Florida homeowners choose impact windows. Learn more: {link}",
    "🤔 Common question: '{question}' Answer: {answer_content} #FloridaWindows #FAQ"
  ],
  seasonal: [
    "🌀 Hurricane season reminder: {seasonal_tip} Protect your {city} home: {link} #HurricaneSeason #{city}",
    "☀️ Summer energy bills climbing? {summer_tip} Cool savings ahead: {link} #FloridaSummer #EnergySavings"
  ],
  before_after: [
    "📸 Before & After: {location} home transformation. Energy bills dropped {percentage}%! {link} #Transformation #{city}",
    "🔄 Amazing results in {city}: Old windows vs Impact windows = ${monthly_savings}/month savings! {link}"
  ]
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action = 'schedule_posts', platform = 'all', days_ahead = 7 } = body

    if (action === 'schedule_posts') {
      const socialCalendar = []
      const today = new Date()

      // Generate posts for each platform
      for (const [platformName, config] of Object.entries(SOCIAL_PLATFORMS)) {
        if (platform !== 'all' && platform !== platformName) continue

        for (let day = 0; day < days_ahead; day++) {
          const postDate = new Date(today)
          postDate.setDate(today.getDate() + day)

          for (const postTime of config.post_times) {
            // Generate content for this post
            const contentType = config.content_types[
              Math.floor(Math.random() * config.content_types.length)
            ]

            const postContent = await generateSocialContent(
              contentType,
              platformName,
              config
            )

            if (postContent) {
              socialCalendar.push({
                platform: platformName,
                scheduled_date: postDate.toISOString().split('T')[0],
                scheduled_time: postTime,
                content_type: contentType,
                post_content: postContent.text,
                hashtags: postContent.hashtags,
                media_type: postContent.media_type || null,
                target_url: postContent.target_url || null,
                status: 'scheduled',
                created_at: new Date().toISOString()
              })
            }
          }
        }
      }

      // Save to database
      const { data: savedPosts, error: saveError } = await supabaseAdmin
        .from('social_media_posts')
        .insert(socialCalendar)
        .select('*')

      if (saveError) {
        console.error('Failed to save social media calendar:', saveError)
        return NextResponse.json({ error: 'Failed to save posts' }, { status: 500 })
      }

      return NextResponse.json({
        success: true,
        message: `Scheduled ${socialCalendar.length} social media posts for ${days_ahead} days`,
        posts_by_platform: Object.keys(SOCIAL_PLATFORMS).reduce((acc, platform) => {
          acc[platform] = socialCalendar.filter(p => p.platform === platform).length
          return acc
        }, {} as Record<string, number>),
        next_post: socialCalendar[0]?.scheduled_date
      })

    } else if (action === 'post_now') {
      // Get posts due to be published
      const now = new Date()
      const currentTime = now.toTimeString().slice(0, 5)
      const currentDate = now.toISOString().split('T')[0]

      const { data: duePosts, error: fetchError } = await supabaseAdmin
        .from('social_media_posts')
        .select('*')
        .eq('status', 'scheduled')
        .eq('scheduled_date', currentDate)
        .eq('scheduled_time', currentTime)

      if (fetchError) {
        console.error('Failed to fetch due posts:', fetchError)
        return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 })
      }

      // In a real implementation, you'd post to actual social media APIs
      // For now, we'll mark as "ready_to_post" and return the content
      const readyPosts = []

      if (duePosts && duePosts.length > 0) {
        for (const post of duePosts) {
          const { error: updateError } = await supabaseAdmin
            .from('social_media_posts')
            .update({
              status: 'ready_to_post',
              posted_at: new Date().toISOString()
            })
            .eq('id', post.id)

          if (!updateError) {
            readyPosts.push({
              id: post.id,
              platform: post.platform,
              content: post.post_content,
              hashtags: post.hashtags,
              target_url: post.target_url
            })
          }
        }
      }

      return NextResponse.json({
        success: true,
        ready_posts: readyPosts,
        message: readyPosts.length > 0
          ? `${readyPosts.length} posts ready for publishing`
          : 'No posts due at this time'
      })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })

  } catch (error) {
    console.error('Social media agent error:', error)
    return NextResponse.json(
      { error: 'Failed to process social media request' },
      { status: 500 }
    )
  }
}

async function generateSocialContent(
  contentType: string,
  platform: string,
  config: any
): Promise<{ text: string; hashtags: string[]; media_type?: string; target_url?: string } | null> {

  const templates = CONTENT_TEMPLATES[contentType as keyof typeof CONTENT_TEMPLATES]
  if (!templates) return null

  const template = templates[Math.floor(Math.random() * templates.length)]

  // Sample data - in production, this would come from your content database
  const sampleData = {
    tip_content: "Impact windows can reduce energy costs by up to 40% in Florida's climate",
    savings_amount: "1800",
    city: ["Miami", "Tampa", "Orlando", "Jacksonville"][Math.floor(Math.random() * 4)],
    link: "https://impact-leads.vercel.app?utm_source=social&utm_medium=" + platform,
    testimonial_text: "Our energy bill dropped from $280 to $165 per month!",
    customer_name: "Sarah M.",
    result_description: "saved $2,400 in the first year",
    fact_content: "Florida building codes require impact-resistant windows in high-risk areas",
    question: "Do impact windows really save money?",
    answer_content: "Yes! Most homeowners see 20-40% energy savings plus insurance discounts",
    seasonal_tip: "Don't wait until a storm threatens to upgrade your windows",
    summer_tip: "Impact windows keep cool air in and hot air out",
    location: "Downtown Miami",
    percentage: "35",
    monthly_savings: "120"
  }

  // Replace placeholders with actual data
  let postText = template
  for (const [key, value] of Object.entries(sampleData)) {
    postText = postText.replace(new RegExp(`{${key}}`, 'g'), value)
  }

  // Generate hashtags based on platform and content
  const baseHashtags = ['FloridaHomes', 'ImpactWindows', 'EnergyEfficiency', 'HurricaneProtection']
  const cityHashtags = [sampleData.city]
  const contentHashtags = {
    tips: ['HomeTips', 'EnergySavings'],
    testimonials: ['CustomerSuccess', 'RealResults'],
    educational: ['DidYouKnow', 'FAQ'],
    seasonal: ['HurricaneSeason', 'FloridaSummer'],
    before_after: ['Transformation', 'BeforeAndAfter']
  }

  const allHashtags = [
    ...baseHashtags,
    ...cityHashtags,
    ...(contentHashtags[contentType as keyof typeof contentHashtags] || [])
  ]

  // Limit hashtags based on platform
  const limitedHashtags = allHashtags.slice(0, config.hashtag_limit)

  // Ensure content fits platform character limit
  const maxContentLength = config.character_limit - limitedHashtags.join(' #').length - 10
  if (postText.length > maxContentLength) {
    postText = postText.substring(0, maxContentLength - 3) + '...'
  }

  return {
    text: postText,
    hashtags: limitedHashtags,
    media_type: contentType === 'before_after' ? 'image' : 'text',
    target_url: sampleData.link
  }
}

// GET endpoint to show scheduled posts
export async function GET() {
  try {
    const { data: upcomingPosts, error } = await supabaseAdmin
      .from('social_media_posts')
      .select('*')
      .eq('status', 'scheduled')
      .order('scheduled_date', { ascending: true })
      .order('scheduled_time', { ascending: true })
      .limit(20)

    if (error && error.message.includes('does not exist')) {
      return NextResponse.json({
        message: 'Social media automation not set up yet',
        setup_required: true,
        platforms: Object.keys(SOCIAL_PLATFORMS),
        usage: 'POST {"action": "schedule_posts", "days_ahead": 7} to get started'
      })
    }

    return NextResponse.json({
      upcoming_posts: upcomingPosts || [],
      platforms: SOCIAL_PLATFORMS,
      content_types: Object.keys(CONTENT_TEMPLATES),
      usage: {
        schedule_posts: 'POST {"action": "schedule_posts", "platform": "facebook", "days_ahead": 7}',
        publish_due: 'POST {"action": "post_now"}'
      }
    })
  } catch (error) {
    return NextResponse.json({
      message: 'Social Media Automation Agent',
      platforms: Object.keys(SOCIAL_PLATFORMS),
      usage: 'POST to schedule or publish social media content'
    })
  }
}