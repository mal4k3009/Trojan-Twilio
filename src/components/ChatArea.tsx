import React, { useEffect, useRef, useState } from 'react';
import { Phone, Video, MoreVertical, Send, Menu, Loader2 } from 'lucide-react';
import { Customer, Message } from '../types';
import MessageBubble from './MessageBubble';
import { WhatsAppService } from '../services/whatsapp';
import { DatabaseService } from '../services/database';

interface ChatAreaProps {
  customer: Customer | null;
  messages: Message[];
  onToggleSidebar: () => void;
  onMessageSent?: () => void; // Callback to refresh messages after sending
}

const ChatArea: React.FC<ChatAreaProps> = ({ 
  customer, 
  messages, 
  onToggleSidebar,
  onMessageSent
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [newMessage, setNewMessage] = useState('');
  // Removed isTyping state to eliminate any refresh issues
  const [isSending, setIsSending] = useState(false);
  const [sendStatus, setSendStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      const messagesContainer = messagesEndRef.current.closest('.overflow-y-auto');
      if (messagesContainer) {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
      }
    }
  };

  useEffect(() => {
    // Add a small delay to ensure DOM is ready
    const timeoutId = setTimeout(() => {
      scrollToBottom();
    }, 100);
    
    return () => clearTimeout(timeoutId);
  }, [messages]);

  // Simulate typing indicator - DISABLED to prevent any refreshing issues
  useEffect(() => {
    // Disabled typing indicator to prevent any intervals that might cause issues
    // const interval = setInterval(() => {
    //   setIsTyping(prev => !prev);
    // }, 15000);
    // return () => clearInterval(interval);
  }, []);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !customer) return;

    setIsSending(true);
    setSendStatus({ type: null, message: '' });

    try {
      console.log('🚀 Starting message send process...');
      console.log('📱 Customer phone:', customer.phone);
      console.log('💬 Message:', newMessage.trim());
      
      // Send message via WhatsApp
      const result = await WhatsAppService.sendMessage(
        customer.phone,
        newMessage.trim(),
        customer.id
      );

      console.log('📡 WhatsApp send result:', result);

      if (result.success) {
        console.log('✅ WhatsApp message sent successfully');
        
        // Save message to database
        console.log('💾 Attempting to save to database...');
        const saved = await DatabaseService.saveSentMessage(
          customer.phone,
          newMessage.trim()
        );

        console.log('💾 Database save result:', saved);

        if (saved) {
          setSendStatus({
            type: 'success',
            message: '✅ Message sent successfully!'
          });
          
          // Clear the input immediately
          setNewMessage('');
          
          // Refresh messages immediately
          if (onMessageSent) {
            console.log('🔄 Refreshing messages immediately...');
            onMessageSent();
          }
        } else {
          setSendStatus({
            type: 'error',
            message: '⚠️ Message sent but failed to save to database'
          });
        }
      } else {
        console.error('❌ WhatsApp send failed:', result.error);
        setSendStatus({
          type: 'error',
          message: `❌ Failed to send: ${result.error}`
        });
      }
    } catch (error) {
      console.error('💥 Unexpected error sending message:', error);
      setSendStatus({
        type: 'error',
        message: '❌ An unexpected error occurred'
      });
    } finally {
      setIsSending(false);
      
      // Clear status after 5 seconds
      setTimeout(() => {
        setSendStatus({ type: null, message: '' });
      }, 5000);
    }
  };

  if (!customer) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 text-gray-500 dark:text-gray-400">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <Menu className="w-6 h-6 sm:w-8 sm:h-8" />
          </div>
          <h3 className="text-base sm:text-lg font-medium mb-2 text-gray-500 dark:text-gray-400">Select a Conversation</h3>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
            Choose a customer from the sidebar to view and manage their conversation history.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-gray-50 dark:bg-gray-900 h-full overflow-hidden">
      {/* Chat Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 sm:px-6 py-3 sm:py-4 shadow-sm flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
            <button
              onClick={onToggleSidebar}
              className="lg:hidden p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors flex-shrink-0"
            >
              <Menu className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
            
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                {customer.name}
              </h3>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 truncate">
                {customer.isOnline ? 'Online' : `Last seen ${customer.lastSeen}`}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
            <button className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all" title="Call">
              <Phone className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <button className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all" title="Video Call">
              <Video className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <button className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all" title="More Options">
              <MoreVertical className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Messages Area */}
      <div 
        ref={messagesEndRef}
        className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2 bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 scrollbar-hide scroll-contained"
        style={{ 
          backgroundImage: 'radial-gradient(circle at 25% 25%, rgba(255,255,255,0.1) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(255,255,255,0.05) 0%, transparent 50%)',
        }}
      >
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-gray-500 dark:text-gray-400">
              <p className="text-sm">No messages yet</p>
              <p className="text-xs mt-1">Start a conversation with {customer.name}</p>
            </div>
          </div>
        ) : (
          messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))
        )}
        
        {/* Typing Indicator - REMOVED to prevent refresh issues */}
        {/* {isTyping && customer.isOnline && (
          <div className="flex justify-start mb-4">
            <div className="bg-white dark:bg-gray-700 rounded-lg px-4 py-2 border border-gray-200 dark:border-gray-600 shadow-sm">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          </div>
        )} */}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-3 sm:p-4 flex-shrink-0">
        {/* Status Message */}
        {sendStatus.type && (
          <div className={`mb-3 p-2 rounded-lg text-xs sm:text-sm ${
            sendStatus.type === 'success' 
              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
          }`}>
            {sendStatus.message}
          </div>
        )}
        
        <form onSubmit={handleSendMessage} className="flex space-x-2 sm:space-x-4">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            disabled={isSending}
            className="flex-1 px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 dark:border-gray-600 rounded-lg 
              focus:ring-2 focus:ring-green-500 focus:border-transparent 
              bg-white dark:bg-gray-700 text-gray-900 dark:text-white
              placeholder-gray-500 dark:placeholder-gray-400
              transition-all duration-200 text-sm sm:text-base
              disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || isSending}
            className="px-3 sm:px-6 py-2 sm:py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 dark:disabled:bg-gray-600 
              text-white rounded-lg transition-all duration-200 flex items-center space-x-1 sm:space-x-2
              disabled:cursor-not-allowed transform hover:scale-105 active:scale-95"
          >
            {isSending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="hidden sm:inline">Sending...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span className="hidden sm:inline">Send</span>
              </>
            )}
          </button>
        </form>
      </footer>
    </div>
  );
};

export default ChatArea;