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
app.use(cors());
app.use(bodyParser.json());

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
    // Format phone number for WhatsApp
    const formattedPhone = phone.startsWith('whatsapp:') ? phone : `whatsapp:${phone}`;
    
    console.log(`Sending message to ${formattedPhone}: ${message}`);
    
    // Send message via Twilio
    const twilioMessage = await client.messages.create({
      body: message,
      from: TWILIO_PHONE_NUMBER,
      to: formattedPhone
    });

    console.log('Message sent successfully:', twilioMessage.sid);

    res.json({
      success: true,
      sid: twilioMessage.sid,
      status: twilioMessage.status,
      messageId: twilioMessage.sid
    });

  } catch (error) {
    console.error('Error sending WhatsApp message:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to send message'
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
