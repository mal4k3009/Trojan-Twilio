import React, { useState, useEffect } from 'react';
import { Menu } from 'lucide-react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import ChatArea from './components/ChatArea';
import Dashboard from './components/Dashboard';
import BulkMessage from './components/BulkMessage';
import Contacts from './components/Contacts';
import { useConversations } from './hooks/useConversations';
import { useLocalStorage } from './hooks/useLocalStorage';

type ViewType = 'dashboard' | 'chat' | 'bulk' | 'contacts';

function App() {
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [isDarkMode, setIsDarkMode] = useLocalStorage('darkMode', false);

  // Use dynamic data from Supabase
  const { customers, messages, loading, error, refreshData } = useConversations();

  // Get last message for each customer
  const lastMessages: { [key: number]: string } = {};
  const lastMessageTimes: { [key: number]: string } = {};
  
  customers.forEach(customer => {
    const customerMessages = messages[customer.id] || [];
    if (customerMessages.length > 0) {
      const lastMessage = customerMessages[customerMessages.length - 1];
      lastMessages[customer.id] = lastMessage.text;
      lastMessageTimes[customer.id] = lastMessage.timestamp;
    }
  });

  const handleSelectCustomer = (customerId: number) => {
    // Prevent any default scroll behavior
    if (typeof window !== 'undefined') {
      window.scrollTo(0, 0);
    }
    
    setSelectedCustomerId(customerId);
    setCurrentView('chat');
    setIsSidebarOpen(false); // Close sidebar on mobile after selection
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const handleRefresh = async () => {
    await refreshData();
  };

  // Apply dark mode class to document
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const selectedCustomer = selectedCustomerId 
    ? customers.find(c => c.id === selectedCustomerId) || null 
    : null;
    
  const customerMessages = selectedCustomerId 
    ? messages[selectedCustomerId] || []
    : [];

  // Show loading or error states
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading conversations...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 mb-4">Error: {error}</p>
          <button 
            onClick={handleRefresh}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-100 dark:bg-gray-900 transition-colors duration-200 overflow-hidden">
      <Header 
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        isDarkMode={isDarkMode}
        onThemeToggle={toggleTheme}
        onRefresh={handleRefresh}
        onToggleSidebar={toggleSidebar}
      />
      
      <div className="flex flex-1 min-h-0 overflow-hidden">
        <Sidebar
          customers={customers}
          selectedCustomerId={selectedCustomerId}
          onSelectCustomer={handleSelectCustomer}
          lastMessages={lastMessages}
          lastMessageTimes={lastMessageTimes}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          searchTerm={searchTerm}
        />
        
        <main className="flex-1 flex flex-col min-w-0 min-h-0 overflow-hidden">
          {/* Navigation Tabs */}
          <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-3 sm:px-6 py-2 flex-shrink-0">
            <div className="flex space-x-1 overflow-x-auto scrollbar-hide">
              <button
                onClick={() => setCurrentView('dashboard')}
                className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium rounded-lg transition-all whitespace-nowrap ${
                  currentView === 'dashboard'
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                Dashboard
              </button>
              <button
                onClick={() => setCurrentView('chat')}
                className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium rounded-lg transition-all whitespace-nowrap ${
                  currentView === 'chat'
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                Conversations
              </button>
              <button
                onClick={() => setCurrentView('bulk')}
                className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium rounded-lg transition-all whitespace-nowrap ${
                  currentView === 'bulk'
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                Bulk Message
              </button>
              <button
                onClick={() => setCurrentView('contacts')}
                className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium rounded-lg transition-all whitespace-nowrap ${
                  currentView === 'contacts'
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                Contacts
              </button>
            </div>
          </div>

          {/* Main Content */}
          {currentView === 'dashboard' ? (
            <Dashboard onRefresh={handleRefresh} />
          ) : currentView === 'bulk' ? (
            <BulkMessage 
              customers={customers} 
              onNavigateToContacts={() => setCurrentView('contacts')}
            />
          ) : currentView === 'contacts' ? (
            <Contacts />
          ) : (
            <ChatArea
              customer={selectedCustomer}
              messages={customerMessages}
              onToggleSidebar={toggleSidebar}
              onMessageSent={refreshData}
            />
          )}
        </main>
      </div>
    </div>
  );
}

export default App;