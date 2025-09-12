import React, { useState } from 'react';
import { MessageCircle, Filter, SortDesc, X } from 'lucide-react';
import { Customer } from '../types';
import CustomerList from './CustomerList';

interface SidebarProps {
  customers: Customer[];
  selectedCustomerId: number | null;
  onSelectCustomer: (customerId: number) => void;
  lastMessages: { [key: number]: string };
  lastMessageTimes: { [key: number]: string };
  isOpen: boolean;
  onClose: () => void;
  searchTerm: string;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  customers, 
  selectedCustomerId, 
  onSelectCustomer,
  lastMessages,
  lastMessageTimes,
  isOpen,
  onClose,
  searchTerm
}) => {
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'unread'>('newest');
  const [filterBy, setFilterBy] = useState<'all' | 'online' | 'unread'>('all');

  // Debug logging
  console.log('Sidebar received customers:', customers);
  console.log('Sidebar received lastMessages:', lastMessages);

  // Filter customers based on search term and filters
  const filteredCustomers = customers
    .filter(customer => {
      const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          customer.phone.includes(searchTerm);
      
      const matchesFilter = (() => {
        switch (filterBy) {
          case 'online':
            return customer.isOnline;
          case 'unread':
            return customer.unreadCount > 0;
          default:
            return true;
        }
      })();

      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(lastMessageTimes[b.id] || '').getTime() - new Date(lastMessageTimes[a.id] || '').getTime();
        case 'oldest':
          return new Date(lastMessageTimes[a.id] || '').getTime() - new Date(lastMessageTimes[b.id] || '').getTime();
        case 'unread':
          return b.unreadCount - a.unreadCount;
        default:
          return 0;
      }
    });

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <aside className={`
        fixed lg:relative inset-y-0 left-0 z-50 lg:z-0
        w-72 sm:w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700
        transform transition-transform duration-300 ease-in-out flex flex-col h-full
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Sidebar Header */}
        <div className="p-3 sm:p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 flex-shrink-0">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white flex items-center">
              <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-green-600" />
              <span className="hidden sm:inline">Conversations</span>
              <span className="sm:hidden">Chats</span>
            </h2>
            <button 
              onClick={onClose}
              className="lg:hidden p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md transition-colors"
            >
              <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </button>
          </div>

          {/* Filters and Sort */}
          <div className="flex space-x-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="flex-1 text-xs bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md px-2 py-1 text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="unread">Unread</option>
            </select>
            
            <select
              value={filterBy}
              onChange={(e) => setFilterBy(e.target.value as any)}
              className="flex-1 text-xs bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md px-2 py-1 text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="all">All</option>
              <option value="online">Online</option>
              <option value="unread">Unread</option>
            </select>
          </div>
        </div>

        {/* Customer List - Scrollable */}
        <div className="flex-1 overflow-y-auto scrollbar-hide">
          {filteredCustomers.length > 0 ? (
            <CustomerList
              customers={filteredCustomers}
              selectedCustomerId={selectedCustomerId}
              onSelectCustomer={onSelectCustomer}
              lastMessages={lastMessages}
              lastMessageTimes={lastMessageTimes}
            />
          ) : (
            <div className="p-8 text-center">
              <MessageCircle className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                No conversations found
              </p>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;