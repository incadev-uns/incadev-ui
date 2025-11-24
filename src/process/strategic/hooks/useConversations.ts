import { useState, useEffect } from 'react'

export interface Conversation {
  id: string
  name: string
  description?: string
  lastMessage?: string
  lastMessageTime?: string
  unreadCount: number
  participantCount: number
  isArchived: boolean
  isPinned: boolean
  createdAt: string
  updatedAt: string
}

export interface Message {
  id: string
  conversationId: string
  userId: string
  userName: string
  userAvatar?: string
  content: string
  timestamp: string
  files?: MessageFile[]
  createdAt: string
}

export interface MessageFile {
  id: string
  messageId: string
  name: string
  type: string
  size: string
  path: string
  url: string
}

export interface ConversationUser {
  id: string
  conversationId: string
  userId: string
  userName: string
  userEmail: string
  userAvatar?: string
  joinedAt: string
  isOnline: boolean
}

export function useConversations() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchConversations = async () => {
    try {
      setLoading(true)
      // Aquí iría la llamada a la API
      // const response = await fetch('/api/conversations')
      // const data = await response.json()
      
      // Mock data for now
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const mockData: Conversation[] = [
        {
          id: "1",
          name: "Plan Estratégico 2024-2028",
          description: "Discusión sobre objetivos y metas del plan estratégico",
          lastMessage: "¿Han revisado los objetivos del segundo trimestre?",
          lastMessageTime: "10:30 AM",
          unreadCount: 3,
          participantCount: 8,
          isArchived: false,
          isPinned: true,
          createdAt: "2024-01-15T09:00:00Z",
          updatedAt: "2024-01-20T10:30:00Z"
        }
      ]
      
      setConversations(mockData)
    } catch (err) {
      setError('Error al cargar las conversaciones')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const createConversation = async (data: { 
    name: string
    description?: string
    participantIds: string[] 
  }) => {
    try {
      // API call would go here
      console.log('Creating conversation:', data)
      
      // Optimistically update UI
      const newConversation: Conversation = {
        id: Date.now().toString(),
        name: data.name,
        description: data.description,
        unreadCount: 0,
        participantCount: data.participantIds.length + 1, // +1 for current user
        isArchived: false,
        isPinned: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      
      setConversations(prev => [newConversation, ...prev])
      return newConversation
    } catch (err) {
      setError('Error al crear la conversación')
      throw err
    }
  }

  const archiveConversation = async (conversationId: string) => {
    try {
      // API call would go here
      setConversations(prev => 
        prev.map(conv => 
          conv.id === conversationId 
            ? { ...conv, isArchived: true }
            : conv
        )
      )
    } catch (err) {
      setError('Error al archivar la conversación')
      throw err
    }
  }

  const pinConversation = async (conversationId: string) => {
    try {
      // API call would go here
      setConversations(prev => 
        prev.map(conv => 
          conv.id === conversationId 
            ? { ...conv, isPinned: !conv.isPinned }
            : conv
        )
      )
    } catch (err) {
      setError('Error al fijar la conversación')
      throw err
    }
  }

  useEffect(() => {
    fetchConversations()
  }, [])

  return {
    conversations,
    loading,
    error,
    createConversation,
    archiveConversation,
    pinConversation,
    refetch: fetchConversations
  }
}

export function useMessages(conversationId: string) {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchMessages = async () => {
    try {
      setLoading(true)
      // API call would go here
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const mockMessages: Message[] = [
        {
          id: "1",
          conversationId,
          userId: "user1",
          userName: "María González",
          content: "Buenos días equipo. ¿Han revisado los objetivos del segundo trimestre?",
          timestamp: "10:30 AM",
          createdAt: "2024-01-20T10:30:00Z"
        }
      ]
      
      setMessages(mockMessages)
    } catch (err) {
      setError('Error al cargar los mensajes')
    } finally {
      setLoading(false)
    }
  }

  const sendMessage = async (content: string, files?: File[]) => {
    try {
      // API call would go here
      const newMessage: Message = {
        id: Date.now().toString(),
        conversationId,
        userId: "current-user",
        userName: "Tú",
        content,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        createdAt: new Date().toISOString(),
        files: files?.map(file => ({
          id: Date.now().toString() + Math.random(),
          messageId: Date.now().toString(),
          name: file.name,
          type: file.type,
          size: (file.size / 1024 / 1024).toFixed(1) + " MB",
          path: "",
          url: "#"
        }))
      }
      
      setMessages(prev => [...prev, newMessage])
      return newMessage
    } catch (err) {
      setError('Error al enviar el mensaje')
      throw err
    }
  }

  useEffect(() => {
    if (conversationId) {
      fetchMessages()
    }
  }, [conversationId])

  return {
    messages,
    loading,
    error,
    sendMessage,
    refetch: fetchMessages
  }
}
