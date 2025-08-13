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

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function buildReplyEmailHTML(clientName: string, replyMessage: string): string {
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
        Hi ${safe(clientName)},
      </p>

      <div style="background:#fff5f7; border-radius:8px; padding:16px 18px; border:1px solid #f9ccd3;">
        <p style="margin:0; font-size:15px; line-height:1.6; text-align:justify; color:#2f2f2f;">
          ${safe(replyMessage).replace(/\n/g, '<br>')}
        </p>
      </div>
 <img src="https://drive.google.com/uc?export=view&id=1u10daNLgVdYZvj6j1dyG62mhODlo2TN5" alt="Footer" style="width:100%; display:block;">
</div>`;
}

async function sendReplyEmail(clientEmail: string, emailData: any) {
  try {
    const html = buildReplyEmailHTML(emailData.client_name, emailData.reply_message);
    await mailjet
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
            Subject: "You've Got a Kabootar from CEO-The Written Hug",
            HTMLPart: html
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
    const proto = (req.headers['x-forwarded-proto'] as string) || 'https';
    const host = (req.headers['x-forwarded-host'] as string) || req.headers.host || '';
    const replyLink = `${proto}://${host}/admin/conversation/${validatedData.hugid}`;

    const emailSent = await sendReplyEmail(hug['Email Address'] as string, {
      client_name: hug.Name as string,
      reply_message: validatedData.message,
      admin_name: validatedData.admin_name,
      from_email: process.env.ADMIN_FROM_EMAIL || '',
      reply_link: replyLink,
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