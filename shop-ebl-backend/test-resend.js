import { Resend } from 'resend';
const resend = new Resend(process.env.re_6ezJWizK_7hXcw4FSHM8hpDxHv71UQbNY);

async function sendTest() {
  try {
    console.log('Attempting to send email...');
    const data = await resend.emails.send({
      // CHANGE to your verified domain
      from: 'SOLVY <hello@ebl.beauty>', // or notifications@ebl.beauty
      to: ['s.a.nathanllc@gmail.com'], // Can now be ANY email
      subject: 'SOLVY Domain Email Test',
      html: '<p>This is sent from our own domain! Resend is fully configured.</p>',
    });
    console.log('✅ Email sent successfully:', data);
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

sendTest();
