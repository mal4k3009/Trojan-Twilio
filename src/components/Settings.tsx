import React, { useState } from 'react';
import { 
  X, 
  User, 
  Shield, 
  Palette, 
  MessageSquare, 
  Database,
  Download,
  Trash2,
  Save
} from 'lucide-react';

interface SettingsProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
  onThemeToggle: () => void;
}

const Settings: React.FC<SettingsProps> = ({ 
  isOpen, 
  onClose, 
  isDarkMode, 
  onThemeToggle 
}) => {
  const [activeTab, setActiveTab] = useState('profile');
  const [settings, setSettings] = useState({
    privacy: {
      readReceipts: true,
      onlineStatus: true,
      typing: true,
    },
    chat: {
      enterToSend: true,
      autoDownload: false,
      fontSize: 'medium',
    }
  });

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'privacy', label: 'Privacy', icon: Shield },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'chat', label: 'Chat', icon: MessageSquare },
    { id: 'data', label: 'Data & Storage', icon: Database },
  ];

  const handleToggleSetting = (category: string, setting: string) => {
    setSettings(prev => {
      const newSettings = { ...prev };
      if (category === 'privacy') {
        newSettings.privacy = {
          ...prev.privacy,
          [setting]: !prev.privacy[setting as keyof typeof prev.privacy]
        };
      } else if (category === 'chat') {
        newSettings.chat = {
          ...prev.chat,
          [setting]: !prev.chat[setting as keyof typeof prev.chat]
        };
      }
      return newSettings;
    });
  };

  const handleExportData = async () => {
    try {
      // Create export data
      const exportData = {
        exportDate: new Date().toISOString(),
        conversations: [], // This would be populated with real data
        messages: [], // This would be populated with real data
        settings: settings
      };

      const jsonString = JSON.stringify(exportData, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `whatsapp-business-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      alert('Data exported successfully!');
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    }
  };

  const handleSelectChange = (category: string, setting: string, value: string) => {
    setSettings(prev => {
      const newSettings = { ...prev };
      if (category === 'chat') {
        newSettings.chat = {
          ...prev.chat,
          [setting]: value
        };
      }
      return newSettings;
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl h-full max-h-[95vh] sm:max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">Settings</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <div className="w-48 sm:w-64 bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 overflow-y-auto">
            <nav className="p-3 sm:p-4 space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-2 sm:space-x-3 px-2 sm:px-3 py-2 rounded-lg text-left transition-colors ${
                      activeTab === tab.id
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    <Icon className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                    <span className="text-sm sm:text-base">{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6">
            {activeTab === 'profile' && (
              <div className="space-y-4 sm:space-y-6">
                <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white">Profile Settings</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      defaultValue="Admin User"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm sm:text-base"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      defaultValue="admin@company.com"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm sm:text-base"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Phone
                    </label>
                    <input
                      type="tel"
                      defaultValue="+1 (555) 123-4567"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm sm:text-base"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Department
                    </label>
                    <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm sm:text-base">
                      <option>Customer Support</option>
                      <option>Sales</option>
                      <option>Marketing</option>
                      <option>Technical</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'appearance' && (
              <div className="space-y-4 sm:space-y-6">
                <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white">Appearance Settings</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white text-sm sm:text-base">Dark Mode</h4>
                      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Switch between light and dark themes</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isDarkMode}
                        onChange={onThemeToggle}
                        className="sr-only peer"
                      />
                      <div className="w-10 h-5 sm:w-11 sm:h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 dark:peer-focus:ring-green-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 sm:after:h-5 sm:after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-green-600"></div>
                    </label>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Font Size
                    </label>
                    <select 
                      value={settings.chat.fontSize}
                      onChange={(e) => handleSelectChange('chat', 'fontSize', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm sm:text-base"
                    >
                      <option value="small">Small</option>
                      <option value="medium">Medium</option>
                      <option value="large">Large</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'chat' && (
              <div className="space-y-4 sm:space-y-6">
                <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white">Chat Settings</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white text-sm sm:text-base">Enter to Send</h4>
                      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Press Enter to send messages</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.chat.enterToSend}
                        onChange={() => handleToggleSetting('chat', 'enterToSend')}
                        className="sr-only peer"
                      />
                      <div className="w-10 h-5 sm:w-11 sm:h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 dark:peer-focus:ring-green-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 sm:after:h-5 sm:after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-green-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white text-sm sm:text-base">Auto Download Media</h4>
                      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Automatically download images and files</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.chat.autoDownload}
                        onChange={() => handleToggleSetting('chat', 'autoDownload')}
                        className="sr-only peer"
                      />
                      <div className="w-10 h-5 sm:w-11 sm:h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 dark:peer-focus:ring-green-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 sm:after:h-5 sm:after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-green-600"></div>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'privacy' && (
              <div className="space-y-4 sm:space-y-6">
                <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white">Privacy Settings</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white text-sm sm:text-base">Read Receipts</h4>
                      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Show when messages are read</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.privacy.readReceipts}
                        onChange={() => handleToggleSetting('privacy', 'readReceipts')}
                        className="sr-only peer"
                      />
                      <div className="w-10 h-5 sm:w-11 sm:h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 dark:peer-focus:ring-green-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 sm:after:h-5 sm:after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-green-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white text-sm sm:text-base">Online Status</h4>
                      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Show when you're online</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.privacy.onlineStatus}
                        onChange={() => handleToggleSetting('privacy', 'onlineStatus')}
                        className="sr-only peer"
                      />
                      <div className="w-10 h-5 sm:w-11 sm:h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 dark:peer-focus:ring-green-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 sm:after:h-5 sm:after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-green-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white text-sm sm:text-base">Typing Indicators</h4>
                      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Show when you're typing</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.privacy.typing}
                        onChange={() => handleToggleSetting('privacy', 'typing')}
                        className="sr-only peer"
                      />
                      <div className="w-10 h-5 sm:w-11 sm:h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 dark:peer-focus:ring-green-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 sm:after:h-5 sm:after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-green-600"></div>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'data' && (
              <div className="space-y-4 sm:space-y-6">
                <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white">Data & Storage</h3>
                
                <div className="space-y-4">
                  <div className="p-3 sm:p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2 text-sm sm:text-base">Storage Usage</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs sm:text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Messages</span>
                        <span className="text-gray-900 dark:text-white">2.4 GB</span>
                      </div>
                      <div className="flex justify-between text-xs sm:text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Media Files</span>
                        <span className="text-gray-900 dark:text-white">1.8 GB</span>
                      </div>
                      <div className="flex justify-between text-xs sm:text-sm font-medium">
                        <span className="text-gray-900 dark:text-white">Total</span>
                        <span className="text-gray-900 dark:text-white">4.2 GB</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <button 
                      onClick={handleExportData}
                      className="w-full flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                    >
                      <div className="flex items-center space-x-2 sm:space-x-3">
                        <Download className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400" />
                        <span className="text-blue-600 dark:text-blue-400 font-medium text-sm sm:text-base">Export Data</span>
                      </div>
                    </button>
                    
                    <button className="w-full flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors">
                      <div className="flex items-center space-x-2 sm:space-x-3">
                        <Trash2 className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 dark:text-red-400" />
                        <span className="text-red-600 dark:text-red-400 font-medium text-sm sm:text-base">Clear All Data</span>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-end space-y-2 sm:space-y-0 sm:space-x-3 p-4 sm:p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors text-sm sm:text-base"
          >
            Cancel
          </button>
          <button className="w-full sm:w-auto px-4 sm:px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center justify-center space-x-2 text-sm sm:text-base">
            <Save className="w-4 h-4" />
            <span>Save Changes</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
