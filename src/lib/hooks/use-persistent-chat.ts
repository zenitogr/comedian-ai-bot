import { useEffect, useCallback, useState, useRef } from 'react';
import { soundPlayer } from '@/lib/sounds';
import type { PersonaKey } from '@/lib/personas';

const STORAGE_KEY = 'cyberchat-history';
const PERSONA_KEY = 'cyberchat-persona';
const ACTIVE_CHAT_KEY = 'cyberchat-active-chat';
const CHATS_LIST_KEY = 'cyberchat-chats';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface Chat {
  id: string;
  title: string;
  messages: Message[];
  createdAt: string;
  persona: PersonaKey;
}

const getStoredPersona = (): PersonaKey => {
  if (typeof window === 'undefined') return 'default';
  return (localStorage.getItem(PERSONA_KEY) as PersonaKey) || 'default';
};

export function usePersistentChat() {
  const [mounted, setMounted] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChat, setActiveChat] = useState<string | null>(null);
  
  // Load data after mount
  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined') {
      try {
        // Load chats list
        const storedChats = localStorage.getItem(CHATS_LIST_KEY);
        const parsedChats = storedChats ? JSON.parse(storedChats) : [];
        setChats(parsedChats);

        // Load active chat
        const storedActiveChat = localStorage.getItem(ACTIVE_CHAT_KEY);
        if (storedActiveChat) {
          setActiveChat(storedActiveChat);
          const activeMessages = parsedChats.find((c: Chat) => c.id === storedActiveChat)?.messages || [];
          setMessages(activeMessages);
        } else if (parsedChats.length > 0) {
          setActiveChat(parsedChats[0].id);
          setMessages(parsedChats[0].messages);
        }
      } catch (error) {
        console.error('Error loading chat data:', error);
      }
    }
  }, []);

  // Only save after mount
  useEffect(() => {
    if (mounted && activeChat) {
      try {
        // Don't update chats state if the messages are the same
        const currentChat = chats.find(chat => chat.id === activeChat);
        if (JSON.stringify(currentChat?.messages) === JSON.stringify(messages)) {
          return;
        }

        const updatedChats = chats.map(chat => 
          chat.id === activeChat ? { ...chat, messages } : chat
        );
        
        // Only update state if there's an actual change
        if (JSON.stringify(updatedChats) !== JSON.stringify(chats)) {
          setChats(updatedChats);
          localStorage.setItem(CHATS_LIST_KEY, JSON.stringify(updatedChats));
        }
      } catch (error) {
        console.error('Error saving chat history:', error);
      }
    }
  }, [messages, mounted, activeChat]);

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [currentPersona, setCurrentPersona] = useState<PersonaKey>(getStoredPersona);
  const initialLoadDone = useRef(false);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: input.trim() };
    console.log('💬 Adding user message:', userMessage);
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setError(null);
    soundPlayer.play('send');

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          persona: currentPersona
        }),
      });

      if (!response.ok) throw new Error('Failed to send message');
      
      if (!response.body) throw new Error('No response body');
      
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantMessage = '';

      // Read the streaming response
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value);
        assistantMessage += chunk;
        console.log('💬 Received chunk:', chunk);
        
        // Update messages with partial response
        setMessages(prev => {
          const newMessages = [...prev];
          console.log('💬 Current messages:', newMessages);
          // Update or add the assistant message
          if (newMessages[newMessages.length - 1]?.role === 'assistant') {
            newMessages[newMessages.length - 1].content = assistantMessage;
          } else {
            newMessages.push({ role: 'assistant', content: assistantMessage });
          }
          console.log('💬 Updated messages:', newMessages);
          return newMessages;
        });
      }

      soundPlayer.play('message');
    } catch (err) {
      console.error("🚨 Chat error:", err);
      soundPlayer.play('error');
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setIsLoading(false);
    }
  }, [input, messages, isLoading, currentPersona]);

  const clearHistory = useCallback(() => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(STORAGE_KEY);
    setMessages([]);
  }, []);

  const changePersona = useCallback((persona: PersonaKey) => {
    if (typeof window === 'undefined') return;
    setCurrentPersona(persona);
    localStorage.setItem(PERSONA_KEY, persona);
    soundPlayer.play('command');
  }, []);

  const createNewChat = useCallback(() => {
    const newChat: Chat = {
      id: Date.now().toString(),
      title: 'New Chat',
      messages: [],
      createdAt: new Date().toISOString(),
      persona: currentPersona,
    };

    setChats(prev => [newChat, ...prev]);
    setActiveChat(newChat.id);
    setMessages([]);
    localStorage.setItem(CHATS_LIST_KEY, JSON.stringify([newChat, ...chats]));
    localStorage.setItem(ACTIVE_CHAT_KEY, newChat.id);
    soundPlayer.play('command');
  }, [chats, currentPersona]);

  const switchChat = useCallback((chatId: string) => {
    const chat = chats.find(c => c.id === chatId);
    if (chat) {
      setActiveChat(chatId);
      setMessages(chat.messages);
      localStorage.setItem(ACTIVE_CHAT_KEY, chatId);
      soundPlayer.play('command');
    }
  }, [chats]);

  return {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    error,
    clearHistory,
    setInput,
    currentPersona,
    changePersona,
    chats,
    activeChat,
    createNewChat,
    switchChat,
  };
} 