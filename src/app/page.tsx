"use client";

import { Message } from "@/components/message";
import { GlitchText } from "@/components/glitch-text";
import { useEffect, useLayoutEffect, useRef, useCallback, useState } from "react";
import { usePersistentChat } from "@/lib/hooks/use-persistent-chat";
import { createCommands } from "@/lib/commands";
import { MatrixRain } from "@/components/matrix-rain";
import { PersonaIndicator } from "@/components/persona-indicator";
import { SoundToggle } from "@/components/sound-toggle";
import { PersonaProvider } from "@/lib/persona-context";

// Create a safe version of useLayoutEffect that falls back to useEffect on server
const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

export default function Home() {
  const [mounted, setMounted] = useState(false);
  
  const { 
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
  } = usePersistentChat();

  console.debug('🔍 Current chat state:', {
    messageCount: messages.length,
    input,
    isLoading,
    currentPersona
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const commands = createCommands({ 
    clearHistory, 
    setInput,
    changePersona
  });

  // Info logs for normal operations
  console.info('ℹ️ Setting up keyboard shortcuts');
  console.info('📝 Form submitted with input:', input);
  console.info('🎮 Executing command:', input);
  console.info('💬 Submitting chat message');
  console.info('📜 Messages updated, count:', messages.length);

  // Warnings for potential issues
  console.warn('⚠️ No user message found to retry');
  console.warn('⚠️ Input disabled during loading state');

  // Handle keyboard shortcuts
  useEffect(() => {
    console.log('⌨️ Setting up keyboard shortcuts');
    const handleKeyPress = (e: KeyboardEvent) => {
      console.log('🎹 Key pressed:', e.key, {
        ctrl: e.ctrlKey,
        meta: e.metaKey
      });
      
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        console.log('⌨️ Focus shortcut triggered');
        e.preventDefault();
        const input = document.querySelector('input');
        input?.focus();
      }
      if (e.key === 'Escape') {
        console.log('⌨️ Blur shortcut triggered');
        const input = document.querySelector('input');
        input?.blur();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  // Handle commands
  const handleSubmitWithCommands = useCallback((e: React.FormEvent<HTMLFormElement>) => {
    console.log('📝 Form submitted with input:', input);
    e.preventDefault();
    
    const command = commands[input.trim()];
    if (command) {
      console.log('🎮 Executing command:', input);
      command.execute();
      setInput('');
    } else {
      console.log('💭 Submitting chat message');
      handleSubmit(e);
    }
  }, [commands, input, handleSubmit, setInput]);

  // Auto-scroll to bottom when new messages arrive
  useIsomorphicLayoutEffect(() => {
    console.log('📜 Scrolling to bottom, message count:', messages.length);
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleRetry = useCallback(() => {
    console.log('🔄 Retrying last message');
    const lastUserMessage = messages.findLast(m => m.role === "user");
    if (lastUserMessage) {
      console.log('🔄 Found last user message:', lastUserMessage);
      const fakeEvent = { preventDefault: () => {} } as React.FormEvent<HTMLFormElement>;
      handleSubmit(fakeEvent);
    } else {
      console.log('⚠️ No user message found to retry');
    }
  }, [messages, handleSubmit]);

  // Errors for actual problems
  useEffect(() => {
    if (error) {
      console.error('🚨 Error state updated:', {
        error: error instanceof Error ? {
          message: error.message,
          stack: error.stack
        } : error
      });
    }
  }, [error]);

  // Log when loading state changes
  useEffect(() => {
    console.log('⏳ Loading state changed:', isLoading);
  }, [isLoading]);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Show nothing until mounted
  if (!mounted) {
    return null;
  }

  return (
    <PersonaProvider value={{
      currentPersona,
      changePersona
    }}>
      <MatrixRain />
      <div className="scanline" />
      <div className="flex flex-col h-screen max-w-4xl mx-auto p-4">
        <div className="flex justify-between items-center mb-4">
          <GlitchText 
            text="CyberChat AI"
            className="text-4xl font-bold text-neon-pink"
          />
          <div className="flex items-center gap-4">
            <PersonaIndicator persona={currentPersona} />
            <SoundToggle />
            <button
              onClick={clearHistory}
              className="text-xs text-neon-blue hover:text-neon-pink transition-colors"
            >
              Clear History
            </button>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto space-y-4 p-4 bg-chat-bubble/10 rounded-lg">
          {messages.map((message, i) => {
            console.log('Rendering message:', message);
            return (
              <div
                key={i}
                className="message-container animate-fade-in"
                style={{ 
                  animationDelay: `${i * 100}ms`,
                  opacity: 1,
                  animation: 'fadeIn 0.5s ease forwards'
                }}
              >
                <Message 
                  role={message.role} 
                  content={message.content} 
                />
              </div>
            );
          })}
          {isLoading && (
            <Message role="assistant" content="" isLoading />
          )}
          {error && (
            <div className="text-neon-pink text-sm p-4 rounded-lg bg-chat-bubble/50">
              <div className="flex items-start gap-2">
                <span className="text-xl">⚠️</span>
                <div>
                  <p className="font-bold">Error</p>
                  <p>{error instanceof Error ? error.message : 'An unexpected error occurred'}</p>
                  {process.env.NODE_ENV === 'development' && (
                    <pre className="mt-2 text-xs opacity-75 overflow-x-auto">
                      {JSON.stringify(error, null, 2)}
                    </pre>
                  )}
                </div>
              </div>
              <button
                onClick={handleRetry}
                className="mt-2 px-3 py-1 text-xs bg-neon-pink/10 hover:bg-neon-pink/20 rounded-md transition-colors"
              >
                Retry
              </button>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <form 
          onSubmit={handleSubmitWithCommands} 
          className="flex gap-2 relative"
        >
          <div className="absolute -top-6 right-0 text-xs text-neon-blue">
            {isLoading ? "AI is thinking..." : "Press Ctrl+K to focus"}
          </div>
          <input
            value={input}
            onChange={handleInputChange}
            placeholder="Type a message or command (/help)"
            className="flex-1 rounded-lg bg-chat-bubble p-2 text-foreground border border-neon-purple focus:outline-none focus:ring-2 focus:ring-neon-pink transition-all"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="px-4 py-2 rounded-lg bg-neon-pink text-background hover:shadow-neon transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </form>
      </div>
    </PersonaProvider>
  );
}
