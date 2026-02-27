import nodemailer from "nodemailer";
import env from "../../config/env.js";

// ── Transporter (lazy-init so missing SMTP config doesn't crash startup) ──────

let _transporter = null;

function getTransporter() {
  if (_transporter) return _transporter;

  if (!env.SMTP_HOST || !env.SMTP_USER || !env.SMTP_PASS) {
    return null; // email not configured — silently skip
  }

  _transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: Number(env.SMTP_PORT),
    secure: false,
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASS,
    },
  });

  return _transporter;
}

// ── Generic send helper ────────────────────────────────────────────────────────

async function sendMail({ to, subject, html }) {
  const transporter = getTransporter();
  if (!transporter) {
    console.warn(`[Email] SMTP not configured — skipping email to ${to}`);
    return;
  }

  try {
    await transporter.sendMail({
      from: env.SMTP_FROM || `"HyperHub Kitchen" <${env.SMTP_USER}>`,
      to,
      subject,
      html,
    });
    console.info(`[Email] Sent "${subject}" → ${to}`);
  } catch (err) {
    // Fire-and-forget: never crash the main request
    console.error(`[Email] Failed to send to ${to}:`, err.message);
  }
}

// ── Templates ─────────────────────────────────────────────────────────────────

export async function sendWelcomeEmail({ name, email, tempPassword, role }) {
  const roleLabel = role
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
  const appName = "HyperHub Kitchen";

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Welcome to ${appName}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f1f5f9; }
    .wrapper { max-width: 560px; margin: 40px auto; padding: 0 16px 40px; }
    .card { background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
    .header { background: linear-gradient(135deg, #6366f1 0%, #7c3aed 100%); padding: 36px 32px; }
    .header h1 { color: #ffffff; font-size: 22px; font-weight: 700; letter-spacing: -0.5px; margin-bottom: 4px; }
    .header p { color: rgba(255,255,255,0.75); font-size: 13px; }
    .body { padding: 32px; }
    .greeting { font-size: 15px; color: #1e293b; margin-bottom: 20px; line-height: 1.6; }
    .greeting strong { color: #6366f1; }
    .password-card { background: #0f172a; border-radius: 12px; padding: 20px 24px; margin: 24px 0; }
    .password-label { font-size: 11px; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px; }
    .password-value { font-family: 'Courier New', Courier, monospace; font-size: 22px; color: #a5b4fc; letter-spacing: 3px; font-weight: 700; }
    .badge { display: inline-block; background: #ede9fe; color: #7c3aed; font-size: 12px; font-weight: 600; padding: 4px 10px; border-radius: 6px; margin-bottom: 20px; }
    .info-box { background: #fffbeb; border: 1px solid #fde68a; border-radius: 10px; padding: 14px 16px; margin: 20px 0; }
    .info-box p { font-size: 13px; color: #92400e; line-height: 1.6; }
    .info-box p + p { margin-top: 8px; }
    .steps { margin: 24px 0; }
    .step { display: flex; gap: 12px; margin-bottom: 14px; align-items: flex-start; }
    .step-num { background: #6366f1; color: white; border-radius: 50%; width: 22px; height: 22px; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700; flex-shrink: 0; margin-top: 1px; }
    .step-text { font-size: 13px; color: #475569; line-height: 1.6; }
    .step-text strong { color: #1e293b; }
    .divider { height: 1px; background: #f1f5f9; margin: 24px 0; }
    .footer { padding: 16px 32px 28px; text-align: center; }
    .footer p { font-size: 12px; color: #94a3b8; line-height: 1.7; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="card">
      <div class="header">
        <h1>Welcome to ${appName} 👋</h1>
        <p>Your account has been created and is ready to use</p>
      </div>
      <div class="body">
        <p class="greeting">Hi <strong>${name}</strong>,</p>
        <p class="greeting" style="margin-top:-12px">
          Your account has been set up with the role <strong style="color:#7c3aed">${roleLabel}</strong>. 
          Use the temporary credentials below to sign in for the first time.
        </p>

        <div class="password-card">
          <div class="password-label">Your Temporary Password</div>
          <div class="password-value">${tempPassword}</div>
        </div>

        <div class="info-box">
          <p>⚠️ <strong>Important:</strong> This is a one-time password. You will be required to change it immediately after your first login.</p>
          <p>Do not share this password with anyone.</p>
        </div>

        <div class="steps">
          <div class="step">
            <div class="step-num">1</div>
            <div class="step-text">Go to the <strong>${appName}</strong> platform and sign in with your email <strong>${email}</strong></div>
          </div>
          <div class="step">
            <div class="step-num">2</div>
            <div class="step-text">Enter the temporary password shown above</div>
          </div>
          <div class="step">
            <div class="step-num">3</div>
            <div class="step-text">You will be prompted to <strong>set a new, permanent password</strong> before continuing</div>
          </div>
        </div>

        <div class="divider"></div>
        <p style="font-size:12px;color:#94a3b8;">If you did not expect this email, please contact your administrator immediately.</p>
      </div>
      <div class="footer">
        <p>${appName} · Automated notification · Do not reply to this email</p>
      </div>
    </div>
  </div>
</body>
</html>
  `.trim();

  await sendMail({
    to: email,
    subject: `Welcome to ${appName} — Your temporary password`,
    html,
  });
}

export async function sendPasswordResetEmail({ name, email, tempPassword }) {
  const appName = "HyperHub Kitchen";

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Password Reset — ${appName}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f1f5f9; }
    .wrapper { max-width: 560px; margin: 40px auto; padding: 0 16px 40px; }
    .card { background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
    .header { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 36px 32px; }
    .header h1 { color: #ffffff; font-size: 22px; font-weight: 700; letter-spacing: -0.5px; margin-bottom: 4px; }
    .header p { color: rgba(255,255,255,0.8); font-size: 13px; }
    .body { padding: 32px; }
    .greeting { font-size: 15px; color: #1e293b; margin-bottom: 20px; line-height: 1.6; }
    .password-card { background: #0f172a; border-radius: 12px; padding: 20px 24px; margin: 24px 0; }
    .password-label { font-size: 11px; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px; }
    .password-value { font-family: 'Courier New', Courier, monospace; font-size: 22px; color: #fde68a; letter-spacing: 3px; font-weight: 700; }
    .info-box { background: #fffbeb; border: 1px solid #fde68a; border-radius: 10px; padding: 14px 16px; margin: 20px 0; }
    .info-box p { font-size: 13px; color: #92400e; line-height: 1.6; }
    .divider { height: 1px; background: #f1f5f9; margin: 24px 0; }
    .footer { padding: 16px 32px 28px; text-align: center; }
    .footer p { font-size: 12px; color: #94a3b8; line-height: 1.7; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="card">
      <div class="header">
        <h1>Password Reset 🔑</h1>
        <p>An administrator has reset your account password</p>
      </div>
      <div class="body">
        <p class="greeting">Hi <strong>${name}</strong>,</p>
        <p class="greeting" style="margin-top:-12px">
          Your password for <strong>${appName}</strong> has been reset by an administrator. 
          Use the temporary password below to sign in.
        </p>

        <div class="password-card">
          <div class="password-label">Your New Temporary Password</div>
          <div class="password-value">${tempPassword}</div>
        </div>

        <div class="info-box">
          <p>⚠️ You will be required to set a new password immediately after signing in. Do not share this password with anyone.</p>
        </div>

        <div class="divider"></div>
        <p style="font-size:12px;color:#94a3b8;">If you did not request this reset, please contact your administrator immediately.</p>
      </div>
      <div class="footer">
        <p>${appName} · Automated notification · Do not reply to this email</p>
      </div>
    </div>
  </div>
</body>
</html>
  `.trim();

  await sendMail({
    to: email,
    subject: `${appName} — Your password has been reset`,
    html,
  });
}
