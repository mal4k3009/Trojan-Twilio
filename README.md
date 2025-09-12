# wp-twilio

A WhatsApp Business messaging frontend that integrates with Supabase for message storage and n8n webhooks for message delivery.

## Features

- **Message Management**: View and send WhatsApp messages through a modern web interface
- **Supabase Integration**: All messages are stored and retrieved from Supabase database
- **n8n Webhook Integration**: Messages sent from the frontend are forwarded to n8n webhook for processing
- **Real-time Updates**: Messages are dynamically loaded from the database
- **Customer Management**: View customer conversations and message history

## Setup

1. **Clone and Install**:
   ```bash
   npm install
   ```

2. **Environment Configuration**:
   Create a `.env` file with:
   ```bash
   # Supabase Configuration
   VITE_SUPABASE_URL=https://tvmuzvxrfxuwmdrtzrch.supabase.co
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

   # n8n Webhook URL for sending WhatsApp messages
   VITE_N8N_WEBHOOK_URL=https://n8n.srv954870.hstgr.cloud/webhook/559d6fbe-b079-4e4d-acda-1a8868b6ed4f
   ```

3. **Start Development Server**:
   ```bash
   npm run dev
   ```

## How it Works

1. **Message Retrieval**: Messages are fetched from Supabase `ConversationalMemory` table
2. **Message Display**: The frontend displays conversations in a WhatsApp-like interface
3. **Message Sending**: When you send a message from the frontend:
   - Message content and recipient phone number are sent to the n8n webhook
   - Message is saved to Supabase database for record keeping
   - UI updates to show the sent message

## Architecture

- **Frontend**: React + TypeScript + Vite
- **Database**: Supabase (for message storage)
- **Webhook**: n8n (for message processing and delivery)
- **UI**: Tailwind CSS with responsive design

## Key Components

- `ChatArea`: Main chat interface for sending/receiving messages
- `CustomerList`: Sidebar showing all customer conversations
- `WhatsAppService`: Handles webhook communication with n8n
- `DatabaseService`: Manages Supabase data operations
