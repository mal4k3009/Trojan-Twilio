import { useState, useEffect } from 'react'
import { Customer, Message } from '../types'
import { DatabaseService } from '../services/database'
import { supabase } from '../lib/supabase'

interface UseConversationsReturn {
  customers: Customer[]
  messages: { [customerId: number]: Message[] }
  loading: boolean
  error: string | null
  refreshData: () => Promise<void>
}

export const useConversations = (): UseConversationsReturn => {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [messages, setMessages] = useState<{ [customerId: number]: Message[] }>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      console.log('🔄 Fetching conversations data...')
      
      // Fetch customers and messages from database
      const [fetchedCustomers, fetchedMessages] = await Promise.all([
        DatabaseService.getCustomers(),
        DatabaseService.getAllMessages()
      ])
      
      console.log('✅ Fetched customers:', fetchedCustomers)
      console.log('✅ Fetched messages:', fetchedMessages)
      
      setCustomers(fetchedCustomers)
      setMessages(fetchedMessages)
    } catch (err) {
      console.error('❌ Error fetching data:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    
    // Disabled auto-refresh to prevent annoying page refreshes
    // You can manually refresh using the refresh button in the header
    
  }, [])

  const refreshData = async () => {
    console.log('🔄 Manually refreshing conversation data...')
    setLoading(true)
    
    try {
      // Skip the connection test and go straight to fetching data
      // This is faster and more reliable
      await fetchData()
    } catch (err) {
      console.error('❌ Refresh error:', err)
      setError(err instanceof Error ? err.message : 'Failed to refresh data')
    } finally {
      setLoading(false)
    }
  }

  return {
    customers,
    messages,
    loading,
    error,
    refreshData
  }
}
