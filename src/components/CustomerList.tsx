import React from 'react';
import { Customer } from '../types';
import { formatTimestamp } from '../utils/dummyData';

interface CustomerListProps {
  customers: Customer[];
  selectedCustomerId: number | null;
  onSelectCustomer: (customerId: number) => void;
  lastMessages: { [key: number]: string };
  lastMessageTimes: { [key: number]: string };
}

const CustomerList: React.FC<CustomerListProps> = ({ 
  customers, 
  selectedCustomerId, 
  onSelectCustomer,
  lastMessages,
  lastMessageTimes
}) => {
  return (
    <div className="divide-y divide-gray-200 dark:divide-gray-700">
      {customers.map((customer) => (
        <div
          key={customer.id}
          onClick={() => onSelectCustomer(customer.id)}
          className={`p-3 sm:p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 ${
            selectedCustomerId === customer.id 
              ? 'bg-green-50 dark:bg-green-900/20 border-r-2 border-green-500' 
              : ''
          }`}
        >
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Customer Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                  {customer.name}
                </h4>
                <span className="text-xs text-gray-500 dark:text-gray-400 ml-2 flex-shrink-0">
                  {lastMessageTimes[customer.id] ? formatTimestamp(lastMessageTimes[customer.id]) : customer.lastSeen}
                </span>
              </div>
              
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1 truncate">
                {customer.phone}
              </p>
              
              <p className="text-xs text-gray-500 dark:text-gray-500 truncate">
                {lastMessages[customer.id] || 'No messages yet'}
              </p>
            </div>

            {/* Unread Badge */}
            {customer.unreadCount > 0 && (
              <div className="w-4 h-4 sm:w-5 sm:h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-xs text-white font-medium">
                  {customer.unreadCount > 9 ? '9+' : customer.unreadCount}
                </span>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default CustomerList;