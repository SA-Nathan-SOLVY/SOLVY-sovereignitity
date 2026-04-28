import { AgentMailClient } from 'agentmail';

const FROM_HELLO = 'support@solvy.cards';
const FROM_TEAM  = 'support@solvy.cards';

function getClient(): AgentMailClient | null {
  const key = process.env.AGENTMAIL_API_KEY;
  if (!key) {
    console.warn('[Email] AGENTMAIL_API_KEY not set — email sending disabled');
    return null;
  }
  return new AgentMailClient({ apiKey: key });
}

// ─── HTML Layout ──────────────────────────────────────────────────────────────

function baseLayout(title: string, body: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background:#0f172a;font-family:'Segoe UI',Arial,sans-serif;color:#e2e8f0;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f172a;">
    <tr><td align="center" style="padding:40px 16px;">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#1e293b;border-radius:12px;overflow:hidden;">
        <tr>
          <td style="background:linear-gradient(135deg,#7c3aed,#4f46e5);padding:32px 40px;text-align:center;">
            <div style="font-size:28px;font-weight:800;color:#fff;letter-spacing:1px;">SOLVY<span style="color:#fbbf24;">™</span></div>
            <div style="font-size:12px;color:rgba(255,255,255,0.7);margin-top:4px;letter-spacing:2px;text-transform:uppercase;">Cooperative Ecosystem</div>
          </td>
        </tr>
        <tr><td style="padding:40px;">${body}</td></tr>
        <tr>
          <td style="background:#0f172a;padding:24px 40px;text-align:center;border-top:1px solid #334155;">
            <p style="margin:0;font-size:12px;color:#64748b;">SOLVY Ecosystem™ · support@solvy.cards</p>
            <p style="margin:6px 0 0;font-size:11px;color:#475569;">America's first cooperative P2P payment platform. Own your spend. Own your future.</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

// ─── Member Welcome ───────────────────────────────────────────────────────────

export async function sendMemberWelcome(opts: {
  email: string;
  firstName: string;
  memberNumber: string;
}): Promise<void> {
  const client = getClient();
  if (!client) return;

  const body = `
    <h1 style="margin:0 0 8px;font-size:24px;color:#fff;">Welcome, ${opts.firstName}! 🎉</h1>
    <p style="margin:0 0 24px;color:#94a3b8;font-size:15px;">You're now a Founding Member of the SOLVY Cooperative Ecosystem™.</p>

    <div style="background:#0f172a;border-radius:8px;padding:20px;margin-bottom:24px;border:1px solid #334155;">
      <div style="font-size:12px;color:#64748b;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;">Your Member ID</div>
      <div style="font-size:28px;font-weight:800;color:#fbbf24;font-family:monospace;">${opts.memberNumber}</div>
    </div>

    <p style="color:#cbd5e1;font-size:15px;line-height:1.7;margin-bottom:16px;">
      As a cooperative member, you own a share of every transaction fee the platform earns. Our revenue model is built for you:
    </p>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
      <tr>
        <td style="background:#14532d;border-radius:8px;padding:16px;text-align:center;width:30%;">
          <div style="font-size:24px;font-weight:800;color:#4ade80;">70%</div>
          <div style="font-size:11px;color:#86efac;margin-top:4px;">Patronage Dividends<br/>Community Pool</div>
        </td>
        <td width="12"></td>
        <td style="background:#1e3a5f;border-radius:8px;padding:16px;text-align:center;width:30%;">
          <div style="font-size:24px;font-weight:800;color:#60a5fa;">20%</div>
          <div style="font-size:11px;color:#93c5fd;margin-top:4px;">Operations<br/>Funding</div>
        </td>
        <td width="12"></td>
        <td style="background:#3b1d6e;border-radius:8px;padding:16px;text-align:center;width:30%;">
          <div style="font-size:24px;font-weight:800;color:#c084fc;">10%</div>
          <div style="font-size:11px;color:#d8b4fe;margin-top:4px;">Sovereign Wealth Fund<br/>SOVEREIGNITITY™</div>
        </td>
      </tr>
    </table>

    <a href="https://solvy.cards" style="display:inline-block;background:linear-gradient(135deg,#7c3aed,#4f46e5);color:#fff;text-decoration:none;padding:14px 32px;border-radius:8px;font-weight:700;font-size:15px;">Access Your Dashboard →</a>
  `;

  await client.messages.send(FROM_HELLO, {
    to: [{ email: opts.email }],
    subject: `Welcome to SOLVY, ${opts.firstName} — Member ${opts.memberNumber}`,
    html: baseLayout('Welcome to SOLVY', body),
  });
  console.log(`[Email] ✅ Member welcome sent to ${opts.email}`);
}

// ─── First Circle Deposit Confirmation ────────────────────────────────────────

export async function sendFirstCircleConfirmation(opts: {
  email: string;
  name: string;
  amount: number;
  sessionId: string;
}): Promise<void> {
  const client = getClient();
  if (!client) return;

  const dollars = (opts.amount / 100).toFixed(2);
  const firstName = opts.name.split(' ')[0] || opts.name;

  const body = `
    <h1 style="margin:0 0 8px;font-size:24px;color:#fff;">Your Equity Deposit is Confirmed ✓</h1>
    <p style="margin:0 0 24px;color:#94a3b8;font-size:15px;">Thank you, ${firstName}. You are now a First Circle member of SOLVY™.</p>

    <div style="background:#0f172a;border-radius:8px;padding:20px;margin-bottom:24px;border:1px solid #22c55e;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="color:#94a3b8;font-size:13px;padding-bottom:8px;">Amount Deposited</td>
          <td style="color:#4ade80;font-size:22px;font-weight:800;text-align:right;">$${dollars}</td>
        </tr>
        <tr>
          <td style="color:#94a3b8;font-size:13px;padding-bottom:8px;">Type</td>
          <td style="color:#e2e8f0;text-align:right;font-size:13px;">First Circle Equity Deposit</td>
        </tr>
        <tr>
          <td style="color:#94a3b8;font-size:13px;">Reference</td>
          <td style="color:#e2e8f0;text-align:right;font-size:11px;font-family:monospace;">${opts.sessionId}</td>
        </tr>
      </table>
    </div>

    <p style="color:#cbd5e1;font-size:15px;line-height:1.7;margin-bottom:24px;">
      Your $100 equity deposit is your ownership stake in the SOLVY Cooperative. As volume grows, you earn quarterly Patronage Dividends from the 70% community pool. Your stake is permanent — it grows with the cooperative.
    </p>

    <p style="color:#94a3b8;font-size:13px;margin-bottom:24px;">
      Next steps: Our team will reach out with your SOLVY Card application details. Keep an eye on <strong style="color:#e2e8f0;">support@solvy.cards</strong> for onboarding updates.
    </p>

    <a href="https://solvy.cards" style="display:inline-block;background:linear-gradient(135deg,#7c3aed,#4f46e5);color:#fff;text-decoration:none;padding:14px 32px;border-radius:8px;font-weight:700;font-size:15px;">View Your Dashboard →</a>
  `;

  await client.messages.send(FROM_HELLO, {
    to: [{ email: opts.email }],
    subject: 'First Circle Confirmed — Your SOLVY Equity Deposit Receipt',
    html: baseLayout('First Circle Confirmed', body),
  });
  console.log(`[Email] ✅ First Circle confirmation sent to ${opts.email}`);
}

// ─── Prelaunch Commitment Acknowledgement ────────────────────────────────────

export async function sendPrelaunchAck(opts: {
  email: string;
  name: string;
  pledge: number;
}): Promise<void> {
  const client = getClient();
  if (!client) return;

  const firstName = opts.name.split(' ')[0] || opts.name;

  const body = `
    <h1 style="margin:0 0 8px;font-size:24px;color:#fff;">Your Commitment is Registered, ${firstName} 🙌</h1>
    <p style="margin:0 0 24px;color:#94a3b8;font-size:15px;">You're helping build the underwriting case for the SOLVY Card™.</p>

    <div style="background:#0f172a;border-radius:8px;padding:20px;margin-bottom:24px;border:1px solid #334155;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="color:#94a3b8;font-size:13px;padding-bottom:8px;">Pledge Amount</td>
          <td style="color:#fbbf24;font-size:22px;font-weight:800;text-align:right;">$${opts.pledge.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</td>
        </tr>
      </table>
    </div>

    <p style="color:#cbd5e1;font-size:15px;line-height:1.7;margin-bottom:24px;">
      Every commitment adds to our underwriting volume numbers. When we hit our threshold, the SOLVY Card™ goes live for all members. You'll be among the first to activate.
    </p>

    <p style="color:#94a3b8;font-size:13px;line-height:1.6;margin-bottom:24px;">
      Share with your community. Every person who commits strengthens the cooperative and gets us closer to launch.
    </p>

    <a href="https://solvy.cards" style="display:inline-block;background:linear-gradient(135deg,#7c3aed,#4f46e5);color:#fff;text-decoration:none;padding:14px 32px;border-radius:8px;font-weight:700;font-size:15px;">Invite a Friend →</a>
  `;

  await client.messages.send(FROM_HELLO, {
    to: [{ email: opts.email }],
    subject: 'Your SOLVY Prelaunch Commitment is Confirmed',
    html: baseLayout('Prelaunch Commitment Confirmed', body),
  });
  console.log(`[Email] ✅ Prelaunch ack sent to ${opts.email}`);
}

// ─── Contact Form Notification ────────────────────────────────────────────────

export async function sendContactNotification(opts: {
  fromName: string;
  fromEmail: string;
  subject: string;
  message: string;
}): Promise<void> {
  const client = getClient();
  if (!client) return;

  const internalBody = `
    <h2 style="margin:0 0 16px;color:#fff;">New Contact Form Submission</h2>
    <div style="background:#0f172a;border-radius:8px;padding:20px;border:1px solid #334155;margin-bottom:24px;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr><td style="color:#94a3b8;font-size:13px;padding-bottom:10px;width:80px;">Name</td><td style="color:#e2e8f0;font-size:15px;font-weight:600;">${opts.fromName}</td></tr>
        <tr><td style="color:#94a3b8;font-size:13px;padding-bottom:10px;">Email</td><td><a href="mailto:${opts.fromEmail}" style="color:#818cf8;">${opts.fromEmail}</a></td></tr>
        <tr><td style="color:#94a3b8;font-size:13px;padding-bottom:10px;">Subject</td><td style="color:#e2e8f0;">${opts.subject}</td></tr>
      </table>
    </div>
    <div style="background:#0f172a;border-radius:8px;padding:20px;border:1px solid #334155;white-space:pre-wrap;color:#cbd5e1;font-size:14px;line-height:1.7;">${opts.message}</div>
    <p style="margin-top:24px;color:#64748b;font-size:12px;">Reply directly to this email to respond to ${opts.fromName}.</p>
  `;

  await client.messages.send(FROM_TEAM, {
    to: [{ email: 'support@solvy.cards' }],
    replyTo: opts.fromEmail,
    subject: `[SOLVY Contact] ${opts.subject}`,
    html: baseLayout('Contact Form', internalBody),
  });

  const ackBody = `
    <h1 style="margin:0 0 8px;font-size:24px;color:#fff;">We received your message, ${opts.fromName.split(' ')[0]}!</h1>
    <p style="margin:0 0 24px;color:#94a3b8;font-size:15px;">A member of the SOLVY team will follow up at <strong style="color:#e2e8f0;">${opts.fromEmail}</strong> within 1–2 business days.</p>
    <div style="background:#0f172a;border-radius:8px;padding:20px;border:1px solid #334155;margin-bottom:24px;">
      <div style="color:#64748b;font-size:12px;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;">Your Message</div>
      <div style="color:#cbd5e1;font-size:14px;line-height:1.7;white-space:pre-wrap;">${opts.message}</div>
    </div>
    <a href="https://solvy.cards" style="display:inline-block;background:linear-gradient(135deg,#7c3aed,#4f46e5);color:#fff;text-decoration:none;padding:14px 32px;border-radius:8px;font-weight:700;font-size:15px;">Learn More →</a>
  `;

  await client.messages.send(FROM_HELLO, {
    to: [{ email: opts.fromEmail }],
    subject: 'We got your message — SOLVY Ecosystem™',
    html: baseLayout('Message Received', ackBody),
  });

  console.log(`[Email] ✅ Contact notification + ack sent for ${opts.fromEmail}`);
}
