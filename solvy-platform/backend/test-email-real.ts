import { emailService } from './src/services/emailService'
import dotenv from 'dotenv'

dotenv.config()

async function testEmail() {
  try {
    console.log('Sending test welcome email to s.a.nathanllc@gmail.com...')
    const result = await emailService.sendWelcomeEmail({
      to: 's.a.nathanllc@gmail.com',
      firstName: 'Nathan',
      lastName: 'SOLVY'
    })
    console.log('✅ Email sent successfully!')
    console.log('Result:', JSON.stringify(result, null, 2))
  } catch (error: any) {
    console.error('❌ Email failed:', error.message)
  }
}

testEmail()
