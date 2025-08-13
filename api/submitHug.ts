import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import Mailjet from 'node-mailjet';

// Validation schema
const submitHugSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().min(1, "Phone is required"),
  recipientName: z.string().min(1, "Recipient name is required"),
  serviceType: z.string().min(1, "Service type is required"),
  deliveryType: z.string().min(1, "Delivery type is required"),
  feelings: z.string().min(1, "Feelings are required"),
  story: z.string().min(1, "Story is required"),
  specificDetails: z.string().min(1, "Specific details are required"),
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

function buildSubmissionEmailHTML(formData: any, submissionId: string, adminPanelLink: string): string {
  const safe = (v: string) => escapeHtml(v || '');
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset=\"UTF-8\">
  <meta name=\"viewport\" content=\"width=device-width,initial-scale=1\">
  <title>New Written Hug Submission</title>
</head>
<body style=\"margin:0; padding:0; font-family: Arial, sans-serif; background:#f9f9f9;\">
  <div style=\"max-width:700px; margin:0 auto; background:#fff; border-radius:10px; overflow:hidden;\">
    <img src=\"https://drive.google.com/uc?export=view&id=1rO5kIJoKjpZfUGvK_HDmpvqHcuZGPnY-\" alt=\"Header\" style=\"width:100%; display:block;\">
    <div style=\"padding:20px;\">
      <h2 style=\"color:#ff6b6b; text-align:center; margin:0 0 12px;\">🪶 You’ve Got a Kabootar from ${safe(formData.name)}</h2>
      <table style=\"width:100%; border-collapse:collapse; font-size:14px;\">
        <tr style=\"background:#fff5f5;\"><td style=\"padding:10px; border:1px solid #ffd6d6;\">Name</td><td style=\"padding:10px; border:1px solid #ffd6d6;\">${safe(formData.name)}</td></tr>
        <tr><td style=\"padding:10px; border:1px solid #ffe6cc;\">Recipient's Name</td><td style=\"padding:10px; border:1px solid #ffe6cc;\">${safe(formData.recipientName)}</td></tr>
        <tr style=\"background:#fff5f5;\"><td style=\"padding:10px; border:1px solid #ffd6d6;\">Date</td><td style=\"padding:10px; border:1px solid #ffd6d6;\">${new Date().toLocaleString()}</td></tr>
        <tr><td style=\"padding:10px; border:1px solid #ffe6cc;\">Status</td><td style=\"padding:10px; border:1px solid #ffe6cc;\">New</td></tr>
        <tr style=\"background:#fff5f5;\"><td style=\"padding:10px; border:1px solid #ffd6d6;\">Email</td><td style=\"padding:10px; border:1px solid #ffd6d6;\">${safe(formData.email)}</td></tr>
        <tr><td style=\"padding:10px; border:1px solid #ffe6cc;\">Phone</td><td style=\"padding:10px; border:1px solid #ffe6cc;\">${safe(formData.phone)}</td></tr>
        <tr style=\"background:#fff5f5;\"><td style=\"padding:10px; border:1px solid #ffd6d6;\">Message Details</td><td style=\"padding:10px; border:1px solid #ffd6d6;\">${safe(`${formData.feelings}\n\n${formData.story}`)}</td></tr>
      </table>
      <p style=\"margin-top:14px; text-align:center;\">
        <a href=\"${adminPanelLink}\" style=\"color:#ff6b6b; text-decoration:none; font-weight:bold;\">View this conversation in Admin Panel →</a>
      </p>
    </div>
    <img src=\"https://drive.google.com/uc?export=view&id=1u10daNLgVdYZvj6j1dyG62mhODlo2TN5\" alt=\"Footer\" style=\"width:100%; display:block;\">
  </div>
</body>
</html>`;
}

async function sendSubmissionEmail(formData: any, submissionId: string, adminPanelLink: string) {
  try {
    const html = buildSubmissionEmailHTML(formData, submissionId, adminPanelLink);
    await mailjet
      .post("send", { 'version': 'v3.1' })
      .request({
        Messages: [
          {
            From: {
              Email: process.env.ADMIN_FROM_EMAIL || '',
              Name: "CEO-The Written Hug"
            },
            To: [
              { Email: formData.email, Name: formData.name },
              { Email: "onaamikasadguru@gmail.com", Name: "Admin" }
            ],
            Subject: `New Written Hug Submission — You’ve Got a Kabootar from ${formData.name}`,
            HTMLPart: html
          }
        ]
      });
    return true;
  } catch (error) {
    console.error('Mailjet error:', error);
    return false;
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const validatedData = submitHugSchema.parse(req.body);
    
    // Insert into Supabase (note: table name has space)
    const { data: hug, error } = await supabaseAdmin
      .from('written hug')
      .insert([{
        'Name': validatedData.name,
        'Recipient\'s Name': validatedData.recipientName,
        'Email Address': validatedData.email,
        'Phone Number': parseInt(validatedData.phone),
        'Type of Message': validatedData.serviceType,
        'Message Details': `${validatedData.feelings}\n\n${validatedData.story}`,
        'Feelings': validatedData.feelings,
        'Story': validatedData.story,
        'Specific Details': validatedData.specificDetails,
        'Delivery Type': validatedData.deliveryType,
        'Status': 'New',
        'Date': new Date().toISOString(),
      }])
      .select()
      .single();

    if (error) throw error;

    // Build admin panel link
    const proto = (req.headers['x-forwarded-proto'] as string) || 'https';
    const host = (req.headers['x-forwarded-host'] as string) || req.headers.host || '';
    const adminPanelLink = `${proto}://${host}/admin/conversation/${hug.id}`;

    // Send notification email to user and admin
    const emailSent = await sendSubmissionEmail(validatedData, hug.id, adminPanelLink);

    res.json({ success: true, hug, emailSent });
  } catch (error) {
    console.error('Submit hug error:', error);
    res.status(400).json({ 
      success: false, 
      message: error instanceof Error ? error.message : 'Failed to submit hug' 
    });
  }
}