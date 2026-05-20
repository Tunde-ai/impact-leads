import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || 'placeholder-api-key',
})

// Content topics for Florida impact windows/energy
const CONTENT_TOPICS = [
  {
    title: "Hurricane Preparation",
    keywords: ["hurricane windows", "storm protection", "Florida preparation", "impact windows"],
    angle: "safety and protection"
  },
  {
    title: "Energy Savings",
    keywords: ["energy efficient windows", "Florida cooling costs", "HVAC savings", "electric bill"],
    angle: "cost savings and comfort"
  },
  {
    title: "Insurance Discounts",
    keywords: ["homeowner insurance", "Florida windstorm", "impact window discounts", "insurance savings"],
    angle: "financial benefits"
  },
  {
    title: "Property Value",
    keywords: ["home value increase", "Florida real estate", "window replacement ROI", "property investment"],
    angle: "investment and resale"
  },
  {
    title: "Hurricane Season Updates",
    keywords: ["Florida hurricane season", "storm forecast", "window protection", "home preparation"],
    angle: "timely preparation advice"
  }
]

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { topic_index, article_type = "blog", target_city } = body

    // Get random topic if none specified
    const topicIndex = topic_index ?? Math.floor(Math.random() * CONTENT_TOPICS.length)
    const topic = CONTENT_TOPICS[topicIndex]

    if (!topic) {
      return NextResponse.json({ error: 'Invalid topic index' }, { status: 400 })
    }

    const city = target_city || "Florida"
    const currentDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })

    // Generate SEO-optimized article
    const prompt = `Write a comprehensive, SEO-optimized blog article about ${topic.title.toLowerCase()} for Florida homeowners.

REQUIREMENTS:
- Target audience: Florida homeowners considering impact windows
- Primary keywords: ${topic.keywords.join(', ')}
- Location focus: ${city}
- Angle: ${topic.angle}
- Length: 1200-1500 words
- Include practical tips and actionable advice
- Add local Florida context (hurricane seasons, energy costs, insurance)
- Include a natural call-to-action for energy audits/consultations
- Use engaging, helpful tone (not salesy)
- Include relevant statistics about energy savings or hurricane protection

STRUCTURE:
1. Compelling headline with primary keyword
2. Introduction addressing homeowner concerns
3. 3-4 main sections with subheadings
4. Practical tips and actionable advice
5. Local Florida context and statistics
6. Natural call-to-action conclusion

META DESCRIPTION: Write a 150-character meta description

CURRENT DATE: ${currentDate}

Make this valuable, shareable content that positions the business as helpful experts, not salespeople.`

    const response = await anthropic.messages.create({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 2000,
      messages: [{
        role: 'user',
        content: prompt
      }]
    })

    const generatedContent = response.content[0].type === 'text' ? response.content[0].text : ''

    // Parse the generated content
    const lines = generatedContent.split('\n')
    let headline = ''
    let metaDescription = ''
    let content = ''

    let currentSection = 'content'

    for (const line of lines) {
      const trimmedLine = line.trim()

      if (trimmedLine.toLowerCase().startsWith('headline:') || trimmedLine.toLowerCase().startsWith('title:')) {
        headline = trimmedLine.replace(/^(headline|title):\s*/i, '')
        continue
      }

      if (trimmedLine.toLowerCase().startsWith('meta description:')) {
        metaDescription = trimmedLine.replace(/^meta description:\s*/i, '')
        continue
      }

      if (trimmedLine) {
        content += line + '\n'
      }
    }

    // Generate slug from headline
    const slug = headline
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .substring(0, 50)

    // Generate suggested social media posts
    const socialPosts = [
      `💡 ${topic.title} tip for Florida homeowners: ${content.split('.')[0]}... Read more: [LINK]`,
      `🏡 Did you know? ${topic.keywords[0]} can save Florida homeowners up to 40% on energy costs. Here's how: [LINK]`,
      `🌀 Hurricane season reminder: ${content.split('?')[0]}? Get prepared: [LINK]`
    ]

    return NextResponse.json({
      success: true,
      article: {
        headline: headline || `${topic.title} Guide for ${city} Homeowners`,
        meta_description: metaDescription || `Learn about ${topic.title.toLowerCase()} for Florida homeowners. Energy savings, hurricane protection, and insurance benefits.`,
        content: content.trim(),
        slug,
        topic: topic.title,
        keywords: topic.keywords,
        target_city: city,
        generated_date: currentDate
      },
      suggested_social_posts: socialPosts,
      seo_data: {
        primary_keyword: topic.keywords[0],
        secondary_keywords: topic.keywords.slice(1),
        target_location: city,
        content_angle: topic.angle
      }
    })

  } catch (error) {
    console.error('Content generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate content' },
      { status: 500 }
    )
  }
}

// GET endpoint to show available topics
export async function GET() {
  return NextResponse.json({
    message: 'Content Generation API - Creates SEO-optimized articles for Florida impact windows',
    available_topics: CONTENT_TOPICS.map((topic, index) => ({
      index,
      title: topic.title,
      keywords: topic.keywords,
      angle: topic.angle
    })),
    usage: {
      generate_random: 'POST {} (generates random topic)',
      generate_specific: 'POST {"topic_index": 0, "target_city": "Miami"}',
      parameters: {
        topic_index: 'Optional: 0-4 for specific topic',
        target_city: 'Optional: Target city (default: Florida)',
        article_type: 'Optional: blog, guide, checklist (default: blog)'
      }
    }
  })
}