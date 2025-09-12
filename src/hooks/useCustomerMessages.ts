import { useState, useEffect } from 'react'
import { Message } from '../types'
import { DatabaseService } from '../services/database'

interface UseCustomerMessagesReturn {
  messages: Message[]
  loading: boolean
  error: string | null
  refreshMessages: () => Promise<void>
}

export const useCustomerMessages = (customerPhone: string | null): UseCustomerMessagesReturn => {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchMessages = async () => {
      if (!customerPhone) {
        setMessages([])
        return
      }

      try {
        setLoading(true)
        setError(null)
        
        const fetchedMessages = await DatabaseService.getMessagesForCustomer(customerPhone)
        setMessages(fetchedMessages)
      } catch (err) {
        console.error('Error fetching messages:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch messages')
      } finally {
        setLoading(false)
      }
    }

    fetchMessages()
  }, [customerPhone])

  const refreshMessages = async () => {
    if (!customerPhone) {
      setMessages([])
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      const fetchedMessages = await DatabaseService.getMessagesForCustomer(customerPhone)
      setMessages(fetchedMessages)
    } catch (err) {
      console.error('Error fetching messages:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch messages')
    } finally {
      setLoading(false)
    }
  }

  return {
    messages,
    loading,
    error,
    refreshMessages
  }
}
