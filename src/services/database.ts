import { supabase, ConversationMemory, ChatHistory } from '../lib/supabase'
import { Customer, Message } from '../types'

// Service to interact with Supabase database
export class DatabaseService {
  
  // Fetch all conversations from ConversationMemory table
  static async getConversations(): Promise<ConversationMemory[]> {
    try {
      // Try different table name variations
      const tableNames = ['ConversationMemory', 'conversationmemory', 'conversation_memory'];
      
      for (const tableName of tableNames) {
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .order('created_at', { ascending: false });
        
        if (!error && data) {
          console.log(`✅ Found data in table: ${tableName}`, data);
          return data || [];
        } else if (error) {
          console.log(`❌ Error with table ${tableName}:`, error.message);
        }
      }
      
      console.warn('No valid table found with any naming variation');
      return [];
    } catch (error) {
      console.error('Error fetching conversations:', error);
      return [];
    }
  }

  // Fetch chat histories from n8n_chat_histories table
  static async getChatHistories(): Promise<ChatHistory[]> {
    const { data, error } = await supabase
      .from('n8n_chat_histories')
      .select('*')
      .order('id', { ascending: false })
    
    if (error) {
      console.error('Error fetching chat histories:', error)
      return []
    }
    
    return data || []
  }

  // Convert database conversations to Customer objects
  static async getCustomers(): Promise<Customer[]> {
    const conversations = await this.getConversations()
    
    if (conversations.length === 0) {
      console.log('No conversations found in database')
      return []
    }

    console.log('Processing conversations:', conversations)
    
    // Group conversations by phone number (sender and recipient)
    const customerMap = new Map<string, Customer>()
    
    conversations.forEach((conv) => {
      // Consider both sender and recipient as potential customers
      // The business number is likely the recipient, so sender is the customer
      const customerPhone = conv.sender
      
      // Skip if sender is null or empty
      if (!customerPhone || !customerPhone.trim()) {
        console.warn('Skipping conversation with null/empty sender:', conv);
        return;
      }
      
      if (!customerMap.has(customerPhone)) {
        // Extract name from message if possible, otherwise use phone
        const senderMessage = conv['sender message'] || conv.message || ''
        const name = this.extractNameFromMessage(senderMessage) || this.formatPhoneNumber(customerPhone)
        
        customerMap.set(customerPhone, {
          id: this.getCustomerIdByPhone(customerPhone), // Use consistent ID generation
          name: name,
          phone: customerPhone,
          lastSeen: this.formatTime(conv.created_at),
          isOnline: this.isRecentActivity(conv.created_at),
          unreadCount: 0 // We'll calculate this separately
        })
      }
    })
    
    const customers = Array.from(customerMap.values())
    console.log('Generated customers:', customers)
    return customers
  }

  // Convert database conversations to Message objects for WhatsApp-style display
  static async getMessagesForCustomer(customerPhone: string): Promise<Message[]> {
    const conversations = await this.getConversations()
    
    console.log(`Getting messages for customer: ${customerPhone}`)
    console.log('All conversations:', conversations)
    
    // Clean phone number for comparison (remove whatsapp: prefix if present)
    const cleanCustomerPhone = customerPhone.replace('whatsapp:', '').replace(/\s+/g, '')
    
    // Filter conversations for this customer
    const customerConversations = conversations.filter(conv => {
      const cleanSender = conv.sender?.replace('whatsapp:', '').replace(/\s+/g, '') || ''
      const cleanRecipient = conv.recipient?.replace('whatsapp:', '').replace(/\s+/g, '') || ''
      return cleanSender === cleanCustomerPhone || cleanRecipient === cleanCustomerPhone
    })
    
    console.log(`Filtered conversations for ${customerPhone}:`, customerConversations)
    
    // Create messages from both sender and recipient messages
    const messages: Message[] = []
    
    customerConversations.forEach((conv) => {
      // Check if this conversation has sender message or just message field
      const messageText = conv['sender message'] || conv.message || ''
      
      if (messageText && messageText.trim()) {
        const cleanSender = conv.sender?.replace('whatsapp:', '').replace(/\s+/g, '') || ''
        const isFromCustomer = cleanSender === cleanCustomerPhone
        
        messages.push({
          id: conv.id * 2, // Ensure unique ID
          customerId: this.getCustomerIdByPhone(cleanCustomerPhone),
          text: messageText,
          timestamp: conv.created_at, // Store full timestamp for calculations
          isFromCustomer: isFromCustomer,
          status: 'read' as const,
          messageType: 'text' as const
        })
      }
      
      // Add recipient message if it exists (this would be the AI/business response)
      if (conv['recipient message']) {
        const recipientMessage = conv['recipient message']
        if (recipientMessage && recipientMessage.trim()) {
          const cleanRecipient = conv.recipient?.replace('whatsapp:', '').replace(/\s+/g, '') || ''
          const isFromCustomer = cleanRecipient === cleanCustomerPhone
          
          messages.push({
            id: conv.id * 2 + 1, // Ensure unique ID
            customerId: this.getCustomerIdByPhone(cleanCustomerPhone),
            text: recipientMessage,
            timestamp: conv.created_at, // Store full timestamp for calculations
            isFromCustomer: isFromCustomer,
            status: 'read' as const,
            messageType: 'text' as const
          })
        }
      }
    })
    
    // Sort messages by timestamp for proper conversation flow
    return messages.sort((a, b) => {
      const timeA = new Date(a.timestamp).getTime()
      const timeB = new Date(b.timestamp).getTime()
      return timeA - timeB
    })
  }

  // Get all messages grouped by customer
  static async getAllMessages(): Promise<{ [customerId: number]: Message[] }> {
    const customers = await this.getCustomers()
    const messagesMap: { [customerId: number]: Message[] } = {}
    
    for (const customer of customers) {
      const messages = await this.getMessagesForCustomer(customer.phone)
      messagesMap[customer.id] = messages
    }
    
    return messagesMap
  }

  // Helper methods
  private static extractNameFromMessage(message: string | null | undefined): string | null {
    if (!message || typeof message !== 'string') {
      return null;
    }
    
    // Try to extract name from message content
    // Look for patterns like "User's name is [Name]" or "My name is [Name]"
    const namePatterns = [
      /(?:name is|I'm|I am)\s+([A-Za-z\s]+)/i,
      /(?:this is|call me)\s+([A-Za-z\s]+)/i,
      /^([A-Za-z\s]+)(?:\s+here|\s+speaking)/i
    ];
    
    for (const pattern of namePatterns) {
      const match = message.match(pattern);
      if (match && match[1]) {
        const extractedName = match[1].trim();
        if (extractedName.length > 1 && extractedName.length < 50) {
          return extractedName;
        }
      }
    }
    
    return null;
  }

  private static formatPhoneNumber(phone: string | null | undefined): string {
    // Handle null or undefined phone numbers
    if (!phone || typeof phone !== 'string') {
      return 'Unknown Number';
    }
    
    // Clean and format phone number for display
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length >= 10) {
      const last10 = cleaned.slice(-10);
      return `${last10.slice(0, 3)} ${last10.slice(3, 6)} ${last10.slice(6)}`;
    }
    return phone;
  }

  private static formatTime(dateString: string): string {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    
    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins} minutes ago`
    if (diffHours < 24) return `${diffHours} hours ago`
    return `${diffDays} days ago`
  }

  private static isRecentActivity(dateString: string): boolean {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    return diffMins < 30 // Consider online if activity within 30 minutes
  }

  private static getCustomerIdByPhone(phone: string | null | undefined): number {
    // Handle null or undefined phone numbers
    if (!phone || typeof phone !== 'string') {
      return Math.floor(Math.random() * 1000) + 1;
    }
    
    // Simple hash to generate consistent ID from phone number
    return Math.abs(phone.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0)
      return a & a
    }, 0)) % 1000 + 1
  }

  // Save a sent message to the database
  static async saveSentMessage(
    customerPhone: string, 
    message: string
  ): Promise<boolean> {
    try {
      // Clean and format phone numbers consistently
      const cleanCustomerPhone = customerPhone.replace('whatsapp:', '').replace(/\s+/g, '')
      const businessPhone = '+918487058582' // Your WhatsApp Business number
      
      const messageData = {
        sender: businessPhone,
        recipient: cleanCustomerPhone,
        'sender message': message, // Use the same format as existing data
        created_at: new Date().toISOString()
      };

      console.log('💾 Attempting to save message data:', messageData);

      // Try the exact table name from the database
      const { data, error } = await supabase
        .from('ConversationMemory')
        .insert([messageData])
        .select();
      
      if (error) {
        console.error('❌ Database save error:', error);
        console.error('Error details:', error.details);
        console.error('Error hint:', error.hint);
        console.error('Error message:', error.message);
        return false;
      }

      if (data && data.length > 0) {
        console.log('✅ Message saved successfully to ConversationMemory:', data);
        return true;
      } else {
        console.warn('⚠️ No data returned from insert operation');
        return false;
      }
      
    } catch (error) {
      console.error('💥 Unexpected error saving sent message:', error);
      return false;
    }
  }

  // Ensure contacts table exists (helper function)
  static async ensureContactsTable(): Promise<{ success: boolean; tableName?: string; error?: string }> {
    try {
      // Try to create a contacts table using SQL
      const createTableSQL = `
        CREATE TABLE IF NOT EXISTS contacts (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          phone VARCHAR(50) NOT NULL UNIQUE,
          source VARCHAR(20) DEFAULT 'manual',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        -- Create index for faster phone lookups
        CREATE INDEX IF NOT EXISTS idx_contacts_phone ON contacts(phone);
      `;
      
      const { error } = await supabase.rpc('exec_sql', { sql: createTableSQL });
      
      if (!error) {
        console.log('✅ Contacts table created/verified successfully');
        return { success: true, tableName: 'contacts' };
      } else {
        console.log('❌ Could not create contacts table:', error);
        return { success: false, error: error.message };
      }
    } catch (error) {
      console.log('💥 Error ensuring contacts table:', error);
      return { success: false, error: (error as Error).message };
    }
  }

  // Save imported contacts to the database
  static async saveContacts(contacts: Array<{
    id: string;
    name: string;
    phone: string;
    source: 'phone' | 'csv' | 'manual';
  }>): Promise<{ success: boolean; savedCount: number; errors: string[] }> {
    try {
      console.log('💾 Attempting to save contacts to database:', contacts);
      
      const contactsData = contacts.map(contact => ({
        name: contact.name,
        phone: contact.phone,
        source: contact.source,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }));

      // First try to ensure contacts table exists
      const tableResult = await this.ensureContactsTable();
      let savedCount = 0;
      const errors: string[] = [];

      // If we successfully created/verified the contacts table, try to use it
      if (tableResult.success && tableResult.tableName) {
        try {
          const { data, error } = await supabase
            .from(tableResult.tableName)
            .upsert(contactsData, { 
              onConflict: 'phone',
              ignoreDuplicates: false 
            })
            .select();
          
          if (!error && data) {
            console.log(`✅ Contacts saved successfully to ${tableResult.tableName}:`, data);
            savedCount = data.length;
          } else if (error) {
            console.log(`❌ Error with table ${tableResult.tableName}:`, error.message);
            errors.push(`${tableResult.tableName}: ${error.message}`);
          }
        } catch (tableError) {
          console.log(`💥 Exception with table ${tableResult.tableName}:`, tableError);
          errors.push(`${tableResult.tableName}: ${(tableError as Error).message}`);
        }
      }

      // If the main table approach didn't work, try other possible table names
      if (savedCount === 0) {
        const possibleTableNames = ['imported_contacts', 'contact_list'];
        
        for (const tableName of possibleTableNames) {
          try {
            const { data, error } = await supabase
              .from(tableName)
              .insert(contactsData)
              .select();
            
            if (!error && data) {
              console.log(`✅ Contacts saved successfully to ${tableName}:`, data);
              savedCount = data.length;
              break;
            } else if (error) {
              console.log(`❌ Error with table ${tableName}:`, error.message);
              errors.push(`${tableName}: ${error.message}`);
            }
          } catch (tableError) {
            console.log(`💥 Exception with table ${tableName}:`, tableError);
            errors.push(`${tableName}: ${(tableError as Error).message}`);
          }
        }
      }

      if (savedCount === 0) {
        // If no existing table worked, try to save to ConversationMemory as a fallback
        // This creates a conversation entry for each contact
        console.log('📝 Fallback: Saving contacts as conversation entries...');
        
        const conversationData = contacts.map(contact => ({
          sender: contact.phone,
          recipient: '+918487058582', // Business phone
          'sender message': `Contact imported: ${contact.name} (${contact.source})`,
          created_at: new Date().toISOString()
        }));

        const { data, error } = await supabase
          .from('ConversationMemory')
          .insert(conversationData)
          .select();
        
        if (!error && data) {
          console.log('✅ Contacts saved as conversation entries:', data);
          savedCount = data.length;
        } else {
          console.error('❌ Fallback save also failed:', error);
          errors.push(`ConversationMemory fallback: ${error?.message || 'Unknown error'}`);
        }
      }

      return {
        success: savedCount > 0,
        savedCount,
        errors
      };
      
    } catch (error) {
      console.error('💥 Unexpected error saving contacts:', error);
      return {
        success: false,
        savedCount: 0,
        errors: [`Unexpected error: ${(error as Error).message}`]
      };
    }
  }

  // Get saved contacts from database
  static async getSavedContacts(): Promise<Array<{
    id: string;
    name: string;
    phone: string;
    source: string;
    created_at: string;
  }>> {
    try {
      // Try different possible table names
      const possibleTableNames = ['contacts', 'imported_contacts', 'contact_list'];
      
      for (const tableName of possibleTableNames) {
        try {
          const { data, error } = await supabase
            .from(tableName)
            .select('*')
            .order('created_at', { ascending: false });
          
          if (!error && data) {
            console.log(`✅ Found contacts in table: ${tableName}`, data);
            return data.map(contact => ({
              id: contact.id?.toString() || `${tableName}_${Date.now()}`,
              name: contact.name || 'Unknown',
              phone: contact.phone || '',
              source: contact.source || 'unknown',
              created_at: contact.created_at || new Date().toISOString()
            }));
          }
        } catch (tableError) {
          console.log(`Error checking table ${tableName}:`, tableError);
        }
      }
      
      // If no dedicated contacts table found, check ConversationMemory for contact entries
      console.log('📝 No contacts table found, checking ConversationMemory for imported contacts...');
      try {
        const { data, error } = await supabase
          .from('ConversationMemory')
          .select('*')
          .like('sender message', '%Contact imported:%')
          .order('created_at', { ascending: false });
        
        if (!error && data) {
          console.log('✅ Found contact entries in ConversationMemory:', data);
          return data.map((entry, index) => {
            // Parse contact info from message
            const message = entry['sender message'] || '';
            const nameMatch = message.match(/Contact imported: (.+?) \(/);
            const sourceMatch = message.match(/\((.+?)\)$/);
            
            return {
              id: entry.id?.toString() || `conv_${Date.now()}_${index}`,
              name: nameMatch ? nameMatch[1] : 'Unknown Contact',
              phone: entry.sender || '',
              source: sourceMatch ? sourceMatch[1] : 'unknown',
              created_at: entry.created_at || new Date().toISOString()
            };
          });
        }
      } catch (convError) {
        console.log('Error checking ConversationMemory:', convError);
      }
      
      console.warn('No contacts found in any table, returning empty array');
      return [];
    } catch (error) {
      console.error('Error fetching saved contacts:', error);
      return [];
    }
  }

  // Delete contact from database
  static async deleteContact(contactId: string, contactPhone: string): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('🗑️ Attempting to delete contact:', { contactId, contactPhone });
      
      // Try different possible table names to delete from
      const possibleTableNames = ['contacts', 'imported_contacts', 'contact_list'];
      let deleteSuccess = false;
      
      for (const tableName of possibleTableNames) {
        try {
          // Try to delete by ID first
          const { data: deleteByIdData, error: deleteByIdError } = await supabase
            .from(tableName)
            .delete()
            .eq('id', contactId)
            .select();
          
          if (!deleteByIdError && deleteByIdData && deleteByIdData.length > 0) {
            console.log(`✅ Contact deleted by ID from ${tableName}:`, deleteByIdData);
            deleteSuccess = true;
            break;
          }
          
          // If delete by ID didn't work, try by phone number
          const { data: deleteByPhoneData, error: deleteByPhoneError } = await supabase
            .from(tableName)
            .delete()
            .eq('phone', contactPhone)
            .select();
          
          if (!deleteByPhoneError && deleteByPhoneData && deleteByPhoneData.length > 0) {
            console.log(`✅ Contact deleted by phone from ${tableName}:`, deleteByPhoneData);
            deleteSuccess = true;
            break;
          }
        } catch (tableError) {
          console.log(`Error deleting from table ${tableName}:`, tableError);
        }
      }
      
      if (!deleteSuccess) {
        // If no table worked, try to delete from ConversationMemory as fallback
        console.log('📝 Fallback: Trying to delete contact entry from ConversationMemory...');
        
        const { data, error } = await supabase
          .from('ConversationMemory')
          .delete()
          .eq('sender', contactPhone)
          .like('sender message', '%Contact imported:%')
          .select();
        
        if (!error && data && data.length > 0) {
          console.log('✅ Contact entry deleted from ConversationMemory:', data);
          deleteSuccess = true;
        }
      }
      
      return {
        success: deleteSuccess,
        error: deleteSuccess ? undefined : 'Contact not found in database'
      };
      
    } catch (error) {
      console.error('💥 Unexpected error deleting contact:', error);
      return {
        success: false,
        error: `Unexpected error: ${(error as Error).message}`
      };
    }
  }
}
