import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { supabaseAdmin } from "./lib/supabase";
import { sendSubmissionEmail, sendReplyEmail } from "./lib/outlook";
import { z } from "zod";

const submitHugSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  phone: z.string(),
  recipientName: z.string(),
  serviceType: z.string(),
  deliveryType: z.string(),
  feelings: z.string(),
  story: z.string(),
  specificDetails: z.string().optional(),
});

const sendReplySchema = z.object({
  hugid: z.string().uuid(),
  message: z.string(),
  admin_name: z.string(),
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Submit hug form
  app.post("/api/submitHug", async (req, res) => {
    try {
      const validatedData = submitHugSchema.parse(req.body);
      
      // Insert into Supabase (note: table name has space)
      const { data: hug, error } = await supabaseAdmin
        .from('written hug')
        .insert([{
          'Name': validatedData.name,
          'Recipient\'s Name': validatedData.recipientName,
          'Status': 'New',
          'Email Address': validatedData.email,
          'Phone Number': parseFloat(validatedData.phone),
          'Type of Message': validatedData.serviceType,
          'Message Details': `${validatedData.feelings}\n\n${validatedData.story}`,
          'Feelings': validatedData.feelings,
          'Story': validatedData.story,
          'Specific Details': validatedData.specificDetails || '',
          'Delivery Type': validatedData.deliveryType,
        }])
        .select()
        .single();

      if (error) throw error;

      // Send email notification using Outlook
      let emailSent = await sendSubmissionEmail({
        name: validatedData.name,
        recipient_name: validatedData.recipientName,
        email: validatedData.email,
        phone: validatedData.phone,
        type_of_message: validatedData.serviceType,
        message_details: `${validatedData.feelings}\n\n${validatedData.story}`,
        feelings: validatedData.feelings,
        story: validatedData.story,
        specific_details: validatedData.specificDetails || '',
        delivery_type: validatedData.deliveryType,
        submission_id: hug.id,
      });

      res.json({ success: true, hug, emailSent });
    } catch (error) {
      console.error('Submit hug error:', error);
      res.status(400).json({ 
        success: false, 
        message: error instanceof Error ? error.message : 'Failed to submit' 
      });
    }
  });

  // Get all hugs for admin
  app.get("/api/getHugs", async (req, res) => {
    try {
      const { data: hugs, error } = await supabaseAdmin
        .from('written hug')
        .select('*')
        .order('Date', { ascending: false });

      if (error) throw error;

      res.json({ success: true, hugs });
    } catch (error) {
      console.error('Get hugs error:', error);
      res.status(500).json({ 
        success: false, 
        message: error instanceof Error ? error.message : 'Failed to fetch hugs' 
      });
    }
  });

  // Get conversation (hug + replies)
  app.get("/api/getConversation", async (req, res) => {
    try {
      const hugid = req.query.hugid as string;
      if (!hugid) {
        return res.status(400).json({ success: false, message: 'hugid required' });
      }

      // Get the hug
      const { data: hug, error: hugError } = await supabaseAdmin
        .from('written hug')
        .select('*')
        .eq('id', hugid)
        .single();

      if (hugError) throw hugError;

      // Get replies (note: table name has space)
      const { data: replies, error: repliesError } = await supabaseAdmin
        .from('hug replies')
        .select('*')
        .eq('hugid', hugid)
        .order('created_at', { ascending: true });

      if (repliesError) throw repliesError;

      res.json({ success: true, hug, replies });
    } catch (error) {
      console.error('Get conversation error:', error);
      res.status(500).json({ 
        success: false, 
        message: error instanceof Error ? error.message : 'Failed to fetch conversation' 
      });
    }
  });

  // Send reply
  app.post("/api/sendReply", async (req, res) => {
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

      // Send reply email using Outlook
      let emailSent = await sendReplyEmail(hug['Email Address'] as string, {
        client_name: hug.Name as string,
        reply_message: validatedData.message,
        admin_name: validatedData.admin_name,
        from_email: process.env.ADMIN_FROM_EMAIL || '',
        reply_link: `${req.protocol}://${req.get('host')}/admin/${validatedData.hugid}`,
      });

      // Update status to "Replied"
      await supabaseAdmin
        .from('written hug')
        .update({ Status: 'Replied' })
        .eq('id', validatedData.hugid);

      res.json({ success: true, reply, emailSent });
    } catch (error) {
      console.error('Send reply error:', error);
      res.status(400).json({ 
        success: false, 
        message: error instanceof Error ? error.message : 'Failed to send reply' 
      });
    }
  });

  // Admin login route is handled by serverless function in /api/adminLogin
  app.all('/api/adminLogin', (_req, res) => {
    res.status(404).json({ success: false, message: 'Use serverless /api/adminLogin' });
  });

  const httpServer = createServer(app);
  return httpServer;
}
