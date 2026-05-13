import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import * as cheerio from 'cheerio'

interface ScrapedResult {
  title: string
  body: string
  url: string
  date: string
  platform: 'reddit' | 'craigslist'
  subreddit?: string
  city?: string
}

// Intent keywords for Florida impact windows
const KEYWORDS = [
  'impact windows',
  'hurricane windows',
  'window quote',
  'replace windows florida',
  'impact doors'
]

export async function POST(request: NextRequest) {
  try {
    const allResults: ScrapedResult[] = []

    // SOURCE 1 — REDDIT PUBLIC API
    console.log('Scraping Reddit for impact windows intent...')

    for (const keyword of KEYWORDS) {
      try {
        const redditUrl = `https://www.reddit.com/search.json?q=${encodeURIComponent(keyword + ' florida')}&limit=25&sort=new`

        const response = await fetch(redditUrl, {
          headers: {
            'User-Agent': 'Impact-Windows-Lead-Bot/1.0'
          }
        })

        if (!response.ok) {
          console.error(`Reddit API error for keyword "${keyword}":`, response.status)
          continue
        }

        const data = await response.json()
        const posts = data.data?.children || []

        for (const post of posts) {
          const postData = post.data

          // Skip if no meaningful content
          if (!postData.title && !postData.selftext) continue

          // Convert Unix timestamp to ISO string
          const createdDate = new Date(postData.created_utc * 1000).toISOString()

          allResults.push({
            title: postData.title || '',
            body: postData.selftext || '',
            url: `https://reddit.com${postData.permalink}`,
            date: createdDate,
            platform: 'reddit',
            subreddit: postData.subreddit,
            city: extractCityFromText(`${postData.title} ${postData.selftext}`)
          })
        }

        // Add delay between requests to be respectful
        await new Promise(resolve => setTimeout(resolve, 1000))

      } catch (error) {
        console.error(`Error scraping Reddit for keyword "${keyword}":`, error)
        continue
      }
    }

    // SOURCE 2 — CRAIGSLIST MIAMI
    console.log('Scraping Craigslist Miami...')

    try {
      const craigslistUrl = 'https://miami.craigslist.org/search/sss?query=impact+windows'

      const response = await fetch(craigslistUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      })

      if (response.ok) {
        const html = await response.text()
        const $ = cheerio.load(html)

        $('.cl-static-search-result').each((_, element) => {
          const $element = $(element)

          const title = $element.find('.cl-titlebox a').text().trim()
          const url = $element.find('.cl-titlebox a').attr('href')
          const date = $element.find('.cl-posting-date time').attr('datetime')
          const snippet = $element.find('.cl-posting-body').text().trim()

          if (title && url) {
            allResults.push({
              title,
              body: snippet || '',
              url: url.startsWith('http') ? url : `https://miami.craigslist.org${url}`,
              date: date || new Date().toISOString(),
              platform: 'craigslist',
              city: 'Miami'
            })
          }
        })
      }
    } catch (error) {
      console.error('Error scraping Craigslist:', error)
    }

    console.log(`Found ${allResults.length} total results across all sources`)

    // Check for existing URLs to avoid duplicates
    const existingUrls = new Set()
    if (allResults.length > 0) {
      const urls = allResults.map(r => r.url)
      const { data: existingLeads } = await supabaseAdmin
        .from('leads')
        .select('source_url')
        .in('source_url', urls)

      if (existingLeads) {
        existingLeads.forEach(lead => {
          if (lead.source_url) {
            existingUrls.add(lead.source_url)
          }
        })
      }
    }

    // Filter out duplicates
    const newResults = allResults.filter(result => !existingUrls.has(result.url))
    const skippedCount = allResults.length - newResults.length

    console.log(`${newResults.length} new results, ${skippedCount} duplicates skipped`)

    // Batch insert new leads
    let insertedCount = 0
    if (newResults.length > 0) {
      const leadsToInsert = newResults.map(result => ({
        source: 'scraped',
        source_platform: result.platform,
        source_url: result.url,
        raw_post_text: `${result.title}\n\n${result.body}`.trim(),
        full_name: null, // Unknown from scraping
        city: result.city || extractCityFromText(result.body) || null,
        created_at: result.date
      }))

      const { data: insertedLeads, error: insertError } = await supabaseAdmin
        .from('leads')
        .insert(leadsToInsert)
        .select('id')

      if (insertError) {
        console.error('Failed to insert scraped leads:', insertError)
      } else {
        insertedCount = insertedLeads?.length || 0
        console.log(`Inserted ${insertedCount} new scraped leads`)

        // Call score-leads API to score all the new leads
        if (insertedCount > 0) {
          try {
            await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/score-leads`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              }
            })
            console.log('Triggered lead scoring for new scraped leads')
          } catch (scoreError) {
            console.error('Failed to trigger lead scoring:', scoreError)
          }

          // Check for high-scoring leads and alert Dennis
          // Wait a bit for scoring to complete
          setTimeout(async () => {
            try {
              const { data: highScoreLeads } = await supabaseAdmin
                .from('leads')
                .select('id, score')
                .in('id', insertedLeads.map(l => l.id))
                .gte('score', 70)

              if (highScoreLeads && highScoreLeads.length > 0) {
                for (const lead of highScoreLeads) {
                  try {
                    await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/alert-dennis`, {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                      },
                      body: JSON.stringify({ lead_id: lead.id })
                    })
                  } catch (alertError) {
                    console.error(`Failed to alert Dennis for lead ${lead.id}:`, alertError)
                  }
                }
                console.log(`Alerted Dennis about ${highScoreLeads.length} high-scoring scraped leads`)
              }
            } catch (error) {
              console.error('Failed to check for high-scoring leads:', error)
            }
          }, 5000) // Wait 5 seconds for scoring
        }
      }
    }

    return NextResponse.json({
      success: true,
      found: allResults.length,
      new: insertedCount,
      skipped: skippedCount
    })

  } catch (error) {
    console.error('Scrape error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Extract city from post text
function extractCityFromText(text: string): string | undefined {
  const floridaCities = [
    'Miami', 'Orlando', 'Tampa', 'Jacksonville', 'Fort Lauderdale', 'Tallahassee',
    'St. Petersburg', 'Hialeah', 'Port St. Lucie', 'Cape Coral', 'Pembroke Pines',
    'Hollywood', 'Miramar', 'Gainesville', 'Coral Springs', 'Brandon', 'West Palm Beach',
    'Clearwater', 'Palm Bay', 'Pompano Beach', 'Lakeland', 'Davie', 'Sunrise',
    'Boca Raton', 'Deltona', 'Plantation', 'Alafaya', 'Pine Hills', 'Kendall',
    'Coral Gables', 'Aventura', 'Homestead', 'Key West', 'Naples', 'Sarasota',
    'Fort Myers', 'Kissimmee', 'Ocala', 'Bradenton'
  ]

  const lowerText = text.toLowerCase()

  for (const city of floridaCities) {
    if (lowerText.includes(city.toLowerCase())) {
      return city
    }
  }

  return undefined
}

// Support GET for testing
export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: 'Scrape API endpoint - searches Reddit and Craigslist for Florida impact windows intent',
    keywords: KEYWORDS,
    sources: [
      'Reddit public API (search.json)',
      'Craigslist Miami (impact windows search)'
    ],
    usage: 'POST to trigger scraping, runs automatically via cron every 6 hours'
  })
}