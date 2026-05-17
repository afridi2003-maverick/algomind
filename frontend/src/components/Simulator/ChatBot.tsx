"use client";
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { MessageCircle, Send, X, Minimize2, Maximize2, Bot, User, Loader2 } from 'lucide-react';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatBotProps {
  algorithm: string;
  graphSize: number;
  currentStep: any;
}

export default function ChatBot({ algorithm, graphSize, currentStep }: ChatBotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'assistant', content: `Hi! 👋 I'm AlgoMind, your AI tutor. I can help you understand **${algorithm}** and other graph algorithms. Ask me anything!` }
  ]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Update welcome message when algorithm changes
  useEffect(() => {
    setMessages([
      { role: 'assistant', content: `Hi! 👋 I'm AlgoMind, your AI tutor. I can help you understand **${algorithm}** and other graph algorithms. Ask me anything!` }
    ]);
  }, [algorithm]);

  const handleSend = useCallback(async () => {
    if (!input.trim() || isStreaming) return;
    
    const userMessage = input.trim();
    setInput('');
    
    const updatedMessages = [...messages, { role: 'user' as const, content: userMessage }];
    setMessages(updatedMessages);
    setIsStreaming(true);

    try {
      const context = {
        algorithm,
        graph_size: graphSize,
        current_step: currentStep ? {
          action: currentStep.action,
          node: currentStep.node,
          step_number: currentStep.step_number,
          message: currentStep.message
        } : 'Not running',
        progress: 'In simulation'
      };

      const response = await fetch('http://127.0.0.1:8000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedMessages.slice(-10).map(m => ({
            role: m.role,
            content: m.content
          })),
          context
        })
      });

      if (!response.ok) {
        throw new Error('Chat request failed');
      }

      // Stream the response
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantMessage = '';

      setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          const chunk = decoder.decode(value, { stream: true });
          assistantMessage += chunk;
          
          setMessages(prev => {
            const updated = [...prev];
            updated[updated.length - 1] = { role: 'assistant', content: assistantMessage };
            return updated;
          });
        }
      }
    } catch (err) {
      console.error('Chat error:', err);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "I'm having trouble connecting right now. Make sure the backend is running and the ANTHROPIC_API_KEY environment variable is set. In the meantime, I can explain that **" + algorithm + "** is a fascinating algorithm! Try re-sending your question."
      }]);
    } finally {
      setIsStreaming(false);
    }
  }, [input, messages, isStreaming, algorithm, graphSize, currentStep]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-gradient-to-br from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 rounded-full shadow-2xl shadow-teal-500/30 flex items-center justify-center transition-all hover:scale-110 cursor-pointer group"
      >
        <MessageCircle size={24} className="text-white group-hover:rotate-12 transition-transform" />
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full animate-pulse"></span>
      </button>
    );
  }

  return (
    <div className={`fixed z-50 shadow-2xl shadow-black/50 transition-all duration-300 ${
      isMinimized 
        ? 'bottom-6 right-6 w-72 h-14' 
        : 'bottom-6 right-6 w-[380px] h-[520px]'
    }`}>
      <div className="flex flex-col h-full bg-gray-950 border border-gray-800 rounded-2xl overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-gray-900 to-gray-950 border-b border-gray-800 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-teal-500/20 rounded-full flex items-center justify-center">
              <Bot size={16} className="text-teal-400" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-gray-100">AlgoMind Tutor</h4>
              <span className="text-[10px] text-gray-500">{algorithm} mode</span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button 
              onClick={() => setIsMinimized(!isMinimized)} 
              className="p-1.5 text-gray-500 hover:text-white transition-colors rounded cursor-pointer"
            >
              {isMinimized ? <Maximize2 size={14} /> : <Minimize2 size={14} />}
            </button>
            <button 
              onClick={() => setIsOpen(false)} 
              className="p-1.5 text-gray-500 hover:text-red-400 transition-colors rounded cursor-pointer"
            >
              <X size={14} />
            </button>
          </div>
        </div>

        {!isMinimized && (
          <>
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
              {messages.map((msg, i) => (
                <div key={i} className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {msg.role === 'assistant' && (
                    <div className="w-7 h-7 rounded-full bg-teal-500/15 flex items-center justify-center shrink-0 mt-0.5">
                      <Bot size={14} className="text-teal-400" />
                    </div>
                  )}
                  <div className={`max-w-[80%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-teal-500/15 border border-teal-500/20 text-teal-100 rounded-br-md'
                      : 'bg-gray-900/60 border border-gray-800/60 text-gray-200 rounded-bl-md'
                  }`}>
                    {msg.content || (isStreaming && i === messages.length - 1 && (
                      <Loader2 size={14} className="animate-spin text-gray-500" />
                    ))}
                  </div>
                  {msg.role === 'user' && (
                    <div className="w-7 h-7 rounded-full bg-indigo-500/15 flex items-center justify-center shrink-0 mt-0.5">
                      <User size={14} className="text-indigo-400" />
                    </div>
                  )}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-3 border-t border-gray-800 shrink-0">
              <div className="flex items-center gap-2 bg-gray-900/80 border border-gray-800 rounded-xl px-3 py-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask about this algorithm..."
                  className="flex-1 bg-transparent text-sm text-gray-200 placeholder-gray-600 outline-none"
                  disabled={isStreaming}
                />
                <button
                  onClick={handleSend}
                  disabled={isStreaming || !input.trim()}
                  className="p-2 bg-teal-500/20 hover:bg-teal-500/30 rounded-lg text-teal-400 transition-all disabled:opacity-30 cursor-pointer"
                >
                  <Send size={14} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
