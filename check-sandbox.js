import dotenv from 'dotenv';
import twilio from 'twilio';

dotenv.config();

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

async function checkWhatsAppSandbox() {
    try {
        console.log('🔍 Checking WhatsApp Sandbox Configuration...');
        
        // Try to get account info
        const account = await client.api.accounts(process.env.TWILIO_ACCOUNT_SID).fetch();
        console.log(`Account: ${account.friendlyName} (${account.status})`);
        
        // Try to find WhatsApp sandbox number
        console.log('\n📱 Attempting to find sandbox WhatsApp number...');
        
        // Check if we can send a test message to understand the error better
        try {
            console.log('\n🧪 Testing with sandbox number format...');
            // Try common sandbox formats
            const testNumbers = [
                'whatsapp:+14155238886', // Common Twilio sandbox
                'whatsapp:+15557781885', // Your previous working number
                'whatsapp:+918487058582'  // Your current number
            ];
            
            for (const testNum of testNumbers) {
                console.log(`Testing from number: ${testNum}`);
                try {
                    // Don't actually send, just validate the number format
                    const validation = await client.lookups.v1.phoneNumbers(testNum.replace('whatsapp:', '')).fetch();
                    console.log(`✅ ${testNum} - Valid number format`);
                } catch (error) {
                    console.log(`❌ ${testNum} - ${error.message}`);
                }
            }
            
        } catch (error) {
            console.log('Error testing numbers:', error.message);
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

checkWhatsAppSandbox();
