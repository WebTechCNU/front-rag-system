import { NextResponse } from "next/server"

type ChatRole = "user" | "assistant"

type ChatMessage = {
  id: string
  role: ChatRole
  content: string
  createdAt: string
}

type ChatRequestBody = {
  conversationId?: string | null
  messages?: Array<{ role: ChatRole; content: string }>
  userStatus?: string
  message?: {
    text?: string
    files?: Array<{
      url?: string
      mediaType?: string
      filename?: string
    }>
  }
}

type ChatResponseBody =
  | {
      ok: true
      conversationId: string
      message: ChatMessage
    }
  | {
      ok: false
      error: { code: string; message: string }
    }

type MathFacultyResponse = {
  status?: string
  answer?: string
}

const BACKEND_URL =
  process.env.CHAT_BACKEND_URL ??
  "https://chnu-ai-systems-production.up.railway.app/api/math-faculty"

export async function POST(req: Request) {
  let body: ChatRequestBody | null = null

  try {
    body = (await req.json()) as ChatRequestBody
  } catch {
    const res: ChatResponseBody = {
      ok: false,
      error: { code: "bad_json", message: "Request body must be valid JSON." },
    }
    return NextResponse.json(res, { status: 400 })
  }

  const text = body?.message?.text?.trim() ?? ""
  if (!text) {
    const res: ChatResponseBody = {
      ok: false,
      error: { code: "empty_message", message: "Message text is required." },
    }
    return NextResponse.json(res, { status: 400 })
  }

  const conversationId = body?.conversationId ?? crypto.randomUUID()

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 30_000)

  let backendData: MathFacultyResponse
  try {
    const backendRes = await fetch(BACKEND_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        question: text,
        chat_history: (body?.messages ?? []).map(
          msg => `${msg.role === "user" ? "Користувач" : "Асистент"}: ${msg.content}`,
        ),
        user_status: body?.userStatus?.trim() || "student",
      }),
      signal: controller.signal,
    })

    let parsed: unknown
    try {
      parsed = await backendRes.json()
    } catch {
      const res: ChatResponseBody = {
        ok: false,
        error: {
          code: "bad_backend_response",
          message: "Backend returned a non-JSON response.",
        },
      }
      return NextResponse.json(res, { status: 502 })
    }

    if (!backendRes.ok) {
      const res: ChatResponseBody = {
        ok: false,
        error: {
          code: "backend_http_error",
          message: `Backend request failed (${backendRes.status}).`,
        },
      }
      return NextResponse.json(res, { status: 502 })
    }

    backendData = parsed as MathFacultyResponse
  } catch (error) {
    const isAbort = error instanceof Error && error.name === "AbortError"
    const res: ChatResponseBody = {
      ok: false,
      error: {
        code: isAbort ? "backend_timeout" : "backend_network_error",
        message: isAbort
          ? "Backend timeout: request took too long."
          : "Backend network error: failed to contact service.",
      },
    }
    return NextResponse.json(res, { status: 502 })
  } finally {
    clearTimeout(timeout)
  }

  const assistantContent = backendData.answer?.trim()
  if (!assistantContent) {
    const res: ChatResponseBody = {
      ok: false,
      error: {
        code: "empty_backend_answer",
        message: "Backend returned an empty answer.",
      },
    }
    return NextResponse.json(res, { status: 502 })
  }

  const res: ChatResponseBody = {
    ok: true,
    conversationId,
    message: {
      id: crypto.randomUUID(),
      role: "assistant",
      content: assistantContent,
      createdAt: new Date().toISOString(),
    },
  }

  return NextResponse.json(res, { status: 200 })
}

