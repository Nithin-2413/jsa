import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import Mailjet from 'node-mailjet';

const sendReplySchema = z.object({
  hugid: z.string().uuid(),
  message: z.string().min(1, "Message is required"),
  admin_name: z.string().min(1, "Admin name is required"),
});

// Initialize Supabase client
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

// Initialize Mailjet
const mailjet = new Mailjet({
  apiKey: process.env.MAILJET_API_KEY || '',
  apiSecret: process.env.MAILJET_API_SECRET || ''
});

async function sendReplyEmail(clientEmail: string, emailData: any) {
  try {
    const request = await mailjet
      .post("send", {'version': 'v3.1'})
      .request({
        Messages: [
          {
            From: {
              Email: process.env.ADMIN_FROM_EMAIL || '',
              Name: "CEO-The Written Hug"
            },
            To: [
              {
                Email: clientEmail,
                Name: emailData.client_name
              }
            ],
            TemplateID: parseInt(process.env.MAILJET_TEMPLATE_ID_REPLY || '7221146'),
            TemplateLanguage: true,
            Subject: "You've Got a Kabootar from CEO-The Written Hug",
            Variables: {
              client_name: emailData.client_name,
              reply_message: emailData.reply_message,
              admin_name: "CEO-The Written Hug",
              from_email: emailData.from_email,
              reply_link: emailData.reply_link,
            }
          }
        ]
      });
    return true;
  } catch (error) {
    console.error('Reply email error:', error);
    return false;
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const validatedData = sendReplySchema.parse(req.body);

    // Insert reply into database with CEO-The Written Hug as sender (note: table name has space)
    const { data: reply, error: replyError } = await supabaseAdmin
      .from('hug replies')
      .insert([{
        hugid: validatedData.hugid,
        sender_type: 'admin',
        sender_name: 'CEO-The Written Hug',
        message: validatedData.message,
      }])
      .select()
      .single();

    if (replyError) throw replyError;

    // Get client details
    const { data: hug, error: hugError } = await supabaseAdmin
      .from('written hug')
      .select('Name, "Email Address"')
      .eq('id', validatedData.hugid)
      .single();

    if (hugError) throw hugError;
    if (!hug) throw new Error('Hug not found');

    // Send email to client
    const emailSent = await sendReplyEmail(hug['Email Address'] as string, {
      client_name: hug.Name as string,
      reply_message: validatedData.message,
      admin_name: validatedData.admin_name,
      from_email: process.env.ADMIN_FROM_EMAIL || '',
      reply_link: `${req.headers.host}/admin/${validatedData.hugid}`,
    });

    // Update status to "Replied"
    await supabaseAdmin
      .from('written hug')
      .update({ Status: 'Replied' })
      .eq('id', validatedData.hugid);

    res.json({ success: true, reply, emailSent });
  } catch (error) {
    console.error('Send reply error:', error);
    res.status(500).json({ 
      success: false, 
      message: error instanceof Error ? error.message : 'Failed to send reply' 
    });
  }
}