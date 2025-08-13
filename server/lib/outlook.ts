import { ConfidentialClientApplication } from '@azure/msal-node';
import axios from 'axios';

const isConfigured = Boolean(process.env.OUTLOOK_CLIENT_ID && process.env.OUTLOOK_CLIENT_SECRET && process.env.OUTLOOK_TENANT_ID && process.env.ADMIN_FROM_EMAIL);

const msalConfig = isConfigured ? {
  auth: {
    clientId: process.env.OUTLOOK_CLIENT_ID!,
    clientSecret: process.env.OUTLOOK_CLIENT_SECRET!,
    authority: process.env.OUTLOOK_AUTHORITY || `https://login.microsoftonline.com/${process.env.OUTLOOK_TENANT_ID}`
  }
} : undefined;

const cca = msalConfig ? new ConfidentialClientApplication(msalConfig) : undefined;

async function getAccessToken(): Promise<string> {
  if (!cca) throw new Error('Outlook email not configured');
  const clientCredentialRequest = { scopes: ['https://graph.microsoft.com/.default'] } as const;
  const response = await cca.acquireTokenByClientCredential(clientCredentialRequest);
  if (!response?.accessToken) {
    throw new Error('Failed to acquire access token');
  }
  return response.accessToken;
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
    if (!isConfigured) return false;
    const accessToken = await getAccessToken();
    
    const emailContent = `
      <h2>New Submission from ${params.name}</h2>
      <p><strong>Recipient:</strong> ${params.recipient_name}</p>
      <p><strong>Email:</strong> ${params.email}</p>
      <p><strong>Phone:</strong> ${params.phone}</p>
      <p><strong>Service Type:</strong> ${params.type_of_message}</p>
      <p><strong>Delivery Type:</strong> ${params.delivery_type}</p>
      
      <h3>Feelings:</h3>
      <p>${params.feelings}</p>
      
      <h3>Story:</h3>
      <p>${params.story}</p>
      
      ${params.specific_details ? `<h3>Specific Details:</h3><p>${params.specific_details}</p>` : ''}
      
      <p><strong>Submission ID:</strong> ${params.submission_id}</p>
      <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
    `;

    const adminTo = process.env.ADMIN_TO_EMAIL || process.env.ADMIN_FROM_EMAIL!;

    const mailData = {
      message: {
        subject: `You've Got a Kabootar from ${params.name}`,
        body: {
          contentType: 'HTML',
          content: emailContent
        },
        toRecipients: [
          {
            emailAddress: {
              address: adminTo,
              name: 'Admin'
            }
          }
        ],
        ccRecipients: [
          {
            emailAddress: {
              address: params.email,
              name: params.name
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
    return false;
  }
}

export async function sendReplyEmail(clientEmail: string, params: EmailReplyParams): Promise<boolean> {
  try {
    if (!isConfigured) return false;
    const accessToken = await getAccessToken();
    
    const emailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>You've Got a Kabootar from CEO-The Written Hug</h2>
        <p>Dear ${params.client_name},</p>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          ${params.reply_message.replace(/\n/g, '<br>')}
        </div>
        
        <p>Best regards,<br>
        ${params.admin_name}<br>
        CEO - The Written Hug</p>
        
        ${params.reply_link ? `<p><a href="${params.reply_link}" style="color: #007bff;">View Conversation</a></p>` : ''}
      </div>
    `;

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
    return false;
  }
}