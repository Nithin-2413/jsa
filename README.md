# The Written Hug - Heartfelt Message Delivery Service

A full-stack web application with admin system for managing personalized message delivery services.

## Features

- **Public Website**: Beautiful landing page with service showcase and contact form
- **Admin Dashboard**: Gmail-like interface for managing submissions and conversations
- **Email Integration**: Automated notifications via Mailjet
- **Database**: Supabase integration for data persistence

## Setup Instructions

### Environment Variables

Set these variables in your Replit Secrets:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Mailjet
MAILJET_API_KEY=your_mailjet_api_key
MAILJET_API_SECRET=your_mailjet_secret
MAILJET_TEMPLATE_ID_SUBMISSION=7221146
MAILJET_TEMPLATE_ID_REPLY=7221431

# Admin Configuration
ADMIN_EMAIL=onaamikaonaamika@gmail.com
ADMIN_FROM_EMAIL=onaamikasadguru@gmail.com
```

### Database Setup

Create these tables in your Supabase database:

```sql
-- Submissions table
CREATE TABLE public.written_hug (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "Name" text,
  Date timestamptz DEFAULT now(),
  "Recipient's Name" text,
  Status varchar,
  "Email Address" varchar,
  "Phone Number" float8,
  "Type of Message" varchar,
  "Message Details" varchar,
  Feelings varchar,
  Story varchar,
  "Specific Details" varchar,
  "Delivery Type" varchar
);

-- Replies table
CREATE TABLE public.hug_replies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  hugid uuid REFERENCES public.written_hug(id) ON DELETE CASCADE,
  sender_type text,
  sender_name text,
  message text
);
```

### Mailjet Templates

Configure these templates in your Mailjet account:

**Template ID 7221146 (Submission notification)** - Variables to use:
- name, recipient_name, email, phone, type_of_message
- message_details, feelings, story, specific_details
- delivery_type, submission_id

**Template ID 7221431 (Reply notification)** - Variables to use:
- client_name, reply_message, admin_name
- reply_link, from_email, admin_panel_link

## Usage

1. **Public Form**: Users fill out the contact form on the homepage
2. **Admin Notification**: Admin receives email notification for new submissions
3. **Admin Dashboard**: Access via `/admin` with password `admin123`
4. **Conversation View**: Click "View Conversation" to see details and reply
5. **Client Notification**: Clients receive email replies automatically

## API Endpoints

- `POST /api/submitHug` - Submit new message request
- `GET /api/getHugs` - Get all submissions (admin)
- `GET /api/getConversation?hugid=<id>` - Get conversation details
- `POST /api/sendReply` - Send admin reply

## Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS, Wouter routing
- **Backend**: Express.js, Node.js
- **Database**: Supabase (PostgreSQL)
- **Email**: Mailjet
- **UI Components**: Shadcn/ui, Radix UI
- **Build Tool**: Vite

## Deployment

This project is configured for Replit deployment. Simply run the "Start application" workflow to launch both frontend and backend servers.