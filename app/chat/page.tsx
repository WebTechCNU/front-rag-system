"use client"

import { AppSidebar } from "@/components/app-sidebar"
import { Loader } from "@/components/ai/loader"
import {
  PromptInput,
  PromptInputBody,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
} from "@/components/ai/prompt-input"
import { ChatMessage } from "@/components/chat-message"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import type { Role } from "@/components/chat-message"
import type { ChatStatus } from "ai"
import { useEffect, useRef, useState } from "react"
import { sendChatMessage } from "@/lib/chat/client"
import { ModeToggle } from "@/components/theme-mode-toggle"

type ChatMessageType = {
  id: string
  role: Role
  content: string
  createdAt?: string
}

type ChatThread = {
  id: string
  title: string
  conversationId: string | null
  messages: ChatMessageType[]
  createdAt: string
  updatedAt: string
}

const uuid = () => {
  try {
    return crypto.randomUUID()
  } catch {
    return `${Date.now()}-${Math.random().toString(16).slice(2)}`
  }
}

const STORAGE_KEY = "front-rag:chat:threads:v1"
const ACTIVE_THREAD_KEY = "front-rag:chat:active-thread:v1"

const getWelcomeMessage = (): ChatMessageType => ({
  id: uuid(),
  role: "assistant",
  content:
    "Привіт! Я кафедральний AI-помічник. Пиши запитання про вступ, навчання або організаційні питання кафедри.",
  createdAt: new Date().toISOString(),
})

const createThread = (index: number): ChatThread => {
  const now = new Date().toISOString()
  return {
    id: uuid(),
    title: `Новий чат ${index}`,
    conversationId: null,
    messages: [getWelcomeMessage()],
    createdAt: now,
    updatedAt: now,
  }
}

export default function ChatPage() {
  const [threads, setThreads] = useState<ChatThread[]>(() => [createThread(1)])
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null)
  const [status, setStatus] = useState<ChatStatus>("ready")
  const [isSending, setIsSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement | null>(null)

  const activeThread = threads.find(thread => thread.id === activeThreadId) ?? threads[0]
  const messages = activeThread?.messages ?? []
  const conversationId = activeThread?.conversationId ?? null

  useEffect(() => {
    try {
      const rawThreads = localStorage.getItem(STORAGE_KEY)
      const rawActiveThread = localStorage.getItem(ACTIVE_THREAD_KEY)

      if (rawThreads) {
        const parsedThreads = JSON.parse(rawThreads) as ChatThread[]
        if (Array.isArray(parsedThreads) && parsedThreads.length > 0) {
          setThreads(parsedThreads)
          if (
            rawActiveThread &&
            parsedThreads.some(thread => thread.id === rawActiveThread)
          ) {
            setActiveThreadId(rawActiveThread)
          } else {
            setActiveThreadId(parsedThreads[0].id)
          }
          return
        }
      }

      const fallbackThread = createThread(1)
      setThreads([fallbackThread])
      setActiveThreadId(fallbackThread.id)
    } catch {
      // ignore storage errors
    }
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(threads))
      if (activeThreadId) {
        localStorage.setItem(ACTIVE_THREAD_KEY, activeThreadId)
      }
    } catch {
      // ignore storage errors (e.g. quota)
    }
  }, [activeThreadId, threads])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end", behavior: "smooth" })
  }, [messages.length, isSending])

  const createNewChat = () => {
    if (isSending) {
      return
    }
    setStatus("ready")
    setThreads(prev => {
      const nextThread = createThread(prev.length + 1)
      setActiveThreadId(nextThread.id)
      return [nextThread, ...prev]
    })
  }

  const setActiveThread = (threadId: string) => {
    if (isSending) {
      return
    }
    setStatus("ready")
    setActiveThreadId(threadId)
  }

  return (
    <SidebarProvider>
      <AppSidebar
        chats={threads.map(thread => ({ id: thread.id, title: thread.title }))}
        activeChatId={activeThread?.id ?? null}
        onNewChat={createNewChat}
        onSelectChat={setActiveThread}
      />
      <SidebarInset className="flex h-screen flex-col">
        <div className="absolute top-3 right-3 z-20">
          <ModeToggle />
        </div>
        <div className="flex flex-1 flex-col overflow-hidden bg-muted/30">
          <section
            className="flex-1 overflow-y-auto"
            aria-label="Messages"
          >
            <div className="mx-auto flex max-w-3xl flex-col gap-4 px-4 py-6">
              {messages.map(msg => (
                <ChatMessage key={msg.id} role={msg.role}>
                  {msg.content}
                </ChatMessage>
              ))}
              {isSending && (
                <ChatMessage role="assistant">
                  <span className="inline-flex items-center gap-2 text-muted-foreground">
                    <Loader size={14} /> Відповідаю…
                  </span>
                </ChatMessage>
              )}
              <div ref={bottomRef} />
            </div>
          </section>
          <div className="shrink-0 border-t border-border bg-background px-4 py-4">
            <div className="mx-auto max-w-3xl">
              <PromptInput
                onSubmit={async message => {
                  const text = message.text.trim()
                  if (!text || isSending || !activeThread) {
                    return
                  }

                  const userMsg: ChatMessageType = {
                    id: uuid(),
                    role: "user",
                    content: text,
                    createdAt: new Date().toISOString(),
                  }

                  const apiHistory = activeThread.messages
                    .concat(userMsg)
                    .map(m => ({ role: m.role, content: m.content }))

                  setThreads(prev =>
                    prev.map(thread =>
                      thread.id === activeThread.id
                        ? {
                            ...thread,
                            messages: thread.messages.concat(userMsg),
                            updatedAt: new Date().toISOString(),
                            title:
                              thread.messages.length <= 1
                                ? text.slice(0, 40) || thread.title
                                : thread.title,
                          }
                        : thread,
                    ),
                  )
                  setIsSending(true)
                  setStatus("submitted")

                  try {
                    const res = await sendChatMessage({
                      conversationId: activeThread.conversationId,
                      messages: apiHistory,
                      message: {
                        text,
                      },
                    })

                    if (!res.ok) {
                      setStatus("error")
                      setThreads(prev =>
                        prev.map(thread =>
                          thread.id === activeThread.id
                            ? {
                                ...thread,
                                messages: thread.messages.concat({
                                  id: uuid(),
                                  role: "assistant",
                                  content: `Помилка: ${res.error.message}`,
                                  createdAt: new Date().toISOString(),
                                }),
                                updatedAt: new Date().toISOString(),
                              }
                            : thread,
                        ),
                      )
                      return
                    }

                    setThreads(prev =>
                      prev.map(thread =>
                        thread.id === activeThread.id
                          ? {
                              ...thread,
                              conversationId: res.conversationId,
                              messages: thread.messages.concat({
                                id: res.message.id ?? uuid(),
                                role: "assistant",
                                content: res.message.content,
                                createdAt: res.message.createdAt ?? new Date().toISOString(),
                              }),
                              updatedAt: new Date().toISOString(),
                            }
                          : thread,
                      ),
                    )
                    setStatus("ready")
                  } catch {
                    setStatus("error")
                    setThreads(prev =>
                      prev.map(thread =>
                        thread.id === activeThread.id
                          ? {
                              ...thread,
                              messages: thread.messages.concat({
                                id: uuid(),
                                role: "assistant",
                                content: "Помилка мережі: не вдалося відправити повідомлення.",
                                createdAt: new Date().toISOString(),
                              }),
                              updatedAt: new Date().toISOString(),
                            }
                          : thread,
                      ),
                    )
                  } finally {
                    setIsSending(false)
                  }
                }}
              >
                <PromptInputBody>
                  <PromptInputTextarea disabled={isSending} />
                </PromptInputBody>
                <PromptInputFooter className="justify-end">
                  <PromptInputSubmit disabled={isSending} status={status} />
                </PromptInputFooter>
              </PromptInput>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
