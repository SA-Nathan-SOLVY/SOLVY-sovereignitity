import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export interface SendEmailParams {
  to: string | string[]
  subject: string
  html: string
  from?: string
  replyTo?: string
}

export interface WelcomeEmailParams {
  to: string
  firstName: string
  lastName: string
}

export interface KYCStatusEmailParams {
  to: string
  firstName: string
  status: 'approved' | 'rejected' | 'needs_review'
  reason?: string
}

export interface CardIssuedEmailParams {
  to: string
  firstName: string
  cardType: string
  last4: string
}

class EmailService {
  private fromEmail = 'SOLVY <noreply@resend.dev>'

  /**
   * Send a generic email
   */
  async sendEmail({ to, subject, html, from, replyTo }: SendEmailParams) {
    try {
      const { data, error } = await resend.emails.send({
        from: from || this.fromEmail,
        to: Array.isArray(to) ? to : [to],
        subject,
        html,
        replyTo
      })

      if (error) {
        console.error('Email send error:', error)
        throw new Error(`Failed to send email: ${error.message}`)
      }

      console.log('Email sent successfully:', data)
      return { success: true, data }
    } catch (error: any) {
      console.error('Email service error:', error)
      throw error
    }
  }

  /**
   * Send welcome email to new members
   */
  async sendWelcomeEmail({ to, firstName, lastName }: WelcomeEmailParams) {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background: linear-gradient(135deg, #6b46c1 0%, #9333ea 100%);
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 10px 10px 0 0;
          }
          .content {
            background: #f9fafb;
            padding: 30px;
            border-radius: 0 0 10px 10px;
          }
          .button {
            display: inline-block;
            background: linear-gradient(135deg, #6b46c1 0%, #9333ea 100%);
            color: white;
            padding: 15px 30px;
            text-decoration: none;
            border-radius: 8px;
            margin: 20px 0;
            font-weight: bold;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            color: #666;
            font-size: 0.9em;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🛡️ Welcome to SOLVY!</h1>
        </div>
        <div class="content">
          <h2>Hi ${firstName} ${lastName},</h2>
          <p>
            Welcome to the <strong>SOLVY Platform</strong> - your gateway to financial sovereignty 
            and cooperative ownership!
          </p>
          <p>
            Your account has been successfully created. Here's what happens next:
          </p>
          <ol>
            <li><strong>KYC Verification:</strong> Complete your identity verification</li>
            <li><strong>Card Issuance:</strong> Get your SOLVY Card (Visa or Mastercard)</li>
            <li><strong>Start Transacting:</strong> Every purchase builds your ownership stake</li>
          </ol>
          <p style="text-align: center;">
            <a href="https://nitty.ebl.beauty" class="button">
              Access Your Dashboard →
            </a>
          </p>
          <p>
            <strong>Why SOLVY?</strong><br>
            • 0% transaction fees for members<br>
            • Cooperative ownership model<br>
            • Government-issued payment processing<br>
            • Built for veterans, freelancers, and small businesses
          </p>
          <p>
            Questions? Reply to this email or visit our help center.
          </p>
          <p>
            Best regards,<br>
            <strong>The SOLVY Team</strong>
          </p>
        </div>
        <div class="footer">
          <p>
            SOLVY Platform | Evergreen Beauty Lounge<br>
            Arlington, TX | <a href="https://nitty.ebl.beauty">nitty.ebl.beauty</a>
          </p>
        </div>
      </body>
      </html>
    `

    return this.sendEmail({
      to,
      subject: '🛡️ Welcome to SOLVY - Your Account is Ready!',
      html
    })
  }

  /**
   * Send KYC status update email
   */
  async sendKYCStatusEmail({ to, firstName, status, reason }: KYCStatusEmailParams) {
    let html = ''

    if (status === 'approved') {
      html = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background: linear-gradient(135deg, #10b981 0%, #059669 100%);
              color: white;
              padding: 30px;
              text-align: center;
              border-radius: 10px 10px 0 0;
            }
            .content {
              background: #f9fafb;
              padding: 30px;
              border-radius: 0 0 10px 10px;
            }
            .button {
              display: inline-block;
              background: linear-gradient(135deg, #10b981 0%, #059669 100%);
              color: white;
              padding: 15px 30px;
              text-decoration: none;
              border-radius: 8px;
              margin: 20px 0;
              font-weight: bold;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>✅ KYC Approved!</h1>
          </div>
          <div class="content">
            <h2>Great news, ${firstName}!</h2>
            <p>
              Your identity verification has been <strong>approved</strong>. 
              You're now eligible for your SOLVY Card!
            </p>
            <p>
              <strong>Next Steps:</strong>
            </p>
            <ol>
              <li>Choose your card type (Visa or Mastercard)</li>
              <li>Select personal or business card</li>
              <li>Your card will be issued within 7-10 business days</li>
            </ol>
            <p style="text-align: center;">
              <a href="https://nitty.ebl.beauty" class="button">
                Choose Your Card →
              </a>
            </p>
            <p>
              Best regards,<br>
              <strong>The SOLVY Team</strong>
            </p>
          </div>
        </body>
        </html>
      `
    } else if (status === 'rejected') {
      html = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
              color: white;
              padding: 30px;
              text-align: center;
              border-radius: 10px 10px 0 0;
            }
            .content {
              background: #f9fafb;
              padding: 30px;
              border-radius: 0 0 10px 10px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>❌ KYC Verification Issue</h1>
          </div>
          <div class="content">
            <h2>Hi ${firstName},</h2>
            <p>
              Unfortunately, we were unable to verify your identity at this time.
            </p>
            ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
            <p>
              <strong>What you can do:</strong>
            </p>
            <ul>
              <li>Review the information you provided</li>
              <li>Ensure all documents are clear and valid</li>
              <li>Contact support for assistance</li>
            </ul>
            <p>
              Reply to this email if you have questions or need help.
            </p>
            <p>
              Best regards,<br>
              <strong>The SOLVY Team</strong>
            </p>
          </div>
        </body>
        </html>
      `
    } else {
      // needs_review
      html = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
              color: white;
              padding: 30px;
              text-align: center;
              border-radius: 10px 10px 0 0;
            }
            .content {
              background: #f9fafb;
              padding: 30px;
              border-radius: 0 0 10px 10px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>⏳ KYC Under Review</h1>
          </div>
          <div class="content">
            <h2>Hi ${firstName},</h2>
            <p>
              Your identity verification is currently under manual review by our team.
            </p>
            <p>
              This typically happens when:
            </p>
            <ul>
              <li>Additional verification is needed</li>
              <li>Documents require manual inspection</li>
              <li>Routine compliance checks</li>
            </ul>
            <p>
              We'll notify you within 1-2 business days with an update.
            </p>
            <p>
              Best regards,<br>
              <strong>The SOLVY Team</strong>
            </p>
          </div>
        </body>
        </html>
      `
    }

    const subjectMap = {
      approved: '✅ KYC Approved - Get Your SOLVY Card!',
      rejected: '❌ KYC Verification Issue',
      needs_review: '⏳ KYC Under Review'
    }

    return this.sendEmail({
      to,
      subject: subjectMap[status],
      html
    })
  }

  /**
   * Send card issued notification
   */
  async sendCardIssuedEmail({ to, firstName, cardType, last4 }: CardIssuedEmailParams) {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background: linear-gradient(135deg, #6b46c1 0%, #9333ea 100%);
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 10px 10px 0 0;
          }
          .content {
            background: #f9fafb;
            padding: 30px;
            border-radius: 0 0 10px 10px;
          }
          .card-info {
            background: white;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
            border-left: 4px solid #6b46c1;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🎉 Your SOLVY Card is Ready!</h1>
        </div>
        <div class="content">
          <h2>Congratulations, ${firstName}!</h2>
          <p>
            Your SOLVY Card has been issued and is on its way to you!
          </p>
          <div class="card-info">
            <p><strong>Card Type:</strong> ${cardType}</p>
            <p><strong>Card Number:</strong> •••• •••• •••• ${last4}</p>
            <p><strong>Estimated Delivery:</strong> 7-10 business days</p>
          </div>
          <p>
            <strong>What's Next:</strong>
          </p>
          <ol>
            <li>Wait for your card to arrive in the mail</li>
            <li>Activate your card online or via phone</li>
            <li>Start transacting with 0% fees!</li>
          </ol>
          <p>
            <strong>Remember:</strong> Every transaction you make builds your ownership 
            stake in the SOLVY cooperative. You're not just a customer - you're an owner!
          </p>
          <p>
            Best regards,<br>
            <strong>The SOLVY Team</strong>
          </p>
        </div>
      </body>
      </html>
    `

    return this.sendEmail({
      to,
      subject: '🎉 Your SOLVY Card Has Been Issued!',
      html
    })
  }
}

export const emailService = new EmailService()
