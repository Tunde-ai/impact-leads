import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  try {
    console.log('Testing environment variables...')

    const envStatus = {
      NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      RESEND_API_KEY: !!process.env.RESEND_API_KEY,
      ANTHROPIC_API_KEY: !!process.env.ANTHROPIC_API_KEY,
      TUNDE_EMAIL: !!process.env.TUNDE_EMAIL,
      DENNIS_EMAIL: !!process.env.DENNIS_EMAIL
    }

    const envValues = {
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL?.slice(0, 30) + '...',
      RESEND_API_KEY_PREFIX: process.env.RESEND_API_KEY?.slice(0, 8) + '...',
      TUNDE_EMAIL: process.env.TUNDE_EMAIL,
      DENNIS_EMAIL: process.env.DENNIS_EMAIL
    }

    return NextResponse.json({
      success: true,
      message: 'Environment variables check',
      status: envStatus,
      values: envValues
    })

  } catch (error) {
    console.error('Env test error:', error)
    return NextResponse.json({
      error: 'Environment test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}