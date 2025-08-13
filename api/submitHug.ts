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

async function sendSubmissionEmail(formData: any) {
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
                Email: "onaamikaonaamika@gmail.com",
                Name: "Admin"
              }
            ],
            Bcc: [
              {
                Email: "bintemp8@gmail.com",
                Name: "BCC Admin"
              }
            ],
            TemplateID: parseInt(process.env.MAILJET_TEMPLATE_ID_SUBMISSION || '7221431'),
            TemplateLanguage: true,
            Subject: `You've Got a Kabootar from ${formData.name}`,
            Variables: {
              client_name: formData.name,
              recipient_name: formData.recipientName,
              email: formData.email,
              phone: formData.phone,
              service_type: formData.serviceType,
              delivery_type: formData.deliveryType,
              feelings: formData.feelings,
              story: formData.story,
              specific_details: formData.specificDetails,
              submission_date: new Date().toLocaleDateString(),
            }
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

    // Send notification email
    const emailSent = await sendSubmissionEmail(validatedData);

    res.json({ success: true, hug, emailSent });
  } catch (error) {
    console.error('Submit hug error:', error);
    res.status(400).json({ 
      success: false, 
      message: error instanceof Error ? error.message : 'Failed to submit hug' 
    });
  }
}