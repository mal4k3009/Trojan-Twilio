require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const twilio = require('twilio');

const app = express();
const PORT = process.env.PORT || 5000;

// Twilio configuration from environment variables
const ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_PHONE_NUMBER = process.env.TWILIO_WHATSAPP_NUMBER;

if (!ACCOUNT_SID || !AUTH_TOKEN || !TWILIO_PHONE_NUMBER) {
  console.error('❌ Missing required Twilio environment variables');
  console.error('Please check your environment variables contain:');
  console.error('- TWILIO_ACCOUNT_SID');
  console.error('- TWILIO_AUTH_TOKEN');
  console.error('- TWILIO_WHATSAPP_NUMBER');
  process.exit(1);
}

const client = twilio(ACCOUNT_SID, AUTH_TOKEN);

// Middleware - Allow all origins for production deployment
app.use(cors({
  origin: true, // Allow all origins
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// Add request logging for debugging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Route to send WhatsApp message
app.post('/send-whatsapp', async (req, res) => {
  const { phone, message, customerId } = req.body;

  console.log('📨 Received request:', { phone, message: message?.substring(0, 50) + '...', customerId });

  if (!phone || !message) {
    return res.status(400).json({ 
      success: false, 
      error: 'Phone number and message are required' 
    });
  }

  try {
    // Clean and format phone number for WhatsApp
    let cleanPhone = phone.replace(/\s+/g, '').replace(/[^\d+]/g, '');
    
    // Ensure it starts with + if it doesn't
    if (!cleanPhone.startsWith('+')) {
      cleanPhone = '+' + cleanPhone;
    }
    
    // Format for WhatsApp API
    const formattedPhone = `whatsapp:${cleanPhone}`;
    
    console.log(`📱 Sending message to ${formattedPhone}: ${message.substring(0, 100)}...`);
    
    // Send message via Twilio
    const twilioMessage = await client.messages.create({
      body: message,
      from: TWILIO_PHONE_NUMBER,
      to: formattedPhone
    });

    console.log('✅ Message sent successfully:', twilioMessage.sid);
    console.log('📊 Message status:', twilioMessage.status);

    res.json({
      success: true,
      sid: twilioMessage.sid,
      status: twilioMessage.status,
      messageId: twilioMessage.sid,
      to: formattedPhone,
      from: TWILIO_PHONE_NUMBER
    });

  } catch (error) {
    console.error('❌ Error sending WhatsApp message:', error);
    
    // Provide more specific error messages
    let errorMessage = 'Failed to send message';
    if (error.message.includes('not a valid phone number')) {
      errorMessage = 'Invalid phone number format. Please include country code (e.g., +1234567890)';
    } else if (error.message.includes('not a valid WhatsApp number')) {
      errorMessage = 'This number is not registered with WhatsApp or not in your Twilio sandbox';
    } else if (error.message.includes('Forbidden')) {
      errorMessage = 'Number not authorized in Twilio sandbox. Please add to sandbox first';
    } else {
      errorMessage = error.message || 'Failed to send message';
    }
    
    res.status(500).json({
      success: false,
      error: errorMessage,
      twilioError: error.message
    });
  }
});

// WhatsApp Webhook endpoint - receives incoming messages from Twilio
app.post('/webhook/whatsapp', async (req, res) => {
  console.log('📨 Received WhatsApp webhook from Twilio');
  console.log('Headers:', req.headers);
  console.log('Body:', req.body);

  try {
    // Extract message data from Twilio webhook
    const {
      From: fromNumber,
      To: toNumber,
      Body: messageBody,
      MessageSid: messageSid,
      AccountSid: accountSid,
      MessagingServiceSid: messagingServiceSid,
      NumMedia: numMedia,
      ProfileName: profileName,
      WaId: waId
    } = req.body;

    // Prepare data to send to n8n webhook
    const webhookData = {
      timestamp: new Date().toISOString(),
      messageId: messageSid,
      from: fromNumber,
      to: toNumber,
      message: messageBody,
      profileName: profileName || 'Unknown',
      whatsappId: waId,
      numMedia: numMedia || '0',
      accountSid: accountSid,
      messagingServiceSid: messagingServiceSid,
      rawTwilioData: req.body
    };

    console.log('📤 Forwarding to n8n webhook:', webhookData);

    // Forward to n8n webhook
    const n8nResponse = await fetch('https://n8n.srv954870.hstgr.cloud/webhook/824ccc77-117a-47f9-b102-a85e89708332', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(webhookData)
    });

    if (n8nResponse.ok) {
      console.log('✅ Successfully forwarded to n8n webhook');
    } else {
      console.log('⚠️ Failed to forward to n8n webhook:', n8nResponse.status);
    }

    // Respond to Twilio (required to acknowledge receipt)
    res.set('Content-Type', 'text/xml');
    res.send(`<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>Message received and forwarded to n8n</Message>
</Response>`);

  } catch (error) {
    console.error('❌ Error processing WhatsApp webhook:', error);
    
    // Still respond to Twilio to acknowledge receipt
    res.set('Content-Type', 'text/xml');
    res.send(`<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>Error processing message</Message>
</Response>`);
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'Server is running', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'WhatsApp Backend API', 
    status: 'running',
    endpoints: [
      'GET /health - Health check',
      'POST /send-whatsapp - Send WhatsApp message',
      'POST /webhook/whatsapp - Receive incoming WhatsApp messages'
    ]
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ Unhandled error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

// Handle 404
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 WhatsApp Backend Server running on port ${PORT}`);
  console.log(`📱 Twilio Account SID: ${ACCOUNT_SID}`);
  console.log(`📞 WhatsApp Number: ${TWILIO_PHONE_NUMBER}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('👋 Received SIGTERM, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('👋 Received SIGINT, shutting down gracefully');
  process.exit(0);
});
