import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// Target keywords for Florida impact windows
const TARGET_KEYWORDS = {
  primary: [
    'impact windows florida',
    'hurricane windows florida',
    'impact windows miami',
    'hurricane windows miami',
    'impact windows tampa',
    'hurricane windows orlando'
  ],
  secondary: [
    'florida impact window installation',
    'hurricane window replacement florida',
    'energy efficient windows florida',
    'storm windows florida',
    'impact doors florida',
    'window contractor florida'
  ],
  local: [
    '{city} impact windows',
    '{city} hurricane windows',
    '{city} window replacement',
    '{city} window contractor',
    'impact windows near me',
    'hurricane windows near me'
  ]
}

// Florida cities to monitor
const FLORIDA_CITIES = [
  'Miami', 'Tampa', 'Orlando', 'Jacksonville', 'Fort Lauderdale',
  'West Palm Beach', 'Sarasota', 'Naples', 'Fort Myers', 'Gainesville',
  'Tallahassee', 'St. Petersburg', 'Clearwater', 'Hialeah', 'Port St. Lucie'
]

// Competitor domains to monitor
const COMPETITORS = [
  'impactwindowsmiami.com',
  'hurricanewindowsfl.com',
  'floridaimpactwindows.net',
  'stormguardwindows.com',
  'protectiveimpact.com'
]

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action = 'update_rankings', keywords, cities } = body

    if (action === 'update_rankings') {
      // In a real implementation, this would call Google Search Console API
      // or a ranking service like SEMrush/Ahrefs
      // For now, we'll simulate ranking data

      const rankingUpdates = []
      const keywordsToCheck = keywords || [...TARGET_KEYWORDS.primary, ...TARGET_KEYWORDS.secondary]
      const citiesToCheck = cities || FLORIDA_CITIES.slice(0, 5) // Limit for demo

      for (const city of citiesToCheck) {
        for (const keyword of keywordsToCheck) {
          // Replace city placeholder in local keywords
          const localKeyword = keyword.replace('{city}', city.toLowerCase())

          // Simulate ranking data (in production, fetch from SEO API)
          const currentRanking = Math.floor(Math.random() * 50) + 1
          const previousRanking = Math.floor(Math.random() * 50) + 1
          const searchVolume = Math.floor(Math.random() * 1000) + 100
          const competition = Math.random()

          rankingUpdates.push({
            keyword: localKeyword,
            city: city,
            current_position: currentRanking,
            previous_position: previousRanking,
            position_change: currentRanking - previousRanking,
            search_volume: searchVolume,
            competition_score: parseFloat(competition.toFixed(2)),
            tracked_date: new Date().toISOString().split('T')[0],
            page_url: 'https://impact-leads.vercel.app',
            created_at: new Date().toISOString()
          })
        }
      }

      // Save ranking data
      const { error: insertError } = await supabaseAdmin
        .from('seo_rankings')
        .insert(rankingUpdates)

      if (insertError) {
        console.error('Failed to save ranking data:', insertError)
        return NextResponse.json({ error: 'Failed to save rankings' }, { status: 500 })
      }

      return NextResponse.json({
        success: true,
        message: `Updated ${rankingUpdates.length} keyword rankings`,
        rankings_updated: rankingUpdates.length,
        cities_checked: citiesToCheck.length,
        keywords_checked: keywordsToCheck.length
      })

    } else if (action === 'analyze_competitors') {
      // Monitor competitor rankings
      const competitorAnalysis = []

      for (const competitor of COMPETITORS) {
        for (const keyword of TARGET_KEYWORDS.primary) {
          // Simulate competitor ranking data
          const ranking = Math.floor(Math.random() * 30) + 1
          const estimatedTraffic = Math.floor(Math.random() * 5000) + 500

          competitorAnalysis.push({
            competitor_domain: competitor,
            keyword: keyword,
            position: ranking,
            estimated_traffic: estimatedTraffic,
            tracked_date: new Date().toISOString().split('T')[0],
            created_at: new Date().toISOString()
          })
        }
      }

      const { error: competitorError } = await supabaseAdmin
        .from('competitor_rankings')
        .insert(competitorAnalysis)

      if (competitorError) {
        console.error('Failed to save competitor data:', competitorError)
        return NextResponse.json({ error: 'Failed to save competitor analysis' }, { status: 500 })
      }

      return NextResponse.json({
        success: true,
        message: `Analyzed ${competitorAnalysis.length} competitor rankings`,
        competitors_checked: COMPETITORS.length,
        analysis_data: competitorAnalysis.slice(0, 5) // Show sample
      })

    } else if (action === 'generate_seo_report') {
      // Generate comprehensive SEO performance report
      const reportDate = new Date().toISOString().split('T')[0]

      // Get recent ranking data
      const { data: recentRankings, error: rankingsError } = await supabaseAdmin
        .from('seo_rankings')
        .select('*')
        .gte('tracked_date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
        .order('tracked_date', { ascending: false })

      // Get competitor data
      const { data: competitorData, error: competitorError } = await supabaseAdmin
        .from('competitor_rankings')
        .select('*')
        .gte('tracked_date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])

      // Calculate metrics
      const topRankings = recentRankings?.filter(r => r.current_position <= 10) || []
      const improving = recentRankings?.filter(r => r.position_change < 0) || []
      const declining = recentRankings?.filter(r => r.position_change > 0) || []

      const averagePosition = recentRankings?.length > 0
        ? (recentRankings.reduce((sum, r) => sum + r.current_position, 0) / recentRankings.length).toFixed(1)
        : 'N/A'

      // Identify opportunities
      const opportunities = []

      // Keywords ranking 11-20 (potential quick wins)
      const quickWins = recentRankings?.filter(r =>
        r.current_position >= 11 && r.current_position <= 20
      ).sort((a, b) => b.search_volume - a.search_volume).slice(0, 5)

      quickWins?.forEach(kw => {
        opportunities.push({
          type: 'quick_win',
          keyword: kw.keyword,
          current_position: kw.current_position,
          search_volume: kw.search_volume,
          recommendation: `Create targeted content for "${kw.keyword}" - currently ranking ${kw.current_position}`
        })
      })

      // High volume keywords not ranking well
      const contentOpportunities = recentRankings?.filter(r =>
        r.search_volume > 500 && r.current_position > 20
      ).slice(0, 3)

      contentOpportunities?.forEach(kw => {
        opportunities.push({
          type: 'content_opportunity',
          keyword: kw.keyword,
          current_position: kw.current_position,
          search_volume: kw.search_volume,
          recommendation: `High-volume keyword needs dedicated landing page: "${kw.keyword}"`
        })
      })

      const report = {
        report_date: reportDate,
        summary: {
          total_keywords: recentRankings?.length || 0,
          top_10_rankings: topRankings.length,
          average_position: averagePosition,
          improving_keywords: improving.length,
          declining_keywords: declining.length
        },
        top_performers: topRankings.slice(0, 10),
        biggest_improvements: improving.slice(0, 5),
        biggest_declines: declining.slice(0, 5),
        opportunities: opportunities,
        competitor_analysis: {
          total_competitors: COMPETITORS.length,
          avg_competitor_position: competitorData?.length > 0
            ? (competitorData.reduce((sum, c) => sum + c.position, 0) / competitorData.length).toFixed(1)
            : 'N/A'
        },
        recommended_actions: [
          'Create city-specific landing pages for keywords ranking 11-20',
          'Optimize existing content for declining keywords',
          'Build local citations for better local SEO',
          'Create content targeting high-volume opportunity keywords'
        ]
      }

      // Save report
      const { error: reportError } = await supabaseAdmin
        .from('seo_reports')
        .insert({
          report_date: reportDate,
          report_data: report,
          created_at: new Date().toISOString()
        })

      if (reportError) {
        console.error('Failed to save SEO report:', reportError)
      }

      return NextResponse.json({
        success: true,
        report: report
      })

    } else if (action === 'track_local_citations') {
      // Track local business listings and citations
      const localDirectories = [
        'Google My Business',
        'Yelp',
        'Better Business Bureau',
        'Angie\'s List',
        'HomeAdvisor',
        'Thumbtack',
        'Nextdoor',
        'Yellow Pages',
        'Superpages',
        'Chamber of Commerce'
      ]

      const citationData = []

      for (const directory of localDirectories) {
        for (const city of FLORIDA_CITIES.slice(0, 5)) {
          // Simulate citation status
          const isListed = Math.random() > 0.3
          const isAccurate = isListed ? Math.random() > 0.2 : false

          citationData.push({
            directory_name: directory,
            city: city,
            is_listed: isListed,
            is_accurate: isAccurate,
            listing_url: isListed ? `https://${directory.toLowerCase().replace(/\s+/g, '')}.com/impact-windows-${city.toLowerCase()}` : null,
            needs_update: isListed && !isAccurate,
            checked_date: new Date().toISOString().split('T')[0],
            created_at: new Date().toISOString()
          })
        }
      }

      const { error: citationError } = await supabaseAdmin
        .from('local_citations')
        .insert(citationData)

      if (citationError) {
        console.error('Failed to save citation data:', citationError)
        return NextResponse.json({ error: 'Failed to save citation data' }, { status: 500 })
      }

      return NextResponse.json({
        success: true,
        message: `Tracked ${citationData.length} local citations`,
        citation_summary: {
          total_directories: localDirectories.length,
          cities_checked: FLORIDA_CITIES.slice(0, 5).length,
          missing_listings: citationData.filter(c => !c.is_listed).length,
          needs_updates: citationData.filter(c => c.needs_update).length
        }
      })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })

  } catch (error) {
    console.error('SEO monitor error:', error)
    return NextResponse.json(
      { error: 'Failed to process SEO monitoring request' },
      { status: 500 }
    )
  }
}

// GET endpoint to show SEO dashboard
export async function GET() {
  try {
    // Get recent SEO data
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

    const [rankingsData, competitorData, reportsData, citationsData] = await Promise.all([
      supabaseAdmin
        .from('seo_rankings')
        .select('*')
        .gte('tracked_date', thirtyDaysAgo)
        .order('tracked_date', { ascending: false })
        .limit(100),

      supabaseAdmin
        .from('competitor_rankings')
        .select('*')
        .gte('tracked_date', thirtyDaysAgo)
        .limit(50),

      supabaseAdmin
        .from('seo_reports')
        .select('*')
        .order('report_date', { ascending: false })
        .limit(5),

      supabaseAdmin
        .from('local_citations')
        .select('*')
        .gte('checked_date', thirtyDaysAgo)
        .limit(50)
    ])

    return NextResponse.json({
      seo_dashboard: {
        recent_rankings: rankingsData.data || [],
        competitor_analysis: competitorData.data || [],
        recent_reports: reportsData.data || [],
        citation_status: citationsData.data || []
      },
      target_keywords: TARGET_KEYWORDS,
      monitored_cities: FLORIDA_CITIES,
      competitors: COMPETITORS,
      usage: {
        update_rankings: 'POST {"action": "update_rankings"}',
        analyze_competitors: 'POST {"action": "analyze_competitors"}',
        generate_report: 'POST {"action": "generate_seo_report"}',
        track_citations: 'POST {"action": "track_local_citations"}'
      }
    })
  } catch (error) {
    return NextResponse.json({
      message: 'SEO Monitoring Dashboard',
      target_keywords: TARGET_KEYWORDS,
      usage: 'POST to update rankings or generate reports'
    })
  }
}