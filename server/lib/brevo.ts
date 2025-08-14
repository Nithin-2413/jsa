import axios from 'axios';

if (!process.env.BREVO_API_KEY) {
  throw new Error("BREVO_API_KEY environment variable must be set");
}

// Brevo API configuration
const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';
const BREVO_API_KEY = process.env.BREVO_API_KEY!;

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
    // Format the current date
    const currentDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    // Send email to admin using Brevo template
    const adminEmailData = {
      to: [
        {
          email: 'thewrittenhug@gmail.com',
          name: 'The Written Hug Admin'
        }
      ],
      templateId: parseInt(process.env.BREVO_ADMIN_TEMPLATE_ID || '1'), // You'll need to provide this
      params: {
        name: params.name,
        recipient_name: params.recipient_name,
        email: params.email,
        phone: params.phone,
        type_of_message: params.type_of_message,
        message_details: params.message_details,
        feelings: params.feelings,
        story: params.story,
        specific_details: params.specific_details || 'None provided',
        delivery_type: params.delivery_type,
        submission_date: currentDate,
        submission_id: params.submission_id
      }
    };

    // Send confirmation email to user using Brevo template
    const userEmailData = {
      to: [
        {
          email: params.email,
          name: params.name
        }
      ],
      templateId: parseInt(process.env.BREVO_USER_TEMPLATE_ID || '2'), // You'll need to provide this
      params: {
        name: params.name,
        recipient_name: params.recipient_name,
        email: params.email,
        phone: params.phone,
        type_of_message: params.type_of_message,
        message_details: params.message_details,
        feelings: params.feelings,
        story: params.story,
        specific_details: params.specific_details || 'None provided',
        delivery_type: params.delivery_type,
        submission_date: currentDate,
        submission_id: params.submission_id
      }
    };

    // Send both emails using Brevo
    await Promise.all([
      axios.post(BREVO_API_URL, adminEmailData, {
        headers: {
          'api-key': BREVO_API_KEY,
          'Content-Type': 'application/json'
        }
      }),
      axios.post(BREVO_API_URL, userEmailData, {
        headers: {
          'api-key': BREVO_API_KEY,
          'Content-Type': 'application/json'
        }
      })
    ]);
    
    return true;
  } catch (error) {
    console.error('Brevo submission email error:', error);
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
    // Send reply email using Brevo template
    const replyEmailData = {
      to: [
        {
          email: clientEmail,
          name: params.client_name
        }
      ],
      templateId: parseInt(process.env.BREVO_REPLY_TEMPLATE_ID || '3'), // You'll need to provide this
      params: {
        client_name: params.client_name,
        reply_message: params.reply_message,
        admin_name: params.admin_name
      },
      replyTo: {
        email: 'thewrittenhug@gmail.com',
        name: 'The Written Hug Team'
      }
    };

    await axios.post(BREVO_API_URL, replyEmailData, {
      headers: {
        'api-key': BREVO_API_KEY,
        'Content-Type': 'application/json'
      }
    });
    
    return true;
  } catch (error) {
    console.error('Brevo reply email error:', error);
    if (error instanceof Error && 'response' in error) {
      const axiosError = error as any;
      console.error('Response status:', axiosError.response?.status);
      console.error('Response data:', axiosError.response?.data);
    }
    return false;
  }
}