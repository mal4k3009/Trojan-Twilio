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
  console.error('Please check your .env file contains:');
  console.error('- TWILIO_ACCOUNT_SID');
  console.error('- TWILIO_AUTH_TOKEN');
  console.error('- TWILIO_WHATSAPP_NUMBER');
  process.exit(1);
}

const client = twilio(ACCOUNT_SID, AUTH_TOKEN);

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000'],
  credentials: true
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Route to send WhatsApp message
app.post('/send-whatsapp', async (req, res) => {
  const { phone, message, customerId } = req.body;

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
    
    console.log(`📱 Sending message to ${formattedPhone}: ${message}`);
    
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

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'Server is running', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 WhatsApp Backend Server running on http://localhost:${PORT}`);
  console.log(`📱 Twilio Account SID: ${ACCOUNT_SID}`);
  console.log(`📞 WhatsApp Number: ${TWILIO_PHONE_NUMBER}`);
});
