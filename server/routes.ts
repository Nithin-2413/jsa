import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { supabaseAdmin } from "./lib/supabase";
import { sendSubmissionEmail, sendReplyEmail } from "./lib/brevo";
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

const markEmailReadSchema = z.object({
  replyId: z.string().uuid(),
});

const incomingEmailSchema = z.object({
  hugid: z.string().uuid(),
  fromEmail: z.string().email(),
  subject: z.string(),
  message: z.string(),
  messageId: z.string().optional(),
});

const adminLoginSchema = z.object({
  username: z.string(),
  password: z.string(),
  location: z.object({
    latitude: z.number(),
    longitude: z.number(),
    city: z.string().optional(),
    country: z.string().optional(),
  }).optional(),
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

      // Send email notification using Brevo
      console.log('Attempting to send email with Brevo:', {
        hasApiKey: !!process.env.BREVO_API_KEY,
        hasAdminTemplate: !!process.env.BREVO_ADMIN_TEMPLATE_ID,
        hasUserTemplate: !!process.env.BREVO_USER_TEMPLATE_ID,
      });
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

      console.log('Email send result:', emailSent);
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
          message: validatedData.message
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

      // Send reply email using Brevo
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

  // Mark email/reply as read
  app.post("/api/markEmailRead", async (req, res) => {
    try {
      const validatedData = markEmailReadSchema.parse(req.body);

      const { error } = await supabaseAdmin
        .from('hug replies')
        .update({ sender_type: 'read' }) // Temporary workaround
        .eq('id', validatedData.replyId);

      if (error) throw error;

      res.json({ success: true });
    } catch (error) {
      console.error('Mark email read error:', error);
      res.status(400).json({ 
        success: false, 
        message: error instanceof Error ? error.message : 'Failed to mark as read' 
      });
    }
  });

  // Handle incoming email response (webhook endpoint)
  app.post("/api/incomingEmail", async (req, res) => {
    try {
      const validatedData = incomingEmailSchema.parse(req.body);

      // Insert incoming email as a reply
      const { data: reply, error: replyError } = await supabaseAdmin
        .from('hug replies')
        .insert([{
          hugid: validatedData.hugid,
          sender_type: 'client',
          sender_name: '', // Will be filled from hug data
          message: validatedData.message,
        }])
        .select()
        .single();

      if (replyError) throw replyError;

      // Update sender name from hug data
      const { data: hug } = await supabaseAdmin
        .from('written hug')
        .select('Name')
        .eq('id', validatedData.hugid)
        .single();

      if (hug) {
        await supabaseAdmin
          .from('hug replies')
          .update({ sender_name: hug.Name })
          .eq('id', reply.id);
      }

      // Update hug status to show there's a new response
      await supabaseAdmin
        .from('written hug')
        .update({ Status: 'Client Replied' })
        .eq('id', validatedData.hugid);

      res.json({ success: true, reply });
    } catch (error) {
      console.error('Incoming email error:', error);
      res.status(400).json({ 
        success: false, 
        message: error instanceof Error ? error.message : 'Failed to process incoming email' 
      });
    }
  });

  // Get unread message count for admin dashboard
  app.get("/api/getUnreadCount", async (req, res) => {
    try {
      // For now, return 0 since we don't have the is_read column yet
      res.json({ success: true, unreadCount: 0 });
    } catch (error) {
      console.error('Get unread count error:', error);
      res.status(500).json({ 
        success: false, 
        message: error instanceof Error ? error.message : 'Failed to get unread count' 
      });
    }
  });

  // Test email configuration
  app.get("/api/testEmail", async (req, res) => {
    try {
      console.log('Testing email configuration...');
      console.log('Environment variables check:', {
        hasClientId: !!process.env.OUTLOOK_CLIENT_ID,
        hasClientSecret: !!process.env.OUTLOOK_CLIENT_SECRET,
        hasTenantId: !!process.env.OUTLOOK_TENANT_ID,
        hasAdminEmail: !!process.env.ADMIN_FROM_EMAIL,
        adminEmail: process.env.ADMIN_FROM_EMAIL,
        clientIdLength: process.env.OUTLOOK_CLIENT_ID?.length,
        tenantIdLength: process.env.OUTLOOK_TENANT_ID?.length
      });

      const testResult = await sendSubmissionEmail({
        name: "Test User",
        recipient_name: "Test Recipient",
        email: "test@example.com",
        phone: "1234567890",
        type_of_message: "Test Message Type",
        message_details: "This is a test email to verify the new template works correctly.",
        feelings: "Testing feelings section",
        story: "Testing story section with multiple lines\nThis should show on a new line",
        specific_details: "Testing specific details section",
        delivery_type: "Digital",
        submission_id: "test-123",
      });
      
      res.json({ 
        success: testResult, 
        message: testResult ? "Test email sent successfully with new template" : "Test email failed - check server logs for details",
        environment: {
          hasClientId: !!process.env.OUTLOOK_CLIENT_ID,
          hasClientSecret: !!process.env.OUTLOOK_CLIENT_SECRET,
          hasTenantId: !!process.env.OUTLOOK_TENANT_ID,
          hasAdminEmail: !!process.env.ADMIN_FROM_EMAIL,
          adminEmail: process.env.ADMIN_FROM_EMAIL,
        },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Test email error:', error);
      res.status(500).json({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        environment: {
          hasClientId: !!process.env.OUTLOOK_CLIENT_ID,
          hasClientSecret: !!process.env.OUTLOOK_CLIENT_SECRET,
          hasTenantId: !!process.env.OUTLOOK_TENANT_ID,
          hasAdminEmail: !!process.env.ADMIN_FROM_EMAIL,
          adminEmail: process.env.ADMIN_FROM_EMAIL,
        },
        timestamp: new Date().toISOString()
      });
    }
  });

  // Admin login
  app.post("/api/adminLogin", async (req, res) => {
    try {
      const { username, password, location } = adminLoginSchema.parse(req.body);
      
      // Simple authentication check
      if (username === "SonuHoney" && password === "Chipmunk@15#") {
        // Log the admin login with location data
        if (location) {
          try {
            await supabaseAdmin
              .from('admin_login_logs')
              .insert([{
                username,
                latitude: location.latitude,
                longitude: location.longitude,
                city: location.city || null,
                country: location.country || null,
                ip_address: req.ip || req.connection.remoteAddress || 'unknown',
                user_agent: req.get('User-Agent') || 'unknown'
              }]);
          } catch (logError) {
            console.error('Failed to log admin login:', logError);
            // Don't fail the login if logging fails
          }
        }
        
        res.json({ success: true, message: "Login successful" });
      } else {
        res.status(401).json({ success: false, message: "Invalid credentials" });
      }
    } catch (error) {
      res.status(400).json({ 
        success: false, 
        message: "Invalid request" 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
