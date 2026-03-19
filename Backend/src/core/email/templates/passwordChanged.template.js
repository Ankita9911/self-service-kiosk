export function getPasswordChangedTemplate({ appName, name, email }) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Password Changed — ${appName}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f1f5f9; }
    .wrapper { max-width: 560px; margin: 40px auto; padding: 0 16px 40px; }
    .card { background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
    .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 36px 32px; }
    .header h1 { color: #ffffff; font-size: 22px; font-weight: 700; letter-spacing: -0.5px; margin-bottom: 4px; }
    .header p { color: rgba(255,255,255,0.8); font-size: 13px; }
    .body { padding: 32px; }
    .greeting { font-size: 15px; color: #1e293b; margin-bottom: 20px; line-height: 1.6; }
    .info-box { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 10px; padding: 14px 16px; margin: 20px 0; }
    .info-box p { font-size: 13px; color: #166534; line-height: 1.6; }
    .warn-box { background: #fffbeb; border: 1px solid #fde68a; border-radius: 10px; padding: 14px 16px; margin: 20px 0; }
    .warn-box p { font-size: 13px; color: #92400e; line-height: 1.6; }
    .divider { height: 1px; background: #f1f5f9; margin: 24px 0; }
    .footer { padding: 16px 32px 28px; text-align: center; }
    .footer p { font-size: 12px; color: #94a3b8; line-height: 1.7; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="card">
      <div class="header">
        <h1>Password Changed ✅</h1>
        <p>Your account password has been updated successfully</p>
      </div>
      <div class="body">
        <p class="greeting">Hi <strong>${name}</strong>,</p>
        <p class="greeting" style="margin-top:-12px">
          This is a confirmation that the password for your <strong>${appName}</strong> account (<strong>${email}</strong>) was just changed.
        </p>

        <div class="info-box">
          <p>✅ Your new password is now active. You can use it to sign in to your account.</p>
        </div>

        <div class="warn-box">
          <p>⚠️ If you did not make this change, please contact your administrator immediately and reset your password.</p>
        </div>

        <div class="divider"></div>
        <p style="font-size:12px;color:#94a3b8;">This is an automated security notification — do not reply to this email.</p>
      </div>
      <div class="footer">
        <p>${appName} · Security notification · Do not reply</p>
      </div>
    </div>
  </div>
</body>
</html>
  `.trim();
}
