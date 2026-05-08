"use client"

import { useEffect, useState } from "react"
import { ProtectedRoute } from "@/components/protected-route"
import { Sidebar } from "@/components/dashboard/sidebar"
import { ChatHistory } from "@/components/ai-assistant/chat-history"
import { ChatWindow } from "@/components/ai-assistant/chat-window"
import { post } from "@/lib/api"

export interface Conversation {
  id: string
  title: string
  date: string
  preview: string
  messages: Message[]
  updatedAt: string
}

export interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: string
  table?: {
    headers: string[]
    rows: string[][]
  }
  chart?: {
    data: { category: string; amount: number }[]
  }
  actions?: string[]
}

interface StoredMessage {
  role: "user" | "assistant"
  content: string
  timestamp: string
}

interface StoredConversation {
  id: string
  title: string
  messages: StoredMessage[]
  updatedAt: string
}

const chatStorageKey = "financeflow_chat_conversations"

const initialMessages: Message[] = [
  {
    id: "1",
    role: "assistant",
    content:
      "Hello! I'm your Finance Assistant. I can help you track spending, analyze your budget, and provide personalized financial insights. What would you like to know today?",
    timestamp: "10:30 AM",
  },
]

const getTimestamp = () =>
  new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  })

const isStoredMessage = (value: unknown): value is StoredMessage => {
  if (typeof value !== "object" || value === null) {
    return false
  }

  const candidate = value as Record<string, unknown>

  return (
    (candidate.role === "user" || candidate.role === "assistant") &&
    typeof candidate.content === "string" &&
    typeof candidate.timestamp === "string"
  )
}

const toStoredMessages = (messages: Message[]): StoredMessage[] =>
  messages.map(({ role, content, timestamp }) => ({
    role,
    content,
    timestamp,
  }))

const toMessages = (messages: StoredMessage[], conversationId = "message"): Message[] =>
  messages.map((message, index) => ({
    id: `${conversationId}-${index}`,
    ...message,
  }))

const truncateTitle = (content: string) =>
  content.length > 30 ? `${content.slice(0, 30)}...` : content

const formatConversationDate = (dateString: string) => {
  const date = new Date(dateString)
  const today = new Date()
  const yesterday = new Date(today)

  yesterday.setDate(today.getDate() - 1)

  if (date.toDateString() === today.toDateString()) {
    return "Today"
  }

  if (date.toDateString() === yesterday.toDateString()) {
    return "Yesterday"
  }

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  })
}

const getConversationPreview = (messages: Message[]) =>
  [...messages]
    .reverse()
    .find((message) => message.role === "assistant" && message.content !== initialMessages[0].content)
    ?.content ?? messages.find((message) => message.role === "user")?.content ?? ""

const toConversation = (conversation: StoredConversation): Conversation => {
  const messages = toMessages(conversation.messages, conversation.id)

  return {
    id: conversation.id,
    title: conversation.title,
    date: formatConversationDate(conversation.updatedAt),
    preview: getConversationPreview(messages),
    messages,
    updatedAt: conversation.updatedAt,
  }
}

const isStoredConversation = (value: unknown): value is StoredConversation => {
  if (typeof value !== "object" || value === null) {
    return false
  }

  const candidate = value as Record<string, unknown>

  return (
    typeof candidate.id === "string" &&
    typeof candidate.title === "string" &&
    typeof candidate.updatedAt === "string" &&
    Array.isArray(candidate.messages) &&
    candidate.messages.every(isStoredMessage)
  )
}

const readStoredConversations = () => {
  if (typeof window === "undefined") {
    return []
  }

  try {
    const storedConversations = window.localStorage.getItem(chatStorageKey)

    if (!storedConversations) {
      return []
    }

    const parsedConversations = JSON.parse(storedConversations)

    if (
      !Array.isArray(parsedConversations) ||
      !parsedConversations.every(isStoredConversation)
    ) {
      return []
    }

    return parsedConversations.map(toConversation)
  } catch {
    return []
  }
}

const writeStoredConversations = (conversations: Conversation[]) => {
  window.localStorage.setItem(
    chatStorageKey,
    JSON.stringify(
      conversations.map((conversation) => ({
        id: conversation.id,
        title: conversation.title,
        messages: toStoredMessages(conversation.messages),
        updatedAt: conversation.updatedAt,
      })),
    ),
  )
}

export default function AIAssistantPage() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeConversation, setActiveConversation] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [isTyping, setIsTyping] = useState(false)

  useEffect(() => {
    setConversations(readStoredConversations())
  }, [])

  const handleNewChat = () => {
    setMessages(initialMessages)
    setActiveConversation(null)
    setIsTyping(false)
  }

  const handleSelectConversation = (id: string) => {
    const conversation = conversations.find((item) => item.id === id)

    if (!conversation) {
      return
    }

    setActiveConversation(id)
    setMessages(conversation.messages)
    setIsTyping(false)
  }

  const saveConversation = (nextMessages: Message[]) => {
    const firstUserMessage = nextMessages.find((message) => message.role === "user")

    if (!firstUserMessage) {
      return
    }

    const id = activeConversation ?? `chat-${Date.now()}`
    const updatedAt = new Date().toISOString()
    const conversation: Conversation = {
      id,
      title: truncateTitle(firstUserMessage.content),
      date: formatConversationDate(updatedAt),
      preview: getConversationPreview(nextMessages),
      messages: nextMessages,
      updatedAt,
    }

    setActiveConversation(id)
    setConversations((previousConversations) => {
      const nextConversations = [
        conversation,
        ...previousConversations.filter((item) => item.id !== id),
      ]

      writeStoredConversations(nextConversations)
      return nextConversations
    })
  }

  const handleSendMessage = async (content: string) => {
    const trimmedContent = content.trim()

    if (!trimmedContent || isTyping) {
      return
    }

    const newMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: trimmedContent,
      timestamp: getTimestamp(),
    }

    const messagesWithUserMessage = [...messages, newMessage]

    setMessages(messagesWithUserMessage)
    setIsTyping(true)

    try {
      const response = await post<{ response: string }>("/api/chat", {
        message: trimmedContent,
      })

      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response.response,
        timestamp: getTimestamp(),
      }

      const nextMessages = [...messagesWithUserMessage, aiResponse]

      setMessages(nextMessages)
      saveConversation(nextMessages)
    } catch (caughtError) {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content:
          caughtError instanceof Error
            ? caughtError.message
            : "Unable to get an AI response right now.",
        timestamp: getTimestamp(),
      }

      const nextMessages = [...messagesWithUserMessage, aiResponse]

      setMessages(nextMessages)
      saveConversation(nextMessages)
    } finally {
      setIsTyping(false)
    }
  }

  return (
    <ProtectedRoute>
      <div className="h-screen overflow-hidden bg-background">
        <Sidebar />
        <main className="ml-64 flex h-screen min-w-0 overflow-hidden">
          <ChatHistory
            conversations={conversations}
            activeId={activeConversation}
            onSelect={handleSelectConversation}
            onNewChat={handleNewChat}
          />
          <ChatWindow
            messages={messages}
            isTyping={isTyping}
            onSendMessage={handleSendMessage}
          />
        </main>
      </div>
    </ProtectedRoute>
  )
}
