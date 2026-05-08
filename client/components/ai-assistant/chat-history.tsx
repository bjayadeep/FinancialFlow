"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Plus, Search, MessageSquare } from "lucide-react"
import type { Conversation } from "@/app/ai-assistant/page"

interface ChatHistoryProps {
  conversations: Conversation[]
  activeId: string | null
  onSelect: (id: string) => void
  onNewChat: () => void
}

export function ChatHistory({
  conversations,
  activeId,
  onSelect,
  onNewChat,
}: ChatHistoryProps) {
  const [searchQuery, setSearchQuery] = useState("")

  const filteredConversations = conversations.filter(
    (conv) =>
      conv.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.preview.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="flex h-full w-64 shrink-0 flex-col border-r border-border bg-card">
      {/* Header */}
      <div className="flex flex-col gap-3 p-4 border-b border-border">
        <Button
          className="w-full gap-2 bg-primary hover:bg-primary/90"
          onClick={onNewChat}
        >
          <Plus className="h-4 w-4" />
          New Chat
        </Button>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-background border-border"
          />
        </div>
      </div>

      {/* Conversation List */}
      <ScrollArea className="min-h-0 flex-1">
        <div className="p-2">
          {filteredConversations.map((conversation) => (
            <button
              key={conversation.id}
              onClick={() => onSelect(conversation.id)}
              className={cn(
                "w-full rounded-lg p-3 text-left transition-colors mb-1",
                activeId === conversation.id
                  ? "bg-primary/10 border border-primary/20"
                  : "hover:bg-muted/50"
              )}
            >
              <div className="flex items-start gap-3">
                <div
                  className={cn(
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
                    activeId === conversation.id
                      ? "bg-primary/20 text-primary"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  <MessageSquare className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4
                      className={cn(
                        "text-sm font-medium truncate",
                        activeId === conversation.id
                          ? "text-primary"
                          : "text-foreground"
                      )}
                    >
                      {conversation.title}
                    </h4>
                    <span className="text-xs text-muted-foreground shrink-0">
                      {conversation.date}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate mt-1">
                    {conversation.preview}
                  </p>
                </div>
              </div>
            </button>
          ))}
          {filteredConversations.length === 0 && (
            <p className="px-3 py-8 text-center text-sm text-muted-foreground">
              No conversations yet.
            </p>
          )}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="border-t border-border p-4">
        <p className="text-xs text-muted-foreground text-center">
          {conversations.length} conversations
        </p>
      </div>
    </div>
  )
}
