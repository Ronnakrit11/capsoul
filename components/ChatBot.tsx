"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { MessageCircle, X, Loader2 } from 'lucide-react';
import { faqResponses } from '@/lib/faq';

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

    // Check if the question exists in FAQ
    const faqAnswer = faqResponses[userMessage as keyof typeof faqResponses];
    
    if (faqAnswer) {
      // If it's a FAQ, respond immediately
      setMessages(prev => [...prev, { role: 'assistant', content: faqAnswer }]);
      setIsLoading(false);
      return;
    }

    // If not a FAQ, proceed with API call
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
      console.error('Error:', error);
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
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 bg-darkColor text-white p-4 rounded-full shadow-lg hover:bg-darkColor/90 transition-all z-50"
      >
        <MessageCircle />
      </button>

      {isOpen && (
        <div className="fixed bottom-20 right-4 w-96 bg-white rounded-lg shadow-xl z-50 border">
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="font-semibold">Capsoul Assistant</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="h-96 overflow-y-auto p-4">
            <div className="space-y-4">
              {/* FAQ Buttons - Always visible */}
              <div className="space-y-2 mb-4 bg-gray-50 p-3 rounded-lg">
                <p className="text-sm text-gray-600 mb-2">คำถามที่พบบ่อย:</p>
                {Object.keys(faqResponses).map((question) => (
                  <button
                    key={question}
                    onClick={() => handleFaqClick(question)}
                    className="w-full text-left p-2 text-sm rounded-lg hover:bg-white transition-colors"
                  >
                    {question}
                  </button>
                ))}
              </div>

              {/* Chat Messages */}
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      message.role === 'user'
                        ? 'bg-darkColor text-white'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {message.content}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 rounded-lg p-3">
                    <Loader2 className="h-5 w-5 animate-spin" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-4 border-t">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                className="flex-1"
              />
              <Button type="submit" disabled={isLoading}>
                Send
              </Button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}