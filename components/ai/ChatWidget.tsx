"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  MessageSquare, X, Send, Sparkles, Bot, User,
  Loader2, ChevronUp, ChevronDown, Zap
} from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export function ChatWidget() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [isMinimized, setIsMinimized] = React.useState(false);
  const [messages, setMessages] = React.useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Hi! I'm Meridian AI, your intelligent assistant. I can help you with:\n\n• Understanding your usage and costs\n• Managing API keys and billing\n• Navigating the platform\n• Answering questions about Meridian\n\nHow can I help you today?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage.content }),
      });

      if (response.ok) {
        const data = await response.json();
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: data.message,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, assistantMessage]);
      } else {
        throw new Error("Failed to get response");
      }
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Sorry, I encountered an error. Please try again.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Floating Button */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-6 right-6 z-50"
      >
        <div className="relative">
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-meridian-burgundy to-meridian-burgundy-bright rounded-full blur-lg opacity-50"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <Button
            onClick={() => setIsOpen(!isOpen)}
            size="lg"
            className="relative rounded-full w-16 h-16 shadow-2xl bg-gradient-to-r from-meridian-burgundy to-meridian-burgundy-bright hover:from-meridian-burgundy-light hover:to-meridian-burgundy border-2 border-white/20"
          >
            {isOpen ? (
              <X className="w-7 h-7 text-white" />
            ) : (
              <div className="relative">
                <MessageSquare className="w-7 h-7 text-white" />
                <motion.div
                  className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
              </div>
            )}
          </Button>
        </div>
      </motion.div>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed bottom-24 right-6 z-50 w-[400px] max-w-[calc(100vw-3rem)]"
          >
            <Card className="shadow-2xl overflow-hidden border-2 border-meridian-border/50 bg-gradient-to-br from-meridian-bg-card to-meridian-bg-elevation">
              {/* Header */}
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-meridian-burgundy/10 to-meridian-burgundy-bright/10 border-b border-meridian-border">
                <div className="flex items-center gap-3">
                  <motion.div
                    className="w-12 h-12 rounded-full bg-gradient-to-br from-meridian-burgundy to-meridian-burgundy-bright flex items-center justify-center shadow-lg"
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                  >
                    <Bot className="w-6 h-6 text-white" />
                  </motion.div>
                  <div>
                    <h3 className="font-bold text-meridian-text-primary text-lg">Meridian AI</h3>
                    <p className="text-xs text-meridian-text-muted flex items-center gap-1">
                      <motion.span
                        className="w-2 h-2 rounded-full bg-green-400"
                        animate={{ opacity: [1, 0.5, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      />
                      Online & Ready
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => setIsMinimized(!isMinimized)}
                    className="text-meridian-text-muted hover:text-meridian-text-primary"
                  >
                    {isMinimized ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => setIsOpen(false)}
                    className="text-meridian-text-muted hover:text-meridian-text-primary"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Messages */}
              {!isMinimized && (
                <>
                  <ScrollArea className="h-96 p-4 bg-gradient-to-b from-meridian-bg-card/50 to-meridian-bg-elevation/50" ref={scrollRef}>
                    <div className="space-y-4">
                      {messages.map((message) => (
                        <motion.div
                          key={message.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={cn(
                            "flex gap-3",
                            message.role === "user" ? "justify-end" : "justify-start"
                          )}
                        >
                          {message.role === "assistant" && (
                            <motion.div
                              className="w-10 h-10 rounded-full bg-gradient-to-br from-meridian-burgundy to-meridian-burgundy-bright flex items-center justify-center shrink-0 shadow-md"
                              whileHover={{ scale: 1.1 }}
                            >
                              <Bot className="w-5 h-5 text-white" />
                            </motion.div>
                          )}
                          <div
                            className={cn(
                              "max-w-[80%] rounded-2xl px-4 py-3 shadow-md",
                              message.role === "user"
                                ? "bg-gradient-to-r from-meridian-burgundy to-meridian-burgundy-bright text-white"
                                : "bg-meridian-bg-hover border border-meridian-border text-meridian-text-primary"
                            )}
                          >
                            <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
                            <p className="text-xs mt-2 opacity-60">
                              {message.timestamp.toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                          </div>
                          {message.role === "user" && (
                            <motion.div
                              className="w-10 h-10 rounded-full bg-meridian-bg-hover flex items-center justify-center shrink-0 border border-meridian-border"
                              whileHover={{ scale: 1.1 }}
                            >
                              <User className="w-5 h-5 text-meridian-text-muted" />
                            </motion.div>
                          )}
                        </motion.div>
                      ))}
                      {isLoading && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex gap-3 justify-start"
                        >
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-meridian-burgundy to-meridian-burgundy-bright flex items-center justify-center shrink-0 shadow-md">
                            <Bot className="w-5 h-5 text-white" />
                          </div>
                          <div className="bg-meridian-bg-hover border border-meridian-border rounded-2xl px-4 py-3">
                            <div className="flex gap-1">
                              <motion.div
                                className="w-2 h-2 bg-meridian-burgundy rounded-full"
                                animate={{ y: [0, -8, 0] }}
                                transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                              />
                              <motion.div
                                className="w-2 h-2 bg-meridian-burgundy rounded-full"
                                animate={{ y: [0, -8, 0] }}
                                transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                              />
                              <motion.div
                                className="w-2 h-2 bg-meridian-burgundy rounded-full"
                                animate={{ y: [0, -8, 0] }}
                                transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                              />
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </div>
                  </ScrollArea>

                  {/* Input */}
                  <div className="p-4 border-t border-meridian-border bg-meridian-bg-card">
                    <div className="flex gap-2">
                      <Input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Ask me anything about Meridian..."
                        className="flex-1 bg-meridian-bg-hover border-meridian-border focus:border-meridian-burgundy/50"
                        disabled={isLoading}
                      />
                      <Button
                        onClick={handleSend}
                        disabled={!input.trim() || isLoading}
                        size="icon"
                        className="bg-gradient-to-r from-meridian-burgundy to-meridian-burgundy-bright hover:from-meridian-burgundy-light hover:to-meridian-burgundy shadow-md"
                      >
                        {isLoading ? (
                          <Loader2 className="w-4 h-4 animate-spin text-white" />
                        ) : (
                          <Send className="w-4 h-4 text-white" />
                        )}
                      </Button>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-xs text-meridian-text-muted flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-meridian-burgundy" />
                        Powered by AI
                      </p>
 <p className="text-xs text-meridian-text-muted flex items-center gap-1">
                        <Zap className="w-3 h-3 text-green-500" />
                        Fast & Smart
                      </p>
                    </div>
                  </div>
                </>
              )}
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
