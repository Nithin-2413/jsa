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

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function buildSubmissionEmailHTML(params: EmailSubmissionParams): string {
  const adminPanelBase = process.env.ADMIN_PANEL_BASE_URL || 'https://your-admin-panel.com';
  const adminLink = params.admin_panel_link || `${adminPanelBase}/hugs/${params.submission_id}`;
  const safe = (v: string) => escapeHtml(v || '');
  const nowDate = new Date().toLocaleString();
  const dateToShow = params.date || nowDate;
  const statusToShow = params.status || 'New';

  return `<!DOCTYPE html>
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
      <h2 style="color:#ff6b6b; text-align:center; margin:0 0 12px;">🪶 You’ve Got a Kabootar from ${safe(params.name)}</h2>
      <table style="width:100%; border-collapse:collapse; font-size:14px;">
        <tr style="background:#fff5f5;"><td style="padding:10px; border:1px solid #ffd6d6;">Name</td><td style="padding:10px; border:1px solid #ffd6d6;">${safe(params.name)}</td></tr>
        <tr><td style="padding:10px; border:1px solid #ffe6cc;">Recipient's Name</td><td style="padding:10px; border:1px solid #ffe6cc;">${safe(params.recipient_name)}</td></tr>
        <tr style="background:#fff5f5;"><td style="padding:10px; border:1px solid #ffd6d6;">Date</td><td style="padding:10px; border:1px solid #ffd6d6;">${safe(dateToShow)}</td></tr>
        <tr><td style="padding:10px; border:1px solid #ffe6cc;">Status</td><td style="padding:10px; border:1px solid #ffe6cc;">${safe(statusToShow)}</td></tr>
        <tr style="background:#fff5f5;"><td style="padding:10px; border:1px solid #ffd6d6;">Email</td><td style="padding:10px; border:1px solid #ffd6d6;">${safe(params.email)}</td></tr>
        <tr><td style="padding:10px; border:1px solid #ffe6cc;">Phone</td><td style="padding:10px; border:1px solid #ffe6cc;">${safe(params.phone)}</td></tr>
        <tr style="background:#fff5f5;"><td style="padding:10px; border:1px solid #ffd6d6;">Message Details</td><td style="padding:10px; border:1px solid #ffd6d6;">${safe(params.message_details)}</td></tr>
      </table>
      <p style="margin-top:14px; text-align:center;">
        <a href="${adminLink}" style="color:#ff6b6b; text-decoration:none; font-weight:bold;">View this conversation in Admin Panel →</a>
      </p>
    </div>
    <img src="https://drive.google.com/uc?export=view&id=1u10daNLgVdYZvj6j1dyG62mhODlo2TN5" alt="Footer" style="width:100%; display:block;">
  </div>
</body>
</html>`;
}

function buildReplyEmailHTML(params: EmailReplyParams): string {
  const safe = (v: string) => escapeHtml(v || '');
  return `
<link href="https://fonts.googleapis.com/css2?family=Great+Vibes&display=swap" rel="stylesheet">

<div style="background:#fff; padding:24px 12px; font-family: Comic Sans MS, cursive, sans-serif; color: #333;">
  <div style="max-width:700px; margin:0 auto; background:#ffffff; border-radius:10px; overflow:hidden; box-shadow:0 6px 18px rgba(0,0,0,0.06);">
   
    <img src="https://drive.google.com/uc?export=view&id=1FbsnF3WYs42HDMAsVZRdSbe-wjZZBVRQ" alt="Header" style="width:100%; display:block;">
    <!-- Header -->
    <div style="padding:22px 20px; text-align:center; background: linear-gradient(90deg, #f16a85, #f78c9e, #f16a85); color:white;">
      <h1 style="margin:0; font-size:28px; font-family: Great Vibes, cursive; line-height:1.2; letter-spacing:0.5px;">
        🕊️ You’ve Got a Kabootar
      </h1>
      <p style="margin:6px 0 0; font-size:14px; opacity:0.95; font-family:Comic Sans MS, cursive;">
        A personal reply to your heartfelt message
      </p>
    </div>

    <!-- Body -->
    <div style="padding:20px 24px; background: #fff;">
      <p style="margin:0 0 14px; font-size:15px;">
        Hi ${safe(params.client_name)},
      </p>

      <div style="background:#fff5f7; border-radius:8px; padding:16px 18px; border:1px solid #f9ccd3;">
        <p style="margin:0; font-size:15px; line-height:1.6; text-align:justify; color:#2f2f2f;">
          ${safe(params.reply_message).replace(/\n/g, '<br>')}
        </p>
      </div>
 <img src="https://drive.google.com/uc?export=view&id=1u10daNLgVdYZvj6j1dyG62mhODlo2TN5" alt="Footer" style="width:100%; display:block;">
</div>`;
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
  status?: string;
  date?: string;
  admin_panel_link?: string;
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
    
    const emailContent = buildSubmissionEmailHTML(params);

    const mailData = {
      message: {
        subject: `New Written Hug Submission — You’ve Got a Kabootar from ${params.name}`,
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
          },
          {
            emailAddress: {
              address: 'onaamikasadguru@gmail.com',
              name: 'Admin'
            }
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
    
    const emailContent = buildReplyEmailHTML(params);

    const mailData = {
      message: {
        subject: "You've Got a Kabootar from CEO-The Written Hug",
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