import { Message } from "ai";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

/**
 * Interface representing a single chat session
 */
interface Chat {
  id: string;
  name: string;
  messages: Message[];
  model: string;
  createdAt: Date;
  updatedAt: Date;
}

interface ChatControls {
  regenerate: boolean;
  setRegenerate: (regenerate: boolean) => void;
  regenerateWithModel: boolean;
  setRegenerateWithModel: (regenerateWithModel: boolean) => void;
  selectedModel: string;
  setSelectedModel: (selectedModel: string) => void;
  copyToClipboard: boolean;
  setCopyToClipboard: (copyToClipboard: boolean) => void;
}

/**
 * Interface defining the chat store's state and actions
 */
interface ChatStore {
  chats: Chat[];
  createChat: (name: string, messages?: Message[], model?: string) => string;
  updateChat: (chatId: string, messages: Message[], model?: string) => void;
  deleteChat: (chatId: string) => void;
  getChat: (chatId: string) => Chat | undefined;
  getAllChats: () => Chat[];
  chatControls: ChatControls;
}

export const useChat = create<ChatStore>()(
  persist(
    (set, get) => ({
      chats: [],

      createChat: (name, messages = [], model = "OpenAI: GPT-4o-mini") => {
        const chatId = crypto.randomUUID();
        const newChat: Chat = {
          id: chatId,
          name,
          messages,
          model,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        set((state) => ({
          chats: [...state.chats, newChat],
        }));

        return chatId;
      },

      updateChat: (chatId, messages, model) => {
        set((state) => ({
          chats: state.chats.map((chat) =>
            chat.id === chatId
              ? {
                  ...chat,
                  messages,
                  model: model || chat.model,
                  updatedAt: new Date(),
                }
              : chat
          ),
        }));
      },

      deleteChat: (chatId) => {
        set((state) => ({
          chats: state.chats.filter((chat) => chat.id !== chatId),
        }));
      },

      getChat: (chatId: string) => {
        const { chats } = get();
        return chats.find((chat) => chat.id === chatId);
      },

      getAllChats: () => get().chats,
      chatControls: {
        regenerate: false,
        setRegenerate: (regenerate: boolean) =>
          set((state) => ({
            chatControls: { ...state.chatControls, regenerate },
          })),
        regenerateWithModel: false,
        setRegenerateWithModel: (regenerateWithModel: boolean) =>
          set((state) => ({
            chatControls: { ...state.chatControls, regenerateWithModel },
          })),
        selectedModel: "OpenAI: GPT-4o-mini",
        setSelectedModel: (selectedModel: string) =>
          set((state) => ({
            chatControls: { ...state.chatControls, selectedModel },
          })),
        copyToClipboard: false,
        setCopyToClipboard: (copyToClipboard: boolean) =>
          set((state) => ({
            chatControls: { ...state.chatControls, copyToClipboard },
          })),
      },
    }),
    {
      name: "chat-storage",
      storage: createJSONStorage(() => localStorage),
      //   partialize: (state) => ({
      //     ...state,
      //     chats: state.chats.map((chat) => ({
      //       ...chat,
      //       createdAt: chat.createdAt?.toISOString(),
      //       updatedAt: chat.updatedAt?.toISOString(),
      //     })),
      //   }),
    }
  )
);
