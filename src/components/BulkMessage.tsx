import React, { useState } from 'react';
import { Send, Users, CheckSquare, Square, Loader2, AlertCircle, CheckCircle, Phone, ArrowRight } from 'lucide-react';
import { Customer } from '../types';
import { DatabaseService } from '../services/database';
import { WhatsAppService } from '../services/whatsapp';

interface BulkMessageProps {
  customers: Customer[];
  onNavigateToContacts?: () => void;
}

interface BulkResult {
  phone: string;
  success: boolean;
  error: string | null;
}

const BulkMessage: React.FC<BulkMessageProps> = ({ customers, onNavigateToContacts }) => {
  const [selectedCustomers, setSelectedCustomers] = useState<Set<string>>(new Set());
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [results, setResults] = useState<BulkResult[]>([]);
  const [showResults, setShowResults] = useState(false);

  const handleCustomerToggle = (phone: string) => {
    const newSelected = new Set(selectedCustomers);
    if (newSelected.has(phone)) {
      newSelected.delete(phone);
    } else {
      newSelected.add(phone);
    }
    setSelectedCustomers(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedCustomers.size === customers.length) {
      setSelectedCustomers(new Set());
    } else {
      setSelectedCustomers(new Set(customers.map(c => c.phone)));
    }
  };

  const handleSendBulkMessage = async () => {
    if (selectedCustomers.size === 0 || !message.trim()) {
      return;
    }

    setIsSending(true);
    setShowResults(false);

    try {
      const selectedPhones = Array.from(selectedCustomers);
      const bulkResult = await WhatsAppService.sendBulkMessage(selectedPhones, message.trim());
      
      setResults(bulkResult.results);
      setShowResults(true);
      
      // Save successful messages to database
      for (const result of bulkResult.results) {
        if (result.success) {
          await DatabaseService.saveSentMessage(result.phone, message.trim());
        }
      }

    } catch (error) {
      console.error('Error sending bulk messages:', error);
    } finally {
      setIsSending(false);
    }
  };

  const selectedCount = selectedCustomers.size;
  const successfulSends = results.filter(r => r.success).length;
  const failedSends = results.filter(r => !r.success).length;

  return (
    <div className="flex-1 flex flex-col bg-gray-50 dark:bg-gray-900 h-full">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 sm:p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <Users className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
            <div>
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
                Bulk Message
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                Send messages to multiple customers at once
              </p>
            </div>
          </div>
          
          {onNavigateToContacts && (
            <button
              onClick={onNavigateToContacts}
              className="flex items-center space-x-2 px-3 py-2 text-sm bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
            >
              <Phone className="w-4 h-4" />
              <span>Manage Contacts</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Customer Selection */}
      <div className="flex-1 flex flex-col lg:flex-row">
        {/* Customer List */}
        <div className="lg:w-1/2 border-r border-gray-200 dark:border-gray-700">
          <div className="p-3 sm:p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
              <h3 className="font-medium text-gray-900 dark:text-white text-sm sm:text-base">
                Select Customers ({selectedCount} of {customers.length})
              </h3>
              <button
                onClick={handleSelectAll}
                className="flex items-center space-x-2 text-xs sm:text-sm text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
              >
                {selectedCustomers.size === customers.length ? (
                  <CheckSquare className="w-4 h-4" />
                ) : (
                  <Square className="w-4 h-4" />
                )}
                <span>{selectedCustomers.size === customers.length ? 'Deselect All' : 'Select All'}</span>
              </button>
            </div>
          </div>

          <div className="overflow-y-auto max-h-64 sm:max-h-96">
            {customers.length === 0 ? (
              <div className="p-4 text-center text-gray-500 dark:text-gray-400 text-sm">
                No customers found
              </div>
            ) : (
              customers.map((customer) => (
                <div
                  key={customer.id}
                  className={`p-3 sm:p-4 border-b border-gray-100 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                    selectedCustomers.has(customer.phone) ? 'bg-green-50 dark:bg-green-900/20' : ''
                  }`}
                  onClick={() => handleCustomerToggle(customer.phone)}
                >
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    {selectedCustomers.has(customer.phone) ? (
                      <CheckSquare className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 flex-shrink-0" />
                    ) : (
                      <Square className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 dark:text-white text-sm sm:text-base truncate">
                        {customer.name}
                      </div>
                      <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 truncate">
                        {customer.phone}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Message Composition */}
        <div className="lg:w-1/2 flex flex-col">
          <div className="p-3 sm:p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="font-medium text-gray-900 dark:text-white text-sm sm:text-base">Compose Message</h3>
          </div>

          <div className="flex-1 flex flex-col">
            <div className="flex-1 p-3 sm:p-4">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message here..."
                disabled={isSending}
                className="w-full h-32 sm:h-40 p-3 border border-gray-300 dark:border-gray-600 rounded-lg 
                  focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none
                  bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                  placeholder-gray-500 dark:placeholder-gray-400 text-sm sm:text-base
                  disabled:opacity-50 disabled:cursor-not-allowed"
              />
              
              <div className="mt-2 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                Characters: {message.length}
              </div>
            </div>

            {/* Send Button */}
            <div className="p-3 sm:p-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={handleSendBulkMessage}
                disabled={selectedCount === 0 || !message.trim() || isSending}
                className="w-full flex items-center justify-center space-x-2 px-3 sm:px-4 py-2 sm:py-3 
                  bg-green-600 hover:bg-green-700 disabled:bg-gray-300 dark:disabled:bg-gray-600 
                  text-white rounded-lg transition-all duration-200 text-sm sm:text-base
                  disabled:cursor-not-allowed"
              >
                {isSending ? (
                  <>
                    <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                    <span>Sending to {selectedCount} customers...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span>Send to {selectedCount} customers</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Results Modal/Section */}
      {showResults && (
        <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-3 sm:p-4">
          <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 mb-3 sm:mb-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
              <span className="text-xs sm:text-sm font-medium text-green-600">
                {successfulSends} Successful
              </span>
            </div>
            {failedSends > 0 && (
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />
                <span className="text-xs sm:text-sm font-medium text-red-600">
                  {failedSends} Failed
                </span>
              </div>
            )}
          </div>

          <div className="max-h-24 sm:max-h-32 overflow-y-auto space-y-1">
            {results.map((result, index) => (
              <div
                key={index}
                className={`flex items-center space-x-2 text-xs sm:text-sm p-2 rounded ${
                  result.success 
                    ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200' 
                    : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200'
                }`}
              >
                {result.success ? (
                  <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                ) : (
                  <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                )}
                <span className="font-medium truncate">{result.phone}</span>
                <span className="hidden sm:inline">-</span>
                <span className="truncate">{result.success ? 'Sent' : result.error}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default BulkMessage;
