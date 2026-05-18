import { NextRequest, NextResponse } from 'next/server'
import { resend } from '@/lib/resend'

export async function GET() {
  try {
    console.log('Testing Resend email service...')
    console.log('RESEND_API_KEY exists:', !!process.env.RESEND_API_KEY)
    console.log('RESEND_API_KEY starts with re_:', process.env.RESEND_API_KEY?.startsWith('re_'))

    // Test simple email
    const emailResult = await resend.emails.send({
      from: 'olatunde@jamaicahousebrand.com',
      to: 'signhere@signaturebytundeo.com',
      subject: 'Test Email from Impact Leads',
      text: 'This is a test email to verify Resend is working.'
    })

    if (emailResult.error) {
      console.error('Resend error:', emailResult.error)
      return NextResponse.json({
        error: 'Email send failed',
        details: emailResult.error
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Email sent successfully',
      data: emailResult.data
    })

  } catch (error) {
    console.error('Email test error:', error)
    return NextResponse.json({
      error: 'Email test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}