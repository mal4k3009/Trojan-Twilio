import dotenv from 'dotenv';
import twilio from 'twilio';

dotenv.config();

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

async function findWhatsAppSandbox() {
    try {
        console.log('🔍 Looking for WhatsApp Sandbox configuration...');
        
        // Check for Twilio WhatsApp Sandbox
        // The sandbox typically uses +14155238886 as the from number
        const sandboxNumbers = [
            'whatsapp:+14155238886',  // Common US sandbox
            'whatsapp:+15557781885',  // Your old working number
        ];
        
        console.log('\n📱 Testing possible sandbox numbers...');
        
        for (const sandboxNum of sandboxNumbers) {
            try {
                console.log(`Testing ${sandboxNum}...`);
                
                // Try to send a test message (this will fail but give us info about the number)
                const result = await client.messages.create({
                    body: 'Test message',
                    from: sandboxNum,
                    to: 'whatsapp:+919313061975'
                });
                
                console.log(`✅ ${sandboxNum} works! Message SID: ${result.sid}`);
                return sandboxNum;
                
            } catch (error) {
                if (error.message.includes('not a valid WhatsApp number')) {
                    console.log(`❌ ${sandboxNum} - Not authorized for WhatsApp`);
                } else if (error.message.includes('not a valid phone number')) {
                    console.log(`❌ ${sandboxNum} - Invalid number format`);
                } else if (error.message.includes('Forbidden')) {
                    console.log(`❌ ${sandboxNum} - Number not in sandbox (need to join first)`);
                } else if (error.message.includes('Channel')) {
                    console.log(`❌ ${sandboxNum} - Channel not found`);
                } else {
                    console.log(`❌ ${sandboxNum} - ${error.message}`);
                }
            }
        }
        
        console.log('\n⚠️  No working WhatsApp numbers found.');
        console.log('You need to either:');
        console.log('1. Set up WhatsApp Sandbox in Twilio Console');
        console.log('2. Purchase and configure a WhatsApp Business number');
        console.log('3. Use the existing WhatsApp number from your account');
        
    } catch (error) {
        console.error('Error:', error.message);
    }
}

findWhatsAppSandbox();
