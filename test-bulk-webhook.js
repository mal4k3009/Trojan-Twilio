// Test script to verify bulk webhook functionality
const WEBHOOK_URL = 'https://n8n.srv954870.hstgr.cloud/webhook/559d6fbe-b079-4e4d-acda-1a8868b6ed4f';

async function testBulkWebhook() {
    const testPhones = ['+1234567890', '+9876543210'];
    const testMessage = 'Hello! This is a bulk test message.';
    
    console.log('🔄 Testing bulk webhook functionality...');
    
    for (let i = 0; i < testPhones.length; i++) {
        const phone = testPhones[i];
        
        try {
            const webhookData = {
                phone: phone,
                message: testMessage,
                customerId: (i + 1).toString(),
                timestamp: new Date().toISOString(),
                from: 'frontend-bulk'
            };

            const urlParams = new URLSearchParams(webhookData);
            const webhookUrlWithParams = `${WEBHOOK_URL}?${urlParams.toString()}`;
            
            console.log(`📱 Sending to ${phone}...`);
            
            const response = await fetch(webhookUrlWithParams, {
                method: 'GET'
            });

            if (response.ok) {
                const data = await response.json();
                console.log(`✅ Success for ${phone}:`, data);
            } else {
                console.log(`❌ Failed for ${phone}:`, response.status);
            }
            
            // Add delay between requests
            await new Promise(resolve => setTimeout(resolve, 500));
            
        } catch (error) {
            console.error(`💥 Error for ${phone}:`, error.message);
        }
    }
    
    console.log('🏁 Bulk test completed!');
}

// Run the test
testBulkWebhook();
