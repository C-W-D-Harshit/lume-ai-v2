// import { useMessagesCount, useVisibleMessages } from "@/hooks/use-messages";
import { cn } from "@/lib/utils";
import React, { useCallback, useEffect, useRef } from "react";
import { MessageItem } from "./MessageItem";
import useMessages from "@/hooks/use-messages";

export default function ChatUI() {
  const { messages } = useMessages();

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  console.log(messages);

  return (
    <div
      className={cn("flex flex-col h-full", {
        hidden: messages.length === 0,
      })}
    >
      <div className="flex-1 overflow-y-auto">
        <div className="w-full mx-auto space-y-6">
          {messages.map((message) => (
            <MessageItem key={message.id} message={message} />
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>
    </div>
  );
}
