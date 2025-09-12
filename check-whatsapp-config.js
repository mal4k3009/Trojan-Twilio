import dotenv from 'dotenv';
import twilio from 'twilio';

dotenv.config();

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

async function checkWhatsAppNumbers() {
    try {
        console.log('Checking WhatsApp phone numbers...');
        
        // List all phone numbers
        const phoneNumbers = await client.incomingPhoneNumbers.list();
        console.log('\n📱 All Phone Numbers:');
        phoneNumbers.forEach(number => {
            console.log(`- ${number.phoneNumber} (${number.friendlyName})`);
        });

        // Check WhatsApp senders
        console.log('\n📢 Checking WhatsApp Senders...');
        try {
            const senders = await client.messaging.v1.services.list();
            senders.forEach(service => {
                console.log(`Service: ${service.friendlyName} (${service.sid})`);
            });
        } catch (error) {
            console.log('No messaging services found or error:', error.message);
        }

        // Try to list available WhatsApp numbers
        console.log('\n🔍 Trying to find WhatsApp channels...');
        try {
            const channels = await client.conversations.v1.services.list();
            channels.forEach(service => {
                console.log(`Conversation Service: ${service.friendlyName} (${service.sid})`);
            });
        } catch (error) {
            console.log('Error checking conversation services:', error.message);
        }

    } catch (error) {
        console.error('Error:', error.message);
    }
}

checkWhatsAppNumbers();
