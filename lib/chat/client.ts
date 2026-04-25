import type { ChatSendRequest, ChatSendResponse } from "@/lib/chat/types"

export async function sendChatMessage(payload: ChatSendRequest): Promise<ChatSendResponse> {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })

  let data: unknown
  try {
    data = await res.json()
  } catch {
    return {
      ok: false,
      error: { code: "bad_response", message: "Server returned a non-JSON response." },
    }
  }

  if (!res.ok) {
    const maybe = data as Partial<ChatSendResponse>
    if (maybe.ok === false && maybe.error?.code && maybe.error?.message) {
      return { ok: false, error: maybe.error }
    }

    return {
      ok: false,
      error: { code: "http_error", message: `Request failed (${res.status}).` },
    }
  }

  return data as ChatSendResponse
}

