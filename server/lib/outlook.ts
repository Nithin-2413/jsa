import { ConfidentialClientApplication } from '@azure/msal-node';
import axios from 'axios';

if (!process.env.OUTLOOK_CLIENT_ID || !process.env.OUTLOOK_CLIENT_SECRET || !process.env.OUTLOOK_TENANT_ID) {
  throw new Error("OUTLOOK_CLIENT_ID, OUTLOOK_CLIENT_SECRET, and OUTLOOK_TENANT_ID environment variables must be set");
}

const msalConfig = {
  auth: {
    clientId: process.env.OUTLOOK_CLIENT_ID!,
    clientSecret: process.env.OUTLOOK_CLIENT_SECRET!,
    authority: process.env.OUTLOOK_AUTHORITY || `https://login.microsoftonline.com/${process.env.OUTLOOK_TENANT_ID}`
  }
};

const cca = new ConfidentialClientApplication(msalConfig);

async function getAccessToken(): Promise<string> {
  try {
    const clientCredentialRequest = {
      scopes: ['https://graph.microsoft.com/.default'],
    };

    const response = await cca.acquireTokenByClientCredential(clientCredentialRequest);
    if (!response?.accessToken) {
      throw new Error('Failed to acquire access token');
    }
    return response.accessToken;
  } catch (error) {
    console.error('Error acquiring access token:', error);
    throw error;
  }
}

export interface EmailSubmissionParams {
  name: string;
  recipient_name: string;
  email: string;
  phone: string;
  type_of_message: string;
  message_details: string;
  feelings: string;
  story: string;
  specific_details: string;
  delivery_type: string;
  submission_id: string;
}

export interface EmailReplyParams {
  client_name: string;
  reply_message: string;
  admin_name: string;
  reply_link?: string;
  from_email: string;
  admin_panel_link?: string;
}

export async function sendSubmissionEmail(params: EmailSubmissionParams): Promise<boolean> {
  try {
    const accessToken = await getAccessToken();
    
    // Format the current date
    const currentDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    // Generate unique message ID for thread tracking
    const messageId = `submission-${params.submission_id}-${Date.now()}@thewrittenhug.com`;
    
    const emailContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>New Written Hug Submission</title>
</head>
<body style="margin:0; padding:0; font-family: Arial, sans-serif; background:#f9f9f9;">
  <div style="max-width:700px; margin:0 auto; background:#fff; border-radius:10px; overflow:hidden;">
    <img src="https://drive.google.com/uc?export=view&id=1rO5kIJoKjpZfUGvK_HDmpvqHcuZGPnY-" alt="Header" style="width:100%; display:block;">
    <div style="padding:20px;">
      <h2 style="color:#ff6b6b; text-align:center; margin:0 0 12px;">🪶 You've Got a Kabootar from ${params.name}</h2>
      <table style="width:100%; border-collapse:collapse; font-size:14px;">
        <tr style="background:#fff5f5;"><td style="padding:10px; border:1px solid #ffd6d6;">Name</td><td style="padding:10px; border:1px solid #ffd6d6;">${params.name}</td></tr>
        <tr><td style="padding:10px; border:1px solid #ffe6cc;">Recipient's Name</td><td style="padding:10px; border:1px solid #ffe6cc;">${params.recipient_name}</td></tr>
        <tr style="background:#fff5f5;"><td style="padding:10px; border:1px solid #ffd6d6;">Date</td><td style="padding:10px; border:1px solid #ffd6d6;">${currentDate}</td></tr>
        <tr><td style="padding:10px; border:1px solid #ffe6cc;">Status</td><td style="padding:10px; border:1px solid #ffe6cc;">New</td></tr>
        <tr style="background:#fff5f5;"><td style="padding:10px; border:1px solid #ffd6d6;">Email</td><td style="padding:10px; border:1px solid #ffd6d6;">${params.email}</td></tr>
        <tr><td style="padding:10px; border:1px solid #ffe6cc;">Phone</td><td style="padding:10px; border:1px solid #ffe6cc;">${params.phone}</td></tr>
        <tr style="background:#fff5f5;"><td style="padding:10px; border:1px solid #ffd6d6;">Message Details</td><td style="padding:10px; border:1px solid #ffd6d6;">${params.message_details.replace(/\n/g, '<br>')}</td></tr>
      </table>
      <p style="margin-top:14px; text-align:center;">
        <a href="https://your-admin-panel.com/hugs/${params.submission_id}" style="color:#ff6b6b; text-decoration:none; font-weight:bold;">View this conversation in Admin Panel →</a>
      </p>
    </div>
    <img src="https://drive.google.com/uc?export=view&id=1u10daNLgVdYZvj6j1dyG62mhODlo2TN5" alt="Footer" style="width:100%; display:block;">
  </div>
</body>
</html>
    `;

    // Send email to admin
    const adminMailData = {
      message: {
        subject: `🪶 You've Got a Kabootar from ${params.name}`,
        body: {
          contentType: 'HTML',
          content: emailContent
        },
        toRecipients: [
          {
            emailAddress: {
              address: 'onaamikasadguru@gmail.com',
              name: 'Admin'
            }
          }
        ],
        internetMessageHeaders: [
          {
            name: 'X-Hug-ID',
            value: params.submission_id
          },
          {
            name: 'Message-ID',
            value: messageId
          }
        ]
      },
      saveToSentItems: 'true'
    };

    // Send email to user (same content but different subject for confirmation)
    const userMailData = {
      message: {
        subject: `✨ Thank you for your submission! - The Written Hug`,
        body: {
          contentType: 'HTML',
          content: emailContent
        },
        toRecipients: [
          {
            emailAddress: {
              address: params.email,
              name: params.name
            }
          }
        ],
        internetMessageHeaders: [
          {
            name: 'X-Hug-ID',
            value: params.submission_id
          },
          {
            name: 'Message-ID',
            value: `user-${messageId}`
          }
        ]
      },
      saveToSentItems: 'true'
    };

    // Send both emails
    await Promise.all([
      axios.post(
        `https://graph.microsoft.com/v1.0/users/${process.env.ADMIN_FROM_EMAIL}/sendMail`,
        adminMailData,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      ),
      axios.post(
        `https://graph.microsoft.com/v1.0/users/${process.env.ADMIN_FROM_EMAIL}/sendMail`,
        userMailData,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      )
    ]);
    
    return true;
  } catch (error) {
    console.error('Microsoft Graph submission email error:', error);
    if (error instanceof Error && 'response' in error) {
      const axiosError = error as any;
      console.error('Response status:', axiosError.response?.status);
      console.error('Response data:', axiosError.response?.data);
    }
    return false;
  }
}

export async function sendReplyEmail(clientEmail: string, params: EmailReplyParams): Promise<boolean> {
  try {
    const accessToken = await getAccessToken();
    
    // Generate unique message ID for thread tracking
    const replyMessageId = `reply-${Date.now()}@thewrittenhug.com`;
    
    const emailContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>You've Got a Kabootar</title>
  <link href="https://fonts.googleapis.com/css2?family=Great+Vibes&display=swap" rel="stylesheet">
</head>
<body style="margin:0; padding:0;">
  <div style="background:#fff; padding:24px 12px; font-family: Comic Sans MS, cursive, sans-serif; color: #333;">
    <div style="max-width:700px; margin:0 auto; background:#ffffff; border-radius:10px; overflow:hidden; box-shadow:0 6px 18px rgba(0,0,0,0.06);">
      
      <img src="https://drive.google.com/uc?export=view&id=1FbsnF3WYs42HDMAsVZRdSbe-wjZZBVRQ" alt="Header" style="width:100%; display:block;">
      
      <!-- Header -->
      <div style="padding:22px 20px; text-align:center; background: linear-gradient(90deg, #f16a85, #f78c9e, #f16a85); color:white;">
        <h1 style="margin:0; font-size:28px; font-family: Great Vibes, cursive; line-height:1.2; letter-spacing:0.5px;">
          🕊️ You've Got a Kabootar
        </h1>
        <p style="margin:6px 0 0; font-size:14px; opacity:0.95; font-family:Comic Sans MS, cursive;">
          A personal reply to your heartfelt message
        </p>
      </div>

      <!-- Body -->
      <div style="padding:20px 24px; background: #fff;">
        <p style="margin:0 0 14px; font-size:15px;">
          Hi ${params.client_name},
        </p>

        <div style="background:#fff5f7; border-radius:8px; padding:16px 18px; border:1px solid #f9ccd3;">
          <p style="margin:0; font-size:15px; line-height:1.6; text-align:justify; color:#2f2f2f;">
            ${params.reply_message.replace(/\n/g, '<br>')}
          </p>
        </div>
        
        <div style="margin-top:20px; text-align:center;">
          <p style="margin:0; font-size:13px; color:#666; font-family:Comic Sans MS, cursive;">
            With love,<br>
            <strong style="color:#f16a85;">The Written Hug Team</strong>
          </p>
          
          <div style="margin-top:16px; padding:12px; background:#f0f8ff; border-radius:6px; border:1px solid #d1e7ff;">
            <p style="margin:0; font-size:12px; color:#555;">
              💌 You can reply directly to this email and we'll receive your message!
            </p>
          </div>
        </div>
      </div>
      
      <img src="https://drive.google.com/uc?export=view&id=1u10daNLgVdYZvj6j1dyG62mhODlo2TN5" alt="Footer" style="width:100%; display:block;">
    </div>
  </div>
</body>
</html>
    `;

    const mailData = {
      message: {
        subject: "🕊️ You've Got a Kabootar from The Written Hug",
        body: {
          contentType: 'HTML',
          content: emailContent
        },
        toRecipients: [
          {
            emailAddress: {
              address: clientEmail,
              name: params.client_name
            }
          }
        ],
        replyTo: [
          {
            emailAddress: {
              address: process.env.ADMIN_FROM_EMAIL || '',
              name: 'The Written Hug Team'
            }
          }
        ],
        internetMessageHeaders: [
          {
            name: 'Message-ID',
            value: replyMessageId
          },
          {
            name: 'X-Auto-Response-Suppress',
            value: 'OOF, AutoReply'
          }
        ]
      },
      saveToSentItems: 'true'
    };

    await axios.post(
      `https://graph.microsoft.com/v1.0/users/${process.env.ADMIN_FROM_EMAIL}/sendMail`,
      mailData,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    return true;
  } catch (error) {
    console.error('Microsoft Graph reply email error:', error);
    if (error instanceof Error && 'response' in error) {
      const axiosError = error as any;
      console.error('Response status:', axiosError.response?.status);
      console.error('Response data:', axiosError.response?.data);
    }
    return false;
  }
}