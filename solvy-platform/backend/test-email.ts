import { emailService } from './src/services/emailService'
import dotenv from 'dotenv'

dotenv.config()

async function testEmail() {
  try {
    console.log('Sending test welcome email...')
    const result = await emailService.sendWelcomeEmail({
      to: 'test@example.com',
      firstName: 'Test',
      lastName: 'User'
    })
    console.log('✅ Email sent successfully:', result)
  } catch (error) {
    console.error('❌ Email failed:', error)
  }
}

testEmail()
