import { Customer, Message, DashboardStats } from '../types';

export const customers: Customer[] = [
  {
    id: 1,
    name: "Rahul Sharma",
    phone: "+91 98765 43210",
    lastSeen: "2 minutes ago",
    isOnline: true,
    unreadCount: 3,
    avatar: "https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop"
  },
  {
    id: 2,
    name: "Priya Patel",
    phone: "+91 87654 32109",
    lastSeen: "1 hour ago",
    isOnline: false,
    unreadCount: 0,
    avatar: "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop"
  },
  {
    id: 3,
    name: "Amit Kumar",
    phone: "+91 76543 21098",
    lastSeen: "15 minutes ago",
    isOnline: true,
    unreadCount: 1,
    avatar: "https://images.pexels.com/photos/91227/pexels-photo-91227.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop"
  },
  {
    id: 4,
    name: "Sneha Reddy",
    phone: "+91 65432 10987",
    lastSeen: "3 hours ago",
    isOnline: false,
    unreadCount: 0,
    avatar: "https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop"
  },
  {
    id: 5,
    name: "Vikram Singh",
    phone: "+91 54321 09876",
    lastSeen: "30 minutes ago",
    isOnline: false,
    unreadCount: 2,
    avatar: "https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop"
  },
  {
    id: 6,
    name: "Anjali Gupta",
    phone: "+91 43210 98765",
    lastSeen: "5 minutes ago",
    isOnline: true,
    unreadCount: 0,
    avatar: "https://images.pexels.com/photos/1382731/pexels-photo-1382731.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop"
  },
  {
    id: 7,
    name: "Ravi Agarwal",
    phone: "+91 32109 87654",
    lastSeen: "2 hours ago",
    isOnline: false,
    unreadCount: 1,
    avatar: "https://images.pexels.com/photos/1212984/pexels-photo-1212984.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop"
  },
  {
    id: 8,
    name: "Kavya Nair",
    phone: "+91 21098 76543",
    lastSeen: "45 minutes ago",
    isOnline: false,
    unreadCount: 0,
    avatar: "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop"
  }
];

export const messages: Message[] = [
  {
    id: 1,
    customerId: 1,
    text: "Hi! I placed an order 3 days ago but haven't received any updates. Order number is #12345.",
    timestamp: "2024-01-15T10:30:00Z",
    isFromCustomer: true,
    status: "delivered"
  },
  {
    id: 2,
    customerId: 1,
    text: "Hello Rahul! Thanks for reaching out. I'm checking your order #12345 now. Please give me a moment.",
    timestamp: "2024-01-15T10:31:00Z",
    isFromCustomer: false,
    status: "read"
  },
  {
    id: 3,
    customerId: 1,
    text: "Great news! Your order is currently being processed and will ship tomorrow. You'll receive a tracking number via SMS.",
    timestamp: "2024-01-15T10:32:00Z",
    isFromCustomer: false,
    status: "read"
  },
  {
    id: 4,
    customerId: 1,
    text: "Perfect! Thank you so much for the quick response. When can I expect delivery?",
    timestamp: "2024-01-15T10:35:00Z",
    isFromCustomer: true,
    status: "delivered"
  },
  {
    id: 5,
    customerId: 1,
    text: "Based on your location, you can expect delivery within 2-3 business days after shipment. Is there anything else I can help you with?",
    timestamp: "2024-01-15T10:36:00Z",
    isFromCustomer: false,
    status: "delivered"
  },
  {
    id: 6,
    customerId: 1,
    text: "That's all for now. Thanks again!",
    timestamp: "2024-01-15T10:37:00Z",
    isFromCustomer: true,
    status: "read"
  },
  {
    id: 7,
    customerId: 2,
    text: "Do you have the iPhone 15 Pro in blue color available?",
    timestamp: "2024-01-15T09:15:00Z",
    isFromCustomer: true,
    status: "delivered"
  },
  {
    id: 8,
    customerId: 2,
    text: "Yes! The iPhone 15 Pro in blue is currently in stock. Would you like to know the price and availability?",
    timestamp: "2024-01-15T09:16:00Z",
    isFromCustomer: false,
    status: "read"
  },
  {
    id: 9,
    customerId: 3,
    text: "Can I return my recent purchase? I bought the wrong size.",
    timestamp: "2024-01-15T11:45:00Z",
    isFromCustomer: true,
    status: "delivered"
  },
  {
    id: 10,
    customerId: 3,
    text: "Of course! Our return policy allows returns within 30 days. Please provide your order number so I can process this for you.",
    timestamp: "2024-01-15T11:46:00Z",
    isFromCustomer: false,
    status: "delivered"
  },
  {
    id: 11,
    customerId: 5,
    text: "What's the status of my refund? It's been a week since I returned the item.",
    timestamp: "2024-01-15T14:20:00Z",
    isFromCustomer: true,
    status: "delivered"
  },
  {
    id: 12,
    customerId: 5,
    text: "Let me check your refund status immediately. Could you please share your return tracking number?",
    timestamp: "2024-01-15T14:21:00Z",
    isFromCustomer: false,
    status: "delivered"
  },
  {
    id: 13,
    customerId: 5,
    text: "Sure, it's RT789456123",
    timestamp: "2024-01-15T14:25:00Z",
    isFromCustomer: true,
    status: "delivered"
  },
  {
    id: 14,
    customerId: 7,
    text: "Is there any discount on bulk orders? I need 50 units.",
    timestamp: "2024-01-15T13:10:00Z",
    isFromCustomer: true,
    status: "delivered"
  },
  {
    id: 15,
    customerId: 7,
    text: "Absolutely! For orders of 50+ units, we offer a 15% bulk discount. Let me calculate the exact pricing for you.",
    timestamp: "2024-01-15T13:11:00Z",
    isFromCustomer: false,
    status: "read"
  }
];

export const dashboardStats: DashboardStats = {
  totalConversations: 47,
  avgResponseTime: "2.3 min",
  customerSatisfaction: 94.5,
  activeConversations: 12
};

export const getMessagesForCustomer = (customerId: number): Message[] => {
  return messages.filter(message => message.customerId === customerId)
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
};

export const formatTimestamp = (timestamp: string): string => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
  
  if (diffInMinutes < 1) {
    return 'Just now';
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes}m ago`;
  } else if (diffInMinutes < 1440) {
    return `${Math.floor(diffInMinutes / 60)}h ago`;
  } else {
    return date.toLocaleDateString();
  }
};