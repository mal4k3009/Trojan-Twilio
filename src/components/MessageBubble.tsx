import React from 'react';
import { Check, CheckCheck, Clock } from 'lucide-react';
import { Message } from '../types';

interface MessageBubbleProps {
  message: Message;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const getStatusIcon = () => {
    switch (message.status) {
      case 'sent':
        return <Clock className="w-4 h-4 text-gray-400" />;
      case 'delivered':
        return <Check className="w-4 h-4 text-gray-400" />;
      case 'read':
        return <CheckCheck className="w-4 h-4 text-blue-500" />;
      default:
        return null;
    }
  };

  const formatDisplayTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit', 
      hour12: true 
    });
  };

  return (
    <div className={`flex mb-2 sm:mb-3 ${message.isFromCustomer ? 'justify-start' : 'justify-end'}`}>
      <div className={`max-w-[85%] sm:max-w-xs lg:max-w-md xl:max-w-lg ${
        message.isFromCustomer 
          ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600 rounded-tl-lg rounded-tr-lg rounded-br-lg rounded-bl-sm' 
          : 'bg-green-500 text-white rounded-tl-lg rounded-tr-sm rounded-br-sm rounded-bl-lg'
      } px-3 py-2 shadow-sm hover:shadow-md transition-all duration-200 relative`}>
        
        {/* Message bubble tail */}
        <div className={`absolute ${
          message.isFromCustomer 
            ? '-left-1 bottom-0 w-2 h-2 bg-white dark:bg-gray-700 border-l border-b border-gray-200 dark:border-gray-600 transform rotate-45' 
            : '-right-1 bottom-0 w-2 h-2 bg-green-500 transform rotate-45'
        }`}></div>
        
        <p className="text-sm leading-relaxed break-words whitespace-pre-wrap">
          {message.text}
        </p>
        
        <div className={`flex items-center mt-1 gap-1 ${
          message.isFromCustomer ? 'justify-end' : 'justify-end'
        }`}>
          <span className={`text-xs ${
            message.isFromCustomer 
              ? 'text-gray-500 dark:text-gray-400' 
              : 'text-green-100'
          }`}>
            {formatDisplayTime(message.timestamp)}
          </span>
          {!message.isFromCustomer && (
            <div className="flex-shrink-0">
              {getStatusIcon()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;