export function getPasswordResetTemplate({ appName, name, tempPassword }) {
  return `
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
}
