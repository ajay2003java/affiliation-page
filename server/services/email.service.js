const { db } = require('../db/database');

/**
 * Clean, Zero-Dependency HTML Email Template Builder
 */
function createHtmlEmail({ title, preheader, bodyHtml, actionText, actionUrl, footerText }) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 0; color: #1e293b; }
    .wrapper { max-width: 600px; margin: 30px auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
    .header { background: #0f172a; padding: 24px 32px; color: #ffffff; }
    .brand { font-size: 18px; font-weight: 800; letter-spacing: -0.5px; color: #ffffff; }
    .subbrand { font-size: 11px; color: #94a3b8; margin-top: 2px; }
    .content { padding: 32px; }
    .badge { display: inline-block; padding: 4px 12px; border-radius: 9999px; font-size: 11px; font-weight: 700; text-transform: uppercase; margin-bottom: 16px; }
    .badge-blue { background: #dbeafe; color: #1d4ed8; }
    .badge-green { background: #dcfce7; color: #15803d; }
    .badge-purple { background: #f3e8ff; color: #7e22ce; }
    .badge-amber { background: #fef3c7; color: #b45309; }
    h1 { font-size: 20px; font-weight: 800; color: #0f172a; margin: 0 0 16px 0; }
    p { font-size: 14px; line-height: 1.6; color: #475569; margin: 0 0 16px 0; }
    .card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px; margin: 20px 0; }
    .card-row { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 13px; }
    .card-row:last-child { margin-bottom: 0; }
    .label { color: #64748b; font-weight: 600; }
    .value { color: #0f172a; font-weight: 700; text-align: right; }
    .btn { display: inline-block; background: #2563eb; color: #ffffff !important; padding: 12px 24px; border-radius: 10px; font-weight: 700; font-size: 13px; text-decoration: none; margin-top: 12px; }
    .footer { background: #f8fafc; padding: 20px 32px; border-top: 1px solid #e2e8f0; font-size: 11px; color: #94a3b8; text-align: center; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <div class="brand">✦ Universal Referral Network</div>
      <div class="subbrand">Ottobon Academy • Medcy Health Tech • sBloom</div>
    </div>
    <div class="content">
      ${bodyHtml}
      ${actionUrl ? `<div style="text-align: center; margin: 24px 0;"><a href="${actionUrl}" class="btn">${actionText || 'View in Portal'}</a></div>` : ''}
    </div>
    <div class="footer">
      ${footerText || 'This is an automated notification from Universal Referral Network. You do not need to reply to this email.'}
    </div>
  </div>
</body>
</html>
  `;
}

/**
 * Log & Dispatch Email
 */
async function sendEmailNotification({
  recipientEmail,
  recipientName,
  subject,
  emailType,
  opportunityId,
  htmlContent
}) {
  if (!recipientEmail) {
    console.log(`[Email Service] Skipped: No recipient email provided for ${recipientName || 'user'}`);
    return;
  }

  const notificationId = `mail-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  
  // 1. Log notification to DB
  try {
    const tableExists = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='email_notifications'").get();
    if (!tableExists) {
      db.prepare(`
        CREATE TABLE IF NOT EXISTS email_notifications (
          id TEXT PRIMARY KEY,
          recipient_email TEXT NOT NULL,
          recipient_name TEXT,
          subject TEXT NOT NULL,
          email_type TEXT NOT NULL,
          opportunity_id TEXT,
          status TEXT DEFAULT 'SENT',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `).run();
    }

    db.prepare(`
      INSERT INTO email_notifications (id, recipient_email, recipient_name, subject, email_type, opportunity_id, status)
      VALUES (?, ?, ?, ?, ?, ?, 'SENT')
    `).run(notificationId, recipientEmail, recipientName || null, subject, emailType, opportunityId || null);

    console.log(`\n📧 [EMAIL NOTIFICATION SENT]`);
    console.log(`   To: ${recipientName ? `${recipientName} <${recipientEmail}>` : recipientEmail}`);
    console.log(`   Subject: ${subject}`);
    console.log(`   Type: ${emailType}`);
    console.log(`   Opportunity ID: ${opportunityId || 'N/A'}`);
    console.log(`   Timestamp: ${new Date().toISOString()}\n`);
    
    // If SMTP_HOST or RESEND_API_KEY is configured in .env, dispatch via HTTP/SMTP:
    if (process.env.RESEND_API_KEY) {
      try {
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            from: process.env.EMAIL_FROM || 'Universal Referral Network <notifications@resend.dev>',
            to: [recipientEmail],
            subject: subject,
            html: htmlContent
          })
        });
      } catch (sendErr) {
        console.error('[Email Service] Resend API Error:', sendErr.message);
      }
    }

  } catch (err) {
    console.error('[Email Service] Error logging email notification:', err);
  }
}

/**
 * Trigger 1: Send notification when a new referral is submitted
 */
async function notifyNewReferral(opp, referringUser) {
  try {
    const isDirectIntake = opp.intake_type === 'CLIENT_INTAKE';
    
    // A. Notify the Referrer (Confirmation Email)
    if (referringUser && referringUser.email) {
      const bodyHtml = `
        <div class="badge badge-blue">Referral Confirmation</div>
        <h1>Referral Submitted Successfully</h1>
        <p>Hello <strong>${referringUser.name}</strong>,</p>
        <p>Your referral has been successfully received and registered in our network. You can track its progress in real-time on your dashboard.</p>
        
        <div class="card">
          <div class="card-row"><span class="label">Job ID:</span><span class="value" style="font-family: monospace; color: #2563eb;">${opp.job_id}</span></div>
          <div class="card-row"><span class="label">Referred Lead / Person:</span><span class="value">${opp.person_contacted || opp.client_name}</span></div>
          <div class="card-row"><span class="label">Target Destination:</span><span class="value">${opp.target_org_name || opp.client_name || opp.target_entity_id}</span></div>
          <div class="card-row"><span class="label">Service / Requirement:</span><span class="value">${opp.service_product}</span></div>
          <div class="card-row"><span class="label">Initial Status:</span><span class="value">SUBMITTED (Pending Review)</span></div>
        </div>

        <p>We will email you automatically as soon as the status is updated by the admissions/intake desk.</p>
      `;

      await sendEmailNotification({
        recipientEmail: referringUser.email,
        recipientName: referringUser.name,
        subject: `✓ Referral Registered: ${opp.person_contacted || opp.client_name} (${opp.job_id})`,
        emailType: 'REFERRAL_CONFIRMATION',
        opportunityId: opp.id,
        htmlContent: createHtmlEmail({
          title: 'Referral Confirmation',
          bodyHtml
        })
      });
    }

    // B. If referred to a Partner Hospital / College, notify the Entity Admin
    if (isDirectIntake && opp.target_organization_id) {
      const targetOrg = db.prepare('SELECT * FROM organizations WHERE id = ?').get(opp.target_organization_id);
      const entityAdmin = db.prepare('SELECT * FROM users WHERE organization_id = ? AND role = ?').get(opp.target_organization_id, 'ADMIN');

      const recipientEmail = (entityAdmin && entityAdmin.email) || (targetOrg && targetOrg.contact_email);
      const recipientName = (entityAdmin && entityAdmin.name) || (targetOrg && targetOrg.name);

      if (recipientEmail) {
        const bodyHtml = `
          <div class="badge badge-green">New Incoming Intake</div>
          <h1>New Lead Received at Your Facility Desk</h1>
          <p>Hello <strong>${recipientName}</strong>,</p>
          <p>A new verified patient / student lead has been referred to your institution through the network.</p>
          
          <div class="card">
            <div class="card-row"><span class="label">Job ID:</span><span class="value" style="font-family: monospace; color: #16a34a;">${opp.job_id}</span></div>
            <div class="card-row"><span class="label">Candidate / Patient:</span><span class="value">${opp.person_contacted || opp.client_name}</span></div>
            <div class="card-row"><span class="label">Contact Phone:</span><span class="value">${opp.phone || 'Provided in portal'}</span></div>
            <div class="card-row"><span class="label">Service / Course Needed:</span><span class="value">${opp.service_product}</span></div>
            <div class="card-row"><span class="label">Referred By:</span><span class="value">${referringUser ? referringUser.name : 'Network Doctor/Partner'}</span></div>
            ${opp.clinical_intake_notes ? `<div class="card-row"><span class="label">Intake Notes:</span><span class="value">${opp.clinical_intake_notes}</span></div>` : ''}
          </div>

          <p>Please log in to your Intake Desk to review the details and update consultation/admission status.</p>
        `;

        await sendEmailNotification({
          recipientEmail,
          recipientName,
          subject: `📥 New Referral for ${targetOrg ? targetOrg.name : 'Your Facility'}: ${opp.person_contacted || opp.client_name} (${opp.job_id})`,
          emailType: 'NEW_INCOMING_LEAD',
          opportunityId: opp.id,
          htmlContent: createHtmlEmail({
            title: 'New Incoming Intake',
            bodyHtml
          })
        });
      }
    }

  } catch (err) {
    console.error('[Email Service] Error in notifyNewReferral:', err);
  }
}

/**
 * Trigger 2: Send notification when referral status changes
 */
async function notifyStatusChange(opp, oldStatus, newStatus, changedByName, remarks) {
  try {
    if (!opp.referring_user_id) return; // Not a referral
    
    const referrer = db.prepare('SELECT * FROM users WHERE id = ?').get(opp.referring_user_id);
    if (!referrer || !referrer.email) return;

    const isConverted = newStatus === 'CONVERTED';
    const isClosed = newStatus === 'NOT CONVERTED';

    let badgeClass = 'badge-blue';
    if (isConverted) badgeClass = 'badge-green';
    else if (isClosed) badgeClass = 'badge-amber';

    const bodyHtml = `
      <div class="badge ${badgeClass}">Status Update</div>
      <h1>${isConverted ? '🎉 Referral Converted & Reward Unlocked!' : `Status Updated: ${newStatus}`}</h1>
      <p>Hello <strong>${referrer.name}</strong>,</p>
      <p>The status of your referral has been updated by <strong>${changedByName || 'the intake desk'}</strong>.</p>
      
      <div class="card">
        <div class="card-row"><span class="label">Job ID:</span><span class="value" style="font-family: monospace;">${opp.job_id}</span></div>
        <div class="card-row"><span class="label">Candidate / Organization:</span><span class="value">${opp.person_contacted || opp.client_name}</span></div>
        <div class="card-row"><span class="label">Previous Status:</span><span class="value">${oldStatus}</span></div>
        <div class="card-row"><span class="label">New Status:</span><span class="value" style="color: ${isConverted ? '#16a34a' : '#2563eb'}; font-weight: 800;">${newStatus}</span></div>
        ${opp.final_agreed_price ? `<div class="card-row"><span class="label">Agreed Value:</span><span class="value">₹${Number(opp.final_agreed_price).toLocaleString('en-IN')}</span></div>` : ''}
        ${remarks ? `<div class="card-row"><span class="label">Remarks:</span><span class="value">${remarks}</span></div>` : ''}
      </div>

      ${isConverted ? `
        <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 16px; margin: 16px 0; text-align: center;">
          <div style="font-size: 20px; font-weight: 800; color: #166534;">🎁 Reward Eligible: ₹5,000</div>
          <p style="font-size: 12px; color: #15803d; margin-top: 4px; margin-bottom: 0;">Your reward status is now set to ELIGIBLE. Payout processing will be initiated directly to your account.</p>
        </div>
      ` : `
        <p>You can track all updates live in your dashboard anytime.</p>
      `}
    `;

    await sendEmailNotification({
      recipientEmail: referrer.email,
      recipientName: referrer.name,
      subject: `${isConverted ? '🎉 Reward Unlocked!' : '📌 Status Update'}: ${opp.person_contacted || opp.client_name} (${newStatus})`,
      emailType: isConverted ? 'REFERRAL_CONVERTED_REWARD' : 'REFERRAL_STATUS_UPDATE',
      opportunityId: opp.id,
      htmlContent: createHtmlEmail({
        title: isConverted ? 'Referral Converted' : 'Status Update',
        bodyHtml
      })
    });

  } catch (err) {
    console.error('[Email Service] Error in notifyStatusChange:', err);
  }
}

module.exports = {
  sendEmailNotification,
  notifyNewReferral,
  notifyStatusChange
};
