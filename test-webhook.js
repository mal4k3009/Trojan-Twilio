// Test script to verify n8n webhook integration
const WEBHOOK_URL = 'https://n8n.srv954870.hstgr.cloud/webhook/559d6fbe-b079-4e4d-acda-1a8868b6ed4f';

async function testWebhook() {
    try {
        console.log('🔄 Testing n8n webhook...');
        
        const testData = {
            phone: '+1234567890',
            message: 'Test message from frontend',
            customerId: 123,
            timestamp: new Date().toISOString(),
            from: 'frontend'
        };

        // Create URL with query parameters for GET request
        const urlParams = new URLSearchParams(testData);
        const urlWithParams = `${WEBHOOK_URL}?${urlParams.toString()}`;

        const response = await fetch(urlWithParams, {
            method: 'GET'
        });

        console.log('📡 Response status:', response.status);
        console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));

        let responseData;
        try {
            responseData = await response.json();
            console.log('📦 Response data:', responseData);
        } catch (e) {
            responseData = await response.text();
            console.log('📦 Response text:', responseData);
        }

        if (response.ok) {
            console.log('✅ Webhook test successful!');
            return { success: true, data: responseData };
        } else {
            console.log('❌ Webhook test failed with status:', response.status);
            return { success: false, error: `HTTP ${response.status}` };
        }

    } catch (error) {
        console.error('💥 Webhook test error:', error);
        return { success: false, error: error.message };
    }
}

// Run the test
testWebhook().then(result => {
    console.log('🏁 Final result:', result);
});
