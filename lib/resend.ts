import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY || 'placeholder-api-key')

export { resend }

export interface EmailTemplateProps {
  leads: Array<{
    id: string
    name: string
    email: string
    company?: string
    score?: number
    hot_lead: boolean
    created_at: string
  }>
}

export const sendDailyDigest = async (leads: EmailTemplateProps['leads']) => {
  try {
    const data = await resend.emails.send({
      from: 'Impact Leads <noreply@yourdomain.com>',
      to: [process.env.TUNDE_EMAIL!],
      subject: `Daily Lead Report - ${new Date().toLocaleDateString()}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1>Daily Lead Report</h1>
          <p>Here are today's leads:</p>

          ${leads.length === 0 ?
            '<p>No new leads today.</p>' :
            `<table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
              <thead>
                <tr style="background-color: #f4f4f4;">
                  <th style="border: 1px solid #ddd; padding: 12px; text-align: left;">Name</th>
                  <th style="border: 1px solid #ddd; padding: 12px; text-align: left;">Email</th>
                  <th style="border: 1px solid #ddd; padding: 12px; text-align: left;">Company</th>
                  <th style="border: 1px solid #ddd; padding: 12px; text-align: left;">Score</th>
                  <th style="border: 1px solid #ddd; padding: 12px; text-align: left;">Hot Lead</th>
                </tr>
              </thead>
              <tbody>
                ${leads.map(lead => `
                  <tr style="${lead.hot_lead ? 'background-color: #ffebee;' : ''}">
                    <td style="border: 1px solid #ddd; padding: 12px;">${lead.name}</td>
                    <td style="border: 1px solid #ddd; padding: 12px;">${lead.email}</td>
                    <td style="border: 1px solid #ddd; padding: 12px;">${lead.company || 'N/A'}</td>
                    <td style="border: 1px solid #ddd; padding: 12px;">${lead.score || 'N/A'}</td>
                    <td style="border: 1px solid #ddd; padding: 12px;">
                      ${lead.hot_lead ? '<strong style="color: #d32f2f;">🔥 Hot</strong>' : 'Normal'}
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>`
          }

          <p style="margin-top: 20px; font-size: 14px; color: #666;">
            Total leads: ${leads.length}<br>
            Hot leads: ${leads.filter(l => l.hot_lead).length}
          </p>
        </div>
      `,
    })

    return { success: true, data }
  } catch (error) {
    console.error('Failed to send daily digest:', error)
    return { success: false, error }
  }
}

export const alertDennis = async (lead: {
  name: string
  email: string
  company?: string
  score?: number
  message?: string
}) => {
  try {
    const data = await resend.emails.send({
      from: 'Impact Leads <noreply@yourdomain.com>',
      to: [process.env.DENNIS_EMAIL!],
      subject: `🔥 Hot Lead Alert: ${lead.name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #d32f2f;">🔥 Hot Lead Alert!</h1>
          <p>A new high-value lead has been scored:</p>

          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Lead Details:</h3>
            <p><strong>Name:</strong> ${lead.name}</p>
            <p><strong>Email:</strong> ${lead.email}</p>
            <p><strong>Company:</strong> ${lead.company || 'N/A'}</p>
            <p><strong>Lead Score:</strong> ${lead.score}/100</p>
            ${lead.message ? `<p><strong>Message:</strong> ${lead.message}</p>` : ''}
          </div>

          <p style="font-size: 14px; color: #666;">
            This lead was automatically flagged as hot based on AI scoring.
            Please follow up as soon as possible.
          </p>
        </div>
      `,
    })

    return { success: true, data }
  } catch (error) {
    console.error('Failed to send Dennis alert:', error)
    return { success: false, error }
  }
}