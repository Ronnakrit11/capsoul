"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { MessageCircle, X, Loader2, Send } from 'lucide-react';
import { faqResponses } from '@/lib/faq';
import { motion, AnimatePresence } from 'motion/react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    const faqAnswer = faqResponses[userMessage as keyof typeof faqResponses];
    
    if (faqAnswer) {
      setMessages(prev => [...prev, { role: 'assistant', content: faqAnswer }]);
      setIsLoading(false);
      return;
    }

    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: userMessage }),
        signal: abortControllerRef.current.signal
      });

      if (!response.ok) {
        throw new Error(response.statusText);
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
    } catch (error) {
      const errorMessage = error instanceof Error && error.name === 'AbortError' 
        ? 'Request was cancelled. Please try again.'
        : 'Sorry, I encountered an error. Please try again.';
      
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: errorMessage
      }]);
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  const handleFaqClick = (question: string) => {
    setMessages(prev => [
      ...prev,
      { role: 'user', content: question },
      { role: 'assistant', content: faqResponses[question as keyof typeof faqResponses] }
    ]);
  };

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-black text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all z-50 flex items-center gap-2"
      >
        <MessageCircle className="w-6 h-6" />
        <span className="text-sm font-medium hidden md:inline">ต้องการความช่วยเหลือ?</span>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-24 right-6 w-[340px] md:w-[400px] bg-white rounded-2xl shadow-2xl z-50 border border-gray-100 overflow-hidden"
          >
            <div className="flex items-center justify-between p-4 border-b bg-black text-white rounded-t-2xl">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5" />
                <h3 className="font-semibold">Capsoul Assistant</h3>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white/80 hover:text-white transition-colors rounded-full p-1 hover:bg-white/10"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="h-[400px] overflow-y-auto p-4 space-y-4 bg-gray-50">
              <div className="bg-white p-4 rounded-xl space-y-2 shadow-sm">
                <p className="text-sm text-gray-600 font-medium">คำถามที่พบบ่อย:</p>
                <div className="space-y-1">
                  {Object.keys(faqResponses).map((question) => (
                    <button
                      key={question}
                      onClick={() => handleFaqClick(question)}
                      className="w-full text-left p-2.5 text-sm rounded-lg hover:bg-gray-50 transition-colors text-gray-700 hover:text-black"
                    >
                      {question}
                    </button>
                  ))}
                </div>
              </div>

              {messages.map((message, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl p-3.5 shadow-sm ${
                      message.role === 'user'
                        ? 'bg-black text-white'
                        : 'bg-white text-gray-800'
                    }`}
                  >
                    {message.content}
                  </div>
                </motion.div>
              ))}
              
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white rounded-2xl p-3 shadow-sm">
                    <Loader2 className="h-5 w-5 animate-spin text-gray-500" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSubmit} className="p-4 border-t bg-white">
              <div className="flex gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="พิมพ์ข้อความของคุณ..."
                  className="flex-1 bg-gray-50 border-0 focus-visible:ring-1 focus-visible:ring-black"
                />
                <Button 
                  type="submit" 
                  disabled={isLoading}
                  className="bg-black hover:bg-gray-800 text-white shadow-none"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}