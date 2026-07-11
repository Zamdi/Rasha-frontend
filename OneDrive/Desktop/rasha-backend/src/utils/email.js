const { Resend } = require('resend');
const resend = new Resend(process.env.RESEND_API_KEY);

function generateOtp() {
  return String(Math.floor(1000 + Math.random() * 9000));
}

function maskEmail(email) {
  const [user, domain] = email.split('@');
  const masked = user[0] + '*'.repeat(Math.max(user.length - 2, 1)) + user[user.length - 1];
  return `${masked}@${domain}`;
}

function buildOtpEmail(code, purpose) {
  const action = purpose === 'register' ? 'complete your registration' : 'sign in to your account';
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<title>Your Rasha Verification Code</title>
</head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:40px 16px;">
  <tr><td align="center">
    <table width="480" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb;max-width:480px;width:100%;">
      <tr>
        <td style="background:#1e3a5f;padding:28px 32px;text-align:center;">
          <table cellpadding="0" cellspacing="0" style="margin:0 auto;">
            <tr>
              <td style="padding-right:10px;vertical-align:middle;">
                <div style="width:42px;height:42px;border-radius:50%;background:#2a93d5;display:inline-flex;align-items:center;justify-content:center;font-weight:900;font-size:22px;color:#fff;font-family:Georgia,serif;">R</div>
              </td>
              <td style="vertical-align:middle;">
                <span style="color:#ffffff;font-size:20px;font-weight:700;letter-spacing:0.3px;">Rasha Car Wash</span>
              </td>
            </tr>
          </table>
        </td>
      </tr>
      <tr>
        <td style="padding:32px;">
          <h2 style="font-size:20px;font-weight:700;color:#1e3a5f;margin:0 0 8px;">Verify your email</h2>
          <p style="color:#6b7280;font-size:14px;margin:0 0 28px;line-height:1.6;">
            Use the code below to ${action}. It expires in <strong>5 minutes</strong>.
          </p>
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
            <tr>
              <td style="background:#f0f9ff;border:1.5px solid #bfdbfe;border-radius:10px;padding:24px;text-align:center;">
                <div style="font-size:44px;font-weight:800;letter-spacing:14px;color:#1e3a5f;font-family:'Courier New',monospace;">${code}</div>
                <p style="color:#6b7280;font-size:12px;margin:10px 0 0;">Your one-time verification code</p>
              </td>
            </tr>
          </table>
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
            <tr>
              <td style="background:#fef3c7;border-radius:8px;padding:12px 16px;">
                <p style="color:#92400e;font-size:12px;margin:0;line-height:1.5;">
                  ⚠️ Never share this code with anyone, including Rasha staff.
                </p>
              </td>
            </tr>
          </table>
          <p style="color:#9ca3af;font-size:12px;text-align:center;margin:0;">
            If you didn't request this, you can safely ignore this email.
          </p>
        </td>
      </tr>
      <tr>
        <td style="background:#f9fafb;padding:16px 32px;border-top:1px solid #e5e7eb;text-align:center;">
          <p style="color:#9ca3af;font-size:11px;margin:0 0 4px;">© 2025 Rasha Car Wash · Khartoum, Sudan</p>
          <p style="color:#9ca3af;font-size:11px;margin:0;">+249 900 088 989 · hello@rashacarwash.sd</p>
        </td>
      </tr>
    </table>
  </td></tr>
</table>
</body>
</html>`;
}

async function sendOtpEmail(email, code, purpose) {
  const subject = purpose === 'register'
    ? 'Your Rasha verification code'
    : 'Your Rasha sign-in code';
  await resend.emails.send({
    from: 'Rasha Car Wash <onboarding@resend.dev>',
    to: email,
    subject,
    html: buildOtpEmail(code, purpose),
  });
}

module.exports = { generateOtp, maskEmail, sendOtpEmail };
