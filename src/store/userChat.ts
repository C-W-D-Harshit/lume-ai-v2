import { Message, generateId } from "ai";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface ChatMessage extends Message {
  model: string;
  provider: string;
}

type Chat = {
  id: string;
  title: string;
  model: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
};

interface ChatState {
  chat: Chat[];
  getAllChats: () => Chat[];
  getChat: (id: string) => Chat | undefined;
  createChat: (model: string, messages: ChatMessage[]) => Promise<string>;
  updateChat: (id: string, messages: ChatMessage[]) => void;
  deleteChat: (id: string) => void;
  addMessage: (id: string, message: ChatMessage) => void;
  // updateMessage: (id: string, message: ChatMessage) => void;
  // deleteMessage: (id: string, messageId: string) => void;
  // clearChat: (id: string) => void;
  clearAllChats: () => void;
  updateChatTitle: (id: string, title: string) => void;
}

export const useUserChat = create<ChatState>()(
  persist(
    (set, get) => ({
      chat: [],
      getAllChats: () => get().chat,
      getChat: (id: string) => {
        const { chat } = get();
        return chat.find((chat) => chat.id === id);
      },
      createChat: async (model: string, messages: ChatMessage[]) => {
        const id = generateId();
        // Get title suggestion from API using messages
        const response = await fetch("/api/completion", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messages: messages.slice(0, 2), // Send first two messages for context
          }),
        });

        const { title = "New Chat", error } = await response.json();

        if (error) {
          throw new Error(error);
        }
        set((state) => ({
          chat: [
            ...state.chat,
            {
              id,
              title,
              model,
              messages,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          ],
        }));
        return id;
      },
      updateChat: (id: string, messages: ChatMessage[]) => {
        set((state) => ({
          chat: state.chat.map((chat) =>
            chat.id === id ? { ...chat, messages, updatedAt: new Date() } : chat
          ),
        }));
      },
      deleteChat: (id: string) => {
        set((state) => ({
          chat: state.chat.filter((chat) => chat.id !== id),
        }));
      },
      clearAllChats: () => {
        set({ chat: [] });
      },
      addMessage: (id: string, message: ChatMessage) => {
        set((state) => ({
          chat: state.chat.map((chat) =>
            chat.id === id
              ? { ...chat, messages: [...chat.messages, message] }
              : chat
          ),
        }));
      },
      updateChatTitle: (id: string, title: string) => {
        set((state) => ({
          chat: state.chat.map((chat) =>
            chat.id === id ? { ...chat, title, updatedAt: new Date() } : chat
          ),
        }));
      },
    }),
    {
      name: "chat-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
