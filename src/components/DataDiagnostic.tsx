import React, { useEffect, useState } from 'react';
import { DatabaseService } from '../services/database';
import { Customer, Message } from '../types';

interface DiagnosticInfo {
  rawConversations: Record<string, unknown>[];
  processedCustomers: Customer[];
  messagesInfo: Array<{
    customer: Customer;
    messageCount: number;
    messages: Message[];
  }>;
  totalConversations: number;
  totalCustomers: number;
  error?: string;
}

const DataDiagnostic: React.FC = () => {
  const [diagnosticInfo, setDiagnosticInfo] = useState<DiagnosticInfo | null>(null);

  useEffect(() => {
    const runDiagnostic = async () => {
      try {
        // Get raw conversations
        const conversations = await DatabaseService.getConversations();
        
        // Get processed customers
        const customers = await DatabaseService.getCustomers();
        
        // Get messages for each customer
        const messagesInfo = [];
        for (const customer of customers) {
          const messages = await DatabaseService.getMessagesForCustomer(customer.phone);
          messagesInfo.push({
            customer: customer,
            messageCount: messages.length,
            messages: messages
          });
        }

        setDiagnosticInfo({
          rawConversations: conversations as unknown as Record<string, unknown>[],
          processedCustomers: customers,
          messagesInfo: messagesInfo,
          totalConversations: conversations.length,
          totalCustomers: customers.length
        });

      } catch (error) {
        console.error('Diagnostic error:', error);
        setDiagnosticInfo({
          rawConversations: [],
          processedCustomers: [],
          messagesInfo: [],
          totalConversations: 0,
          totalCustomers: 0,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    };

    runDiagnostic();
  }, []);

  if (!diagnosticInfo) {
    return <div className="p-3 sm:p-4 bg-yellow-100 dark:bg-yellow-900/20 rounded text-sm sm:text-base">Running diagnostic...</div>;
  }

  if (diagnosticInfo.error) {
    return <div className="p-3 sm:p-4 bg-red-100 dark:bg-red-900/20 rounded text-sm sm:text-base">Error: {diagnosticInfo.error}</div>;
  }

  return (
    <div className="p-3 sm:p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg space-y-3 sm:space-y-4">
      <h3 className="font-bold text-base sm:text-lg">Production Data Diagnostic</h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <div className="bg-white dark:bg-gray-800 p-3 rounded border border-gray-200 dark:border-gray-700">
          <h4 className="font-semibold text-sm sm:text-base mb-2">Raw Data</h4>
          <p className="text-xs sm:text-sm">Conversations in DB: {diagnosticInfo.totalConversations}</p>
          <p className="text-xs sm:text-sm">Processed Customers: {diagnosticInfo.totalCustomers}</p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-3 rounded border border-gray-200 dark:border-gray-700">
          <h4 className="font-semibold text-sm sm:text-base mb-2">Data Flow</h4>
          <p className="text-xs sm:text-sm">✅ Database connection: Working</p>
          <p className="text-xs sm:text-sm">✅ Data retrieval: Working</p>
          <p className={`text-xs sm:text-sm ${diagnosticInfo.totalCustomers > 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
            {diagnosticInfo.totalCustomers > 0 ? "✅" : "❌"} Customer processing: {diagnosticInfo.totalCustomers > 0 ? "Working" : "Failed"}
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-3 rounded border border-gray-200 dark:border-gray-700">
        <h4 className="font-semibold text-sm sm:text-base mb-2">Customer Details</h4>
        <div className="space-y-2">
          {diagnosticInfo.messagesInfo.map((info, index) => (
            <div key={index} className="p-2 border-l-4 border-blue-400 bg-gray-50 dark:bg-gray-700 rounded">
              <p className="text-xs sm:text-sm"><strong>Name:</strong> {info.customer.name}</p>
              <p className="text-xs sm:text-sm"><strong>Phone:</strong> {info.customer.phone}</p>
              <p className="text-xs sm:text-sm"><strong>ID:</strong> {info.customer.id}</p>
              <p className="text-xs sm:text-sm"><strong>Messages:</strong> {info.messageCount}</p>
              <p className="text-xs sm:text-sm"><strong>Online:</strong> {info.customer.isOnline ? "Yes" : "No"}</p>
            </div>
          ))}
        </div>
      </div>

      <details className="bg-white dark:bg-gray-800 p-3 rounded border border-gray-200 dark:border-gray-700">
        <summary className="font-semibold cursor-pointer text-sm sm:text-base">Raw Database Data</summary>
        <pre className="mt-2 text-xs overflow-auto max-h-32 sm:max-h-40 bg-gray-100 dark:bg-gray-700 p-2 rounded">
          {JSON.stringify(diagnosticInfo.rawConversations, null, 2)}
        </pre>
      </details>
    </div>
  );
};

export default DataDiagnostic;
