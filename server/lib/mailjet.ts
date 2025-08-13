import Mailjet from 'node-mailjet';

if (!process.env.MAILJET_API_KEY || !process.env.MAILJET_API_SECRET) {
  throw new Error("MAILJET_API_KEY and MAILJET_API_SECRET environment variables must be set");
}

const mailjet = Mailjet.apiConnect(
  process.env.MAILJET_API_KEY,
  process.env.MAILJET_API_SECRET
);

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

export async function sendSubmissionEmailMailjet(params: EmailSubmissionParams): Promise<boolean> {
  try {
    const templateId = parseInt(process.env.MAILJET_TEMPLATE_ID_SUBMISSION || '7221431');
    
    const request = mailjet
      .post('send', { version: 'v3.1' })
      .request({
        Messages: [
          {
            From: {
              Email: process.env.ADMIN_FROM_EMAIL,
              Name: "The Written Hug"
            },
            To: [
              {
                Email: process.env.ADMIN_EMAIL,
                Name: "Admin"
              }
            ],
            Cc: [
              {
                Email: params.email,
                Name: params.name
              }
            ],
            TemplateID: templateId,
            TemplateLanguage: true,
            Subject: `You've Got a Kabootar from ${params.name}`,
            Variables: {
              name: params.name,
              recipient_name: params.recipient_name,
              email: params.email,
              phone: params.phone,
              type_of_message: params.type_of_message,
              delivery_type: params.delivery_type,
              feelings: params.feelings,
              story: params.story,
              specific_details: params.specific_details || '',
              submission_id: params.submission_id,
              date: new Date().toLocaleString()
            }
          }
        ]
      });

    const result = await request;
    console.log('Mailjet submission email sent successfully:', result.body);
    return true;
  } catch (error) {
    console.error('Mailjet submission email error:', error);
    return false;
  }
}

export async function sendReplyEmailMailjet(clientEmail: string, params: EmailReplyParams): Promise<boolean> {
  try {
    const templateId = parseInt(process.env.MAILJET_TEMPLATE_ID_REPLY || '7221146');
    
    const request = mailjet
      .post('send', { version: 'v3.1' })
      .request({
        Messages: [
          {
            From: {
              Email: params.from_email,
              Name: "The Written Hug - CEO"
            },
            To: [
              {
                Email: clientEmail,
                Name: params.client_name
              }
            ],
            TemplateID: templateId,
            TemplateLanguage: true,
            Subject: "You've Got a Kabootar from CEO-The Written Hug",
            Variables: {
              client_name: params.client_name,
              reply_message: params.reply_message,
              admin_name: params.admin_name,
              reply_link: params.reply_link || '',
              admin_panel_link: params.admin_panel_link || ''
            }
          }
        ]
      });

    const result = await request;
    console.log('Mailjet reply email sent successfully:', result.body);
    return true;
  } catch (error) {
    console.error('Mailjet reply email error:', error);
    return false;
  }
}