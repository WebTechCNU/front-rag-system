"use client"

import { Message, MessageContent } from "@/components/ai/message"
import { cn } from "@/lib/utils"

export type Role = "user" | "assistant"

export type ChatMessageProps = {
  role: Role
  className?: string
  children?: React.ReactNode
}

export function ChatMessage({ role, className, children }: ChatMessageProps) {
  return (
    <Message from={role} className={cn("max-w-2xl", className)}>
      <MessageContent
        className={cn(
          "rounded-xl",
          "group-[.is-user]:rounded-xl",
          "group-[.is-assistant]:rounded-xl group-[.is-assistant]:bg-muted group-[.is-assistant]:px-4 group-[.is-assistant]:py-3",
        )}
      >
        {children}
      </MessageContent>
    </Message>
  )
}
