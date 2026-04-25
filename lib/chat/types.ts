export type ChatRole = "user" | "assistant"

export type ChatMessage = {
  id: string
  role: ChatRole
  content: string
  createdAt?: string
}

export type ChatApiMessage = {
  role: ChatRole
  content: string
}

export type ChatSendRequest = {
  conversationId?: string | null
  messages: ChatApiMessage[]
  message: {
    text: string
    files?: Array<{
      url?: string
      mediaType?: string
      filename?: string
    }>
  }
}

export type ChatSendSuccessResponse = {
  ok: true
  conversationId: string
  message: ChatMessage & { role: "assistant" }
}

export type ChatSendErrorResponse = {
  ok: false
  error: { code: string; message: string }
}

export type ChatSendResponse = ChatSendSuccessResponse | ChatSendErrorResponse

