export interface Customer {
  id: number;
  name: string;
  phone: string;
  lastSeen: string;
  isOnline: boolean;
  unreadCount: number;
}

export interface Message {
  id: number;
  customerId: number;
  text: string;
  timestamp: string;
  isFromCustomer: boolean;
  status: 'sent' | 'delivered' | 'read';
  messageType?: 'text' | 'image' | 'document';
}

export interface Conversation {
  customerId: number;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
}

export interface DashboardStats {
  totalConversations: number;
  avgResponseTime: string;
  customerSatisfaction: number;
  activeConversations: number;
}