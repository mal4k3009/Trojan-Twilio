import dotenv from 'dotenv';
import twilio from 'twilio';

dotenv.config();

const ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const WHATSAPP_NUMBER = process.env.TWILIO_WHATSAPP_NUMBER;

console.log('Testing Twilio credentials...');
console.log('Account SID:', ACCOUNT_SID);
console.log('Auth Token:', AUTH_TOKEN ? `${AUTH_TOKEN.substring(0, 8)}...` : 'Missing');
console.log('WhatsApp Number:', WHATSAPP_NUMBER);

const client = twilio(ACCOUNT_SID, AUTH_TOKEN);

async function testCredentials() {
    try {
        // Test basic account access
        console.log('\n🔍 Testing account access...');
        const account = await client.api.accounts(ACCOUNT_SID).fetch();
        console.log('✅ Account access successful:', account.friendlyName);
        
        // Test WhatsApp number validation
        console.log('\n📱 Testing WhatsApp configuration...');
        
        // Check if the WhatsApp number exists in account
        try {
            const phoneNumbers = await client.incomingPhoneNumbers.list();
            console.log('Available phone numbers:');
            phoneNumbers.forEach(number => {
                console.log(`- ${number.phoneNumber} (${number.friendlyName})`);
            });
            
            const whatsappNum = WHATSAPP_NUMBER.replace('whatsapp:', '');
            const foundNumber = phoneNumbers.find(num => num.phoneNumber === whatsappNum);
            
            if (foundNumber) {
                console.log(`✅ WhatsApp number ${whatsappNum} found in account`);
            } else {
                console.log(`❌ WhatsApp number ${whatsappNum} NOT found in account`);
                console.log('This might be why messages are failing');
            }
            
        } catch (error) {
            console.log('Error checking phone numbers:', error.message);
        }
        
    } catch (error) {
        console.error('❌ Credential test failed:', error.message);
        if (error.message.includes('Authentication Error')) {
            console.log('The Account SID or Auth Token appears to be incorrect');
        }
    }
}

testCredentials();
