// WhatsApp API service
export class WhatsAppService {
  private static readonly N8N_WEBHOOK_URL = import.meta.env.VITE_N8N_WEBHOOK_URL || 'https://n8n.srv954870.hstgr.cloud/webhook/824ccc77-117a-47f9-b102-a85e89708332';

  /**
   * Send a WhatsApp message via n8n webhook
   */
  static async sendMessage(phone: string, message: string, customerId?: number) {
    try {
      // Clean the phone number and ensure it has the right format
      let cleanPhone = phone.replace(/\s+/g, '').replace(/[^\d+]/g, '');
      
      // Ensure it starts with + if it doesn't
      if (!cleanPhone.startsWith('+')) {
        cleanPhone = '+' + cleanPhone;
      }
      
      console.log(`📱 Sending WhatsApp message to: ${cleanPhone}`);
      console.log(`💬 Message: ${message}`);
      console.log(`🆔 Customer ID: ${customerId || 'N/A'}`);

      // Send message data to n8n webhook via GET request with query parameters
      const webhookData = {
        phone: cleanPhone,
        message: message,
        customerId: customerId?.toString() || '',
        timestamp: new Date().toISOString(),
        from: 'frontend'
      };

      const urlParams = new URLSearchParams(webhookData);
      const webhookUrlWithParams = `${this.N8N_WEBHOOK_URL}?${urlParams.toString()}`;
      
      console.log('🔗 Webhook URL:', webhookUrlWithParams);
      console.log('📦 Webhook Data:', webhookData);

      const response = await fetch(webhookUrlWithParams, {
        method: 'GET'
      });

      if (!response.ok) {
        throw new Error(`Webhook error! status: ${response.status}`);
      }

      // Try to parse response, but don't fail if it's not JSON
      let responseData = null;
      try {
        responseData = await response.json();
      } catch {
        // Some webhooks might return plain text or no content
        responseData = { status: 'sent' };
      }

      return {
        success: true,
        messageId: `webhook_${Date.now()}`,
        status: 'sent',
        data: responseData
      };
    } catch (error) {
      console.error('Error sending message to webhook:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Send bulk WhatsApp messages via n8n webhook
   */
  static async sendBulkMessage(phones: string[], message: string) {
    const results = [];
    
    for (const phone of phones) {
      try {
        const result = await this.sendMessage(phone, message);
        results.push({
          phone,
          success: result.success,
          error: result.error || null
        });
        
        // Add a small delay between messages to avoid overwhelming the webhook
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        results.push({
          phone,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
    
    return {
      success: true,
      results,
      total: phones.length,
      successful: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length
    };
  }

  /**
   * Check if the n8n webhook is reachable
   */
  static async checkWebhookHealth() {
    try {
      const response = await fetch(`${this.N8N_WEBHOOK_URL}?test=health`, {
        method: 'GET'
      });
      return { success: response.status < 500 };
    } catch {
      return { 
        success: false, 
        error: 'n8n webhook is not reachable' 
      };
    }
  }
}
