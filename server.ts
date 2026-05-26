import 'dotenv/config';
import express from 'express';
import path from 'path';
import multer from 'multer';
import fs from 'fs';
import nodemailer from 'nodemailer';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, query, where, onSnapshot, updateDoc, getDoc, addDoc } from 'firebase/firestore';
import { v2 as cloudinary } from 'cloudinary';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = 3000;

// Configure Cloudinary using process.env.CLOUDINARY_URL or user-provided URL falls back
const cloudinaryUrl = process.env.CLOUDINARY_URL || "cloudinary://917321524249516:jr-MsrzcLALq_yyq_fRFNfXzOWQ@dcxnnnacb";
const match = cloudinaryUrl.match(/cloudinary:\/\/([^:]+):([^@]+)@(.+)/);

if (match) {
  const apiKey = match[1];
  const apiSecret = match[2];
  const cloudName = match[3];
  
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true
  });
  console.log(`Cloudinary configured for cloud_name: ${cloudName}`);
} else {
  console.error("Cloudinary failed to parse from URL configuration template.");
}

const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB limit for general media
  }
});

app.use(express.json());

// ==========================================
// ADMISSIONS PORTAL AUTOMATION SYSTEM (BACKEND)
// ==========================================

// Safe Firestore initialization
let db: any = null;
try {
  const configPath = path.join(process.cwd(), 'firebase-applet-config.json');
  if (fs.existsSync(configPath)) {
    const firebaseConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    const firebaseApp = initializeApp(firebaseConfig);
    db = getFirestore(firebaseApp, firebaseConfig.firestoreDatabaseId);
    console.log(`[Firebase] Firestore backend trigger active on database: ${firebaseConfig.firestoreDatabaseId}`);
    
    // Start the real-time background listener on startup
    setupAdmissionsListener();
  } else {
    console.warn("[Firebase] Warning: firebase-applet-config.json not found. Background triggers offline.");
  }
} catch (err) {
  console.error("[Firebase] Error bootstrapping Firebase in server.ts:", err);
}

// Generate base64url message format for Gmail API
function makeRawEmail(to: string, subject: string, htmlBody: string): string {
  const emailLines = [
    `To: ${to}`,
    'Content-Type: text/html; charset=utf-8',
    'MIME-Version: 1.0',
    `Subject: ${subject}`,
    '',
    htmlBody
  ];
  return Buffer.from(emailLines.join('\n'))
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

// Breathtaking HTML email layout
function getEmailHtmlTemplate(application: any): string {
  const { trackingId, studentName, seekingClass, dateOfBirth, permanentAddress } = application;
  return `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; background-color: #ffffff; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);">
      <div style="background-color: #0d631b; color: white; padding: 32px 24px; text-align: center; background-image: linear-gradient(135deg, #0d631b 0%, #15803d 100%);">
        <h2 style="margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">ADMISSION APPROVED</h2>
        <p style="margin: 6px 0 0 0; font-size: 14px; opacity: 0.9; font-weight: 500;">Damagara Syed Meena Dimukhe High School</p>
      </div>
      
      <div style="padding: 32px 24px; color: #1e293b;">
        <p style="font-size: 16px; font-weight: bold; margin-top: 0; color: #0f172a;">Dear Guardian,</p>
        <p style="font-size: 14px; line-height: 1.6; color: #334155;">We are pleased to inform you that your online admission application for <strong>${studentName}</strong> has been officially changed to <span style="background-color: #dcfce7; color: #15803d; padding: 4px 8px; border-radius: 6px; font-weight: 700; font-size: 12px;">APPROVED</span> by the school's Academic Admissions Portal.</p>
        
        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin: 24px 0;">
          <h3 style="margin: 0 0 14px 0; font-size: 12px; color: #0d631b; text-transform: uppercase; font-weight: 800; letter-spacing: 0.5px;">Application Credentials</h3>
          <table style="width: 100%; font-size: 13px; border-collapse: collapse; line-height: 1.5;">
            <tr>
              <td style="padding: 6px 0; color: #64748b; width: 40%; font-weight: 500;">Tracking Code:</td>
              <td style="padding: 6px 0; font-weight: bold; font-family: monospace; color: #0f172a; font-size: 14px;">${trackingId}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748b; font-weight: 500;">Student Name:</td>
              <td style="padding: 6px 0; font-weight: 700; color: #0f172a;">${studentName}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748b; font-weight: 500;">Seeking Grade:</td>
              <td style="padding: 6px 0; font-weight: 700; color: #0f172a;">${seekingClass}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748b; font-weight: 500;">Date of Birth:</td>
              <td style="padding: 6px 0; font-weight: 600; color: #334155;">${dateOfBirth}</td>
            </tr>
          </table>
        </div>

        <div style="background-color: #dbf1fe; border: 1px solid #bae6fd; border-radius: 12px; padding: 20px; margin: 24px 0; font-size: 13px; line-height: 1.6; color: #0369a1;">
          <h3 style="margin: 0 0 10px 0; font-size: 14px; color: #0369a1; font-weight: bold; display: flex; align-items: center; gap: 6px;">
            📝 Written Entrance Exam Guidelines
          </h3>
          <p style="margin: 4px 0;"><strong>• Exam center:</strong> Academic Block Center, Ground Floor, Damagara school campus</p>
          <p style="margin: 4px 0;"><strong>• Date & Time:</strong> January 28, 2026 at 10:00 AM (Please report 30 mins early)</p>
          <p style="margin: 4px 0;"><strong>• Prep coverage:</strong> English grammar, basic mathematics formulas, general science, and Bangla</p>
          <p style="margin: 8px 0 0 0; font-weight: 600; font-size: 12.5px;">Important: Please search your tracking ID on our online admissions portal, download your Admit Voucher, print it out, and present it at the exam desk.</p>
        </div>

        <p style="font-size: 13px; line-height: 1.6; color: #475569; margin-bottom: 0;">For immediate guidance, contact our Admissions Office at <span style="font-weight: 700; color: #0f172a;">+880 1711-366659</span> or email <span style="color: #0d631b; font-weight: 600;">info@damagarasmdhs.edu.bd</span>.</p>
      </div>
      
      <div style="background-color: #f8fafc; padding: 20px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #f1f5f9; font-weight: 500;">
        <p style="margin: 0;">© 2026 Damagara Syed Meena Dimukhe High School. Tarat gari, Bogra.</p>
        <p style="margin: 4px 0 0 0; color: #cbd5e1;">This is an automated enrollment notification system.</p>
      </div>
    </div>
  `;
}

// Core Notifications Dispatch logic
async function sendAdmissionNotifications(application: any, docId: string) {
  const { trackingId, studentName, seekingClass, email, mobileNumber } = application;
  const timestamp = new Date().toISOString();

  let emailStatus: 'Success' | 'Failed' | 'NotConfigured' = 'NotConfigured';
  let smsStatus: 'Success' | 'Failed' | 'NotConfigured' = 'NotConfigured';
  let emailLogMessage = '';
  let smsLogMessage = '';

  const emailSubject = `DSMD Admission APPROVED: Admit Voucher Ready [Tracking: ${trackingId}]`;
  const emailHtml = getEmailHtmlTemplate(application);
  const smsText = `Dear Guardian, your application for ${studentName} (ID: ${trackingId}) has been APPROVED. Exam: Jan 28, 2026. Download Admit Card from portal. Contact: +8801711366659`;

  // 1. Send e-mail via standard SMTP if configured
  if (email && email.trim()) {
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
    const smtpPort = parseInt(process.env.SMTP_PORT || '587');

    if (smtpUser && smtpPass) {
      console.log(`[Notification Engine] SMTP config found. Sending email to ${email}...`);
      try {
        const transporter = nodemailer.createTransport({
          host: smtpHost,
          port: smtpPort,
          secure: smtpPort === 465,
          auth: {
            user: smtpUser,
            pass: smtpPass
          }
        });

        await transporter.sendMail({
          from: `"DSMD High School Admissions" <${smtpUser}>`,
          to: email,
          subject: emailSubject,
          html: emailHtml
        });

        emailStatus = 'Success';
        emailLogMessage = `Email sent successfully via SMTP server to ${email}.`;
        console.log(`[Notification Engine] Email sent successfully to ${email}.`);
      } catch (err: any) {
        emailStatus = 'Failed';
        emailLogMessage = `SMTP email send failed: ${err.message}`;
        console.error(`[Notification Engine] SMTP failed for ${email}:`, err);
      }
    } else {
      emailStatus = 'NotConfigured';
      emailLogMessage = `Confirmation email generated for ${email}. SMTP credentials not configured in Workspace Secrets.`;
      console.log(`[Notification Engine] Real-time email generated and logged (SMTP not set).`);
    }
  } else {
    emailLogMessage = `No email address provided by candidate.`;
  }

  // 2. Send SMS via Twilio if configured
  if (mobileNumber && mobileNumber.trim()) {
    const twilioSid = process.env.TWILIO_ACCOUNT_SID;
    const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;
    const twilioNumber = process.env.TWILIO_PHONE_NUMBER;

    if (twilioSid && twilioAuthToken && twilioNumber) {
      console.log(`[Notification Engine] Twilio config found. Dispatching SMS to ${mobileNumber}...`);
      try {
        const basicAuth = Buffer.from(`${twilioSid}:${twilioAuthToken}`).toString('base64');
        const twilioRes = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`, {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${basicAuth}`,
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: new URLSearchParams({
            To: mobileNumber.startsWith('+') ? mobileNumber : `+88${mobileNumber}`,
            From: twilioNumber,
            Body: smsText
          }).toString()
        });

        if (twilioRes.ok) {
          smsStatus = 'Success';
          smsLogMessage = `SMS dispatched successfully via Twilio to ${mobileNumber}.`;
          console.log(`[Notification Engine] Twilio SMS dispatched to ${mobileNumber}.`);
        } else {
          const resText = await twilioRes.text();
          smsStatus = 'Failed';
          smsLogMessage = `Twilio rejected request: ${resText}`;
          console.warn(`[Notification Engine] Twilio rejected SMS dispatch:`, resText);
        }
      } catch (err: any) {
        smsStatus = 'Failed';
        smsLogMessage = `Contacting Twilio failed: ${err.message}`;
        console.error(`[Notification Engine] Twilio API connection failed:`, err);
      }
    } else {
      smsStatus = 'NotConfigured';
      smsLogMessage = `Confirmation SMS text generated for ${mobileNumber}. Twilio SID/AuthToken not set in Workspace Secrets.`;
      console.log(`[Notification Engine] SMS generated and logged (Twilio not set).`);
    }
  } else {
    smsLogMessage = `No mobile phone number provided.`;
  }

  // 3. Write record to delivery_logs collection
  try {
    const deliveryLogsRef = collection(db, 'delivery_logs');
    await addDoc(deliveryLogsRef, {
      trackingId,
      studentName,
      email: email || 'N/A',
      mobileNumber: mobileNumber || 'N/A',
      timestamp,
      emailStatus,
      smsStatus,
      emailLogMessage,
      smsLogMessage,
      emailHtml,
      smsText
    });
  } catch (err) {
    console.error("[Notification Engine] Failed logging notification status in firestore:", err);
  }

  // 4. Update the admissions document to avoid infinite dispatch loops
  try {
    const admissionsDocRef = doc(db, 'admissions', docId);
    await updateDoc(admissionsDocRef, {
      notificationSent: true,
      notificationSentAt: timestamp,
      emailStatus,
      smsStatus
    });
  } catch (err) {
    console.error(`[Notification Engine] Failed writing lock flags for document ${docId}:`, err);
  }
}

// Background Firestore Listener
function setupAdmissionsListener() {
  try {
    const admissionsRef = collection(db, 'admissions');
    const q = query(admissionsRef, where('status', '==', 'Approved'));

    console.log('[Notification Engine] Initializing background listener for admissions approval status...');

    onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach(async (change) => {
        if (change.type === 'added' || change.type === 'modified') {
          const data = change.doc.data();
          if (data && !data.notificationSent) {
            console.log(`[Notification Engine] Triggered matching change for trackingId: ${data.trackingId}`);
            try {
              await sendAdmissionNotifications(data, change.doc.id);
            } catch (notifyErr) {
              console.error(`[Notification Engine] Error processing approved log flow for ${data.trackingId}:`, notifyErr);
            }
          }
        }
      });
    }, (error) => {
      console.error("[Notification Engine] background Firestore onSnapshot error:", error);
    });
  } catch (err) {
    console.error("[Notification Engine] Crash setting up background trigger snapshots:", err);
  }
}

// REST Webhook and update api (also supports client Gmail API token)
app.post('/api/admissions/update-status', async (req, res) => {
  const { trackingId, status, googleAccessToken } = req.body;

  if (!trackingId || !status) {
    return res.status(400).json({ error: 'trackingId and status fields are required.' });
  }

  if (!['Pending', 'Approved', 'ReviewRequired'].includes(status)) {
    return res.status(400).json({ error: 'Incorrect admission status selection.' });
  }

  if (!db) {
    return res.status(500).json({ error: 'Firestore database offline. Setup firebase key first.' });
  }

  try {
    const docRef = doc(db, 'admissions', trackingId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return res.status(404).json({ error: `No application matching tracking ID: ${trackingId}` });
    }

    const applicationData = docSnap.data();

    // 1. Update status
    await updateDoc(docRef, {
      status,
      updatedAt: new Date().toISOString()
    });

    console.log(`[API] Application ${trackingId} updated status directly to ${status}`);

    // 2. If Approved and Google Auth token is provided, send via Gmail API!
    if (status === 'Approved' && googleAccessToken) {
      console.log(`[API] Google access token provided. Triggering immediate Gmail API dispatch to ${applicationData.email || 'N/A'}...`);
      
      const emailSubject = `DSMD Admission APPROVED: Admit Voucher Ready [Tracking: ${trackingId}]`;
      const emailHtml = getEmailHtmlTemplate(applicationData);
      const smsText = `Dear Guardian, your application for ${applicationData.studentName} (ID: ${trackingId}) has been APPROVED. Exam: Jan 28, 2026. Download Admit Card from portal.`;

      if (applicationData.email && applicationData.email.trim()) {
        try {
          const rawMessage = makeRawEmail(applicationData.email, emailSubject, emailHtml);
          const gmailRes = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${googleAccessToken}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ raw: rawMessage })
          });

          if (gmailRes.ok) {
            console.log(`[API] Confirmation dispatched successfully using authenticated Gmail API!`);
            
            // Mark log directly
            const timestamp = new Date().toISOString();
            await updateDoc(docRef, {
              notificationSent: true,
              notificationSentAt: timestamp,
              emailStatus: 'Success (Google Auth)'
            });

            // Write delivery log
            await addDoc(collection(db, 'delivery_logs'), {
              trackingId,
              studentName: applicationData.studentName,
              email: applicationData.email,
              mobileNumber: applicationData.mobileNumber || 'N/A',
              timestamp,
              emailStatus: 'Success (Google Auth)',
              smsStatus: 'NotConfigured',
              emailLogMessage: 'Confirmation email successfully dispatched via authenticated Gmail Workspace API.',
              smsLogMessage: 'Twilio was not called since Google Gmail token flow was configured.',
              emailHtml,
              smsText
            });

            return res.json({ 
              success: true, 
              message: `Successfully approved request and dispatched notification via Google Workspace Gmail API.`,
              data: { status, notificationSent: true, emailStatus: 'Success (Google Auth)' }
            });
          } else {
            const respText = await gmailRes.text();
            console.error(`[API] Gmail API rejected mail send:`, respText);
            throw new Error(respText);
          }
        } catch (err: any) {
          console.error(`[API] Authenticated Gmail dispatch failed, letting server trigger handle. error:`, err);
        }
      }
    }

    res.json({ 
      success: true, 
      message: `Status updated successfully to ${status}. Notification delivery in progress.`,
      data: { status }
    });
  } catch (error: any) {
    console.error('[API] Status update endpoint crash:', error);
    res.status(500).json({ error: error.message || 'Admissions status update transaction rejected.' });
  }
});

// API health and configuration check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    cloudinaryConfigured: !!match,
    timestamp: new Date().toISOString()
  });
});

// Real secure API upload proxy endpoint using the Cloudinary Node SDK
app.post('/api/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file was uploaded in the request.' });
    }

    // Convert parsed memory buffer to string format for Cloudinary stream uploader
    const base64Data = req.file.buffer.toString('base64');
    const mimeType = req.file.mimetype;
    const fileUri = `data:${mimeType};base64,${base64Data}`;

    // Determine correct upload options based on mimeType
    const isVideo = mimeType.startsWith('video/');
    const resourceType = isVideo ? 'video' : 'auto';

    console.log(`Starting media upload: type [${resourceType}], size [${req.file.size} bytes]`);

    const result = await cloudinary.uploader.upload(fileUri, {
      resource_type: resourceType,
      folder: 'damagara_school'
    });

    res.json({
      success: true,
      url: result.secure_url,
      public_id: result.public_id,
      format: result.format,
      resource_type: result.resource_type,
      width: result.width,
      height: result.height,
      duration: result.duration || null
    });
  } catch (error: any) {
    console.error('Core Cloudinary upload failed error: ', error);
    res.status(500).json({
      error: error.message || 'Failed to upload media to Cloudinary.'
    });
  }
});

// Vite middleware for development
async function bootstrap() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Express server listening/running on http://0.0.0.0:${PORT}`);
  });
}

bootstrap();
