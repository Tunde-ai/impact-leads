import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET() {
  try {
    console.log('Testing Supabase connection...')

    // Test basic connection
    const { data, error } = await supabaseAdmin
      .from('leads')
      .select('count')
      .limit(1)

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json({
        error: 'Supabase connection failed',
        details: error.message
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Supabase connection working',
      data: data
    })

  } catch (error) {
    console.error('Test error:', error)
    return NextResponse.json({
      error: 'Connection test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}