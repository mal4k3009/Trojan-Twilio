import React, { useState } from 'react';
import { Search, Sun, Moon, Settings, RefreshCw, Menu } from 'lucide-react';
import SettingsModal from './Settings';

interface HeaderProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  isDarkMode: boolean;
  onThemeToggle: () => void;
  onRefresh?: () => Promise<void>;
  onToggleSidebar?: () => void;
}

const Header: React.FC<HeaderProps> = ({ 
  searchTerm, 
  onSearchChange, 
  isDarkMode, 
  onThemeToggle,
  onRefresh,
  onToggleSidebar
}) => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    if (onRefresh && !isRefreshing) {
      setIsRefreshing(true);
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
      }
    }
  };

  return (
    <>
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 sm:px-6 py-3 sm:py-4 shadow-sm">
        <div className="flex items-center justify-between">
          {/* Mobile Menu Button */}
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Logo and Title */}
          <div className="flex items-center space-x-2 sm:space-x-3 flex-1 lg:flex-none">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm sm:text-lg">W</span>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
                WhatsApp Business Portal
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                Customer Chat Management
              </p>
            </div>
            <div className="sm:hidden">
              <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                WhatsApp Portal
              </h1>
            </div>
          </div>

          {/* Search Bar - Hidden on mobile, shown on tablet and up */}
          <div className="hidden md:flex flex-1 max-w-lg mx-4 lg:mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                  focus:ring-2 focus:ring-green-500 focus:border-transparent 
                  bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                  placeholder-gray-500 dark:placeholder-gray-400
                  transition-all duration-200"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-1 sm:space-x-3">
            {/* Mobile Search Button */}
            <button 
              onClick={() => {/* TODO: Implement mobile search modal */}}
              className="md:hidden p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
              title="Search conversations"
            >
              <Search className="w-5 h-5" />
            </button>

            <button 
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors disabled:opacity-50"
              title="Refresh conversations"
            >
              <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
            
            <button 
              onClick={onThemeToggle}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
              title={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            
            <button 
              onClick={() => setIsSettingsOpen(true)}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
              title="Settings"
            >
              <Settings className="w-5 h-5" />
            </button>
            
            {/* User Info - Hidden on mobile */}
            <div className="hidden lg:flex items-center space-x-2 ml-4 pl-4 border-l border-gray-200 dark:border-gray-700">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">Admin User</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Online</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <SettingsModal 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        isDarkMode={isDarkMode}
        onThemeToggle={onThemeToggle}
      />
    </>
  );
};

export default Header;