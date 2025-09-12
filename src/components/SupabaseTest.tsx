import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const SupabaseTest: React.FC = () => {
  const [connectionStatus, setConnectionStatus] = useState<string>('Testing...');
  const [tableData, setTableData] = useState<Record<string, unknown>[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    testConnection();
  }, []);

  const testConnection = async () => {
    try {
      console.log('Testing Supabase connection...');
      
      // Try different table name variations
      const tableNames = ['ConversationalMemory', 'ConversationalMemory', 'conversation_memory'];
      let foundData = false;
      
      for (const tableName of tableNames) {
        try {
          const { data: testData, error: testError } = await supabase
            .from(tableName)
            .select('*')
            .limit(5);

          if (testError) {
            console.log(`❌ Table ${tableName} error:`, testError.message);
            continue;
          }

          if (testData && testData.length > 0) {
            console.log(`✅ Found data in table: ${tableName}`, testData);
            setTableData(testData);
            setConnectionStatus(`✅ Connected Successfully (table: ${tableName})`);
            setError(null);
            foundData = true;
            break;
          } else {
            console.log(`⚠️ Table ${tableName} exists but has no data`);
          }
        } catch (tableError) {
          console.log(`❌ Error accessing table ${tableName}:`, tableError);
        }
      }
      
      if (!foundData) {
        // Test basic Supabase connection
        const { error: healthError } = await supabase
          .from('_supabase_health_check')
          .select('*')
          .limit(1);
          
        if (healthError && healthError.code === 'PGRST116') {
          setConnectionStatus('✅ Connected to Supabase, but ConversationalMemory table not found');
          setError('Table "ConversationalMemory" does not exist. Please create it using the database-setup.sql script.');
        } else {
          setConnectionStatus('✅ Connected but no data found');
          setError('Connected to Supabase but no conversation data found. Make sure the table exists and has data.');
        }
      }

    } catch (err) {
      console.error('Connection Error:', err);
      setError(`Connection Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
      setConnectionStatus('❌ Connection Failed');
    }
  };

  return (
    <div className="p-4 sm:p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">Supabase Connection Test</h2>
      
      <div className="mb-3 sm:mb-4">
        <p className="text-base sm:text-lg font-medium">Status: {connectionStatus}</p>
      </div>

      {error && (
        <div className="mb-3 sm:mb-4 p-3 bg-red-100 dark:bg-red-900/20 border border-red-400 text-red-700 dark:text-red-400 rounded text-sm sm:text-base">
          <strong>Error:</strong> {error}
        </div>
      )}

      <div className="mb-3 sm:mb-4">
        <button 
          onClick={testConnection}
          className="px-3 sm:px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm sm:text-base transition-colors"
        >
          Test Again
        </button>
      </div>

      <div>
        <h3 className="text-base sm:text-lg font-semibold mb-2">
          Data from ConversationalMemory ({tableData.length} records):
        </h3>
        
        {tableData.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base">No data found or table doesn't exist</p>
        ) : (
          <div className="max-h-48 sm:max-h-64 overflow-y-auto">
            <pre className="text-xs sm:text-sm bg-gray-100 dark:bg-gray-700 p-2 sm:p-3 rounded">
              {JSON.stringify(tableData, null, 2)}
            </pre>
          </div>
        )}
      </div>

      <div className="mt-3 sm:mt-4 text-xs sm:text-sm text-gray-600 dark:text-gray-400 space-y-1">
        <p><strong>Supabase URL:</strong> {import.meta.env.VITE_SUPABASE_URL}</p>
        <p><strong>Environment loaded:</strong> {import.meta.env.VITE_SUPABASE_URL ? '✅' : '❌'}</p>
      </div>
    </div>
  );
};

export default SupabaseTest;
