"use client";

import { cn } from "@/lib/utils";
import { ChatMessageItem } from "./chat-message";
import { useChatScroll } from "@/hooks/use-chat-scroll";
import { useRealtimeChat } from "@/hooks/use-realtime-chat";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export type ChatMessage = {
  id: string;
  content: string;
  user: { name: string };
  createdAt: string;
};

interface RealtimeChatProps {
  roomName: string;
  username: string;
  onMessage?: (messages: ChatMessage[]) => void;
  messages?: ChatMessage[];
}

/**
 * Realtime chat component
 * @param roomName - The name of the room to join. Each room is a unique chat.
 * @param username - The username of the user
 * @param onMessage - The callback function to handle the messages. Useful if you want to store the messages in a database.
 * @param messages - The messages to display in the chat. Useful if you want to display messages from a database.
 * @returns The chat component
 */
export const RealtimeChat = ({
  roomName,
  username,
  onMessage,
  messages: initialMessages = [],
}: RealtimeChatProps) => {
  const { containerRef, scrollToBottom } = useChatScroll();

  const {
    messages: realtimeMessagesRaw,
    sendMessage,
    isConnected,
  } = useRealtimeChat({ roomName, username });
  const [newMessage, setNewMessage] = useState("");

  // ✅ CRITICAL FIX: Always ensure realtimeMessages is an array
  const realtimeMessages = useMemo(() => {
    if (!realtimeMessagesRaw) return [];
    if (!Array.isArray(realtimeMessagesRaw)) {
      console.warn("realtimeMessages is not an array:", realtimeMessagesRaw);
      return [];
    }
    return realtimeMessagesRaw;
  }, [realtimeMessagesRaw]);

  // Merge realtime messages with initial messages
  const allMessages = useMemo(() => {
    const safeInitial = Array.isArray(initialMessages) ? initialMessages : [];
    const safeRealtime = Array.isArray(realtimeMessages)
      ? realtimeMessages
      : [];

    const mergedMessages = [...safeInitial, ...safeRealtime];

    // Dedupe by id
    const uniqueMessages = mergedMessages.filter(
      (message, index, self) =>
        message &&
        typeof message === "object" &&
        "id" in message &&
        index === self.findIndex((m) => m && m.id === message.id)
    );

    // Sort by createdAt
    return uniqueMessages.sort((a, b) => {
      if (!a?.createdAt || !b?.createdAt) return 0;
      return a.createdAt.localeCompare(b.createdAt);
    });
  }, [initialMessages, realtimeMessages]);

  // Auto-scroll
  useEffect(() => {
    scrollToBottom();
  }, [allMessages, scrollToBottom]);

  // // Notify parent of message changes
  // useEffect(() => {
  //   if (onMessage && allMessages.length > 0) {
  //     onMessage(allMessages);
  //   }
  // }, [allMessages, onMessage]);

  const handleSendMessage = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!newMessage.trim() || !isConnected) return;

      const content = newMessage.trim();

      // ✅ Tạo message với ID unique
      const msgId =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random()}`;

      const newMsg: ChatMessage = {
        id: msgId,
        content,
        user: { name: username },
        createdAt: new Date().toISOString(),
      };

      // 🔥 GỬI REALTIME TRƯỚC (để UI update ngay)
      sendMessage(content);

      // 🔥 CHỈ LƯU DB NẾU CÓ onMessage
      // Và chỉ lưu 1 lần duy nhất tại đây
      if (onMessage) {
        console.log("[RealtimeChat] Calling onMessage to save to DB:", msgId);
        onMessage([newMsg]);
      }

      setNewMessage("");
    },
    [newMessage, isConnected, sendMessage, onMessage, username]
  );

  return (
    <div className="flex flex-col h-full w-full bg-background text-foreground antialiased">
      {/* Messages */}
      <div ref={containerRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {allMessages.length === 0 ? (
          <div className="text-center text-sm text-muted-foreground">
            Chưa có tin nhắn nào
          </div>
        ) : null}
        <div className="space-y-1">
          {allMessages.map((message, index) => {
            const prevMessage = index > 0 ? allMessages[index - 1] : null;
            const showHeader =
              !prevMessage || prevMessage.user.name !== message.user.name;

            return (
              <div
                key={message.id}
                className="animate-in fade-in slide-in-from-bottom-4 duration-300"
              >
                <ChatMessageItem
                  message={message}
                  isOwnMessage={message.user.name === username}
                  showHeader={showHeader}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Input area */}
      <div className="border-t p-4">
        <form
          onSubmit={handleSendMessage}
          className="flex w-full gap-2 border-t border-border p-4"
        >
          <Input
            className={cn(
              "rounded-full bg-background text-sm transition-all duration-300",
              isConnected && newMessage.trim()
                ? "w-[calc(100%-36px)]"
                : "w-full"
            )}
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Nhập tin nhắn..."
            disabled={!isConnected}
          />
          {isConnected && newMessage.trim() && (
            <Button
              className="aspect-square rounded-full animate-in fade-in slide-in-from-right-4 duration-300"
              type="submit"
              disabled={!isConnected}
            >
              <Send className="size-4" />
            </Button>
          )}
        </form>
        {!isConnected && (
          <div className="text-xs text-red-600 mt-2">Đang kết nối lại...</div>
        )}
      </div>
    </div>
  );
};
