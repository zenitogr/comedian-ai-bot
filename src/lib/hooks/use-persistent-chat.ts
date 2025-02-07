import { useEffect, useCallback, useState, useRef } from 'react';
import { soundPlayer } from '@/lib/sounds';
import type { PersonaKey } from '@/lib/personas';

const STORAGE_KEY = 'cyberchat-history';
const PERSONA_KEY = 'cyberchat-persona';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

const getStoredPersona = (): PersonaKey => {
  if (typeof window === 'undefined') return 'default';
  return (localStorage.getItem(PERSONA_KEY) as PersonaKey) || 'default';
};

export function usePersistentChat() {
  const [mounted, setMounted] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  
  // Load data after mount
  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          setMessages(JSON.parse(stored));
        }
      } catch (error) {
        console.error('Error loading chat history:', error);
      }
    }
  }, []);

  // Only save after mount
  useEffect(() => {
    if (mounted) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
      } catch (error) {
        console.error('Error saving chat history:', error);
      }
    }
  }, [messages, mounted]);

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
    changePersona
  };
} 