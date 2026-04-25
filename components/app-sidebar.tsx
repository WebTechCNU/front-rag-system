import * as React from "react"
import { ChevronUp, LogIn, LogOut, MessageSquare, Plus, UserCircle2 } from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

type SidebarChatItem = {
  id: string
  title: string
}

type AppSidebarProps = React.ComponentProps<typeof Sidebar> & {
  chats?: SidebarChatItem[]
  activeChatId?: string | null
  onNewChat?: () => void
  onSelectChat?: (chatId: string) => void
}

export function AppSidebar({
  chats = [],
  activeChatId = null,
  onNewChat,
  onSelectChat,
  ...props
}: AppSidebarProps) {
  const [displayName, setDisplayName] = React.useState("Гість")
  const [isLoggedIn, setIsLoggedIn] = React.useState(false)

  React.useEffect(() => {
    try {
      const savedName = localStorage.getItem("front-rag:user:name")
      const savedLoggedIn = localStorage.getItem("front-rag:user:logged-in")
      if (savedName) {
        setDisplayName(savedName)
      }
      if (savedLoggedIn === "1") {
        setIsLoggedIn(true)
      }
    } catch {
      // ignore storage errors
    }
  }, [])

  const signInAsGuest = () => {
    const nextName = "Користувач"
    setDisplayName(nextName)
    setIsLoggedIn(true)
    try {
      localStorage.setItem("front-rag:user:name", nextName)
      localStorage.setItem("front-rag:user:logged-in", "1")
    } catch {
      // ignore storage errors
    }
  }

  const signOut = () => {
    setDisplayName("Гість")
    setIsLoggedIn(false)
    try {
      localStorage.setItem("front-rag:user:name", "Гість")
      localStorage.setItem("front-rag:user:logged-in", "0")
    } catch {
      // ignore storage errors
    }
  }

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <div className="rounded-md border border-sidebar-border bg-sidebar-accent/40 p-2">
          <div className="mb-2 text-xs text-sidebar-foreground/80">
            Діалоги кафедрального помічника
          </div>
          <Button
            type="button"
            size="sm"
            className="w-full justify-start gap-2"
            onClick={onNewChat}
          >
            <Plus className="size-4" />
            Новий чат
          </Button>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Історія чатів</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {chats.map(chat => (
                <SidebarMenuItem key={chat.id}>
                  <SidebarMenuButton
                    type="button"
                    isActive={chat.id === activeChatId}
                    onClick={() => onSelectChat?.(chat.id)}
                    className="gap-2"
                  >
                    <MessageSquare className="size-4" />
                    <span>{chat.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton className="h-10">
                  <UserCircle2 className="size-5" />
                  <div className="flex min-w-0 flex-1 flex-col text-left">
                    <span className="truncate text-sm">{displayName}</span>
                    <span className="truncate text-xs text-sidebar-foreground/70">
                      {isLoggedIn ? "Увійшов у систему" : "Не авторизований"}
                    </span>
                  </div>
                  <ChevronUp className="ml-auto size-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" side="top" className="w-56">
                <DropdownMenuLabel>Акаунт</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {isLoggedIn ? (
                  <DropdownMenuItem onClick={signOut}>
                    <LogOut />
                    Вийти
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem onClick={signInAsGuest}>
                    <LogIn />
                    Увійти
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
