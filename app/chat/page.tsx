"use client";

import React from "react";
import { useState, useRef, useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  Send,
  Bot,
  User,
  Sparkles,
  Code,
  FileText,
  Bug,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { useEnvironment } from "@/lib/environment-context";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const suggestedPrompts = [
  {
    icon: Code,
    label: "Generate test cases",
    prompt: "Generate test cases for the login functionality",
  },
  {
    icon: Bug,
    label: "Debug failing test",
    prompt: "Help me debug why my API endpoint test is failing",
  },
  {
    icon: FileText,
    label: "Write test documentation",
    prompt: "Write documentation for my test suite",
  },
  {
    icon: Sparkles,
    label: "Optimize test suite",
    prompt: "Suggest ways to optimize my test suite performance",
  },
];

export default function ChatPage() {
  const { selectedEnv, currentEnvironmentConfig } = useEnvironment();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content:
        "Hello! I'm your AI testing assistant. I can help you generate test cases, debug failing tests, write documentation, and optimize your test suite. How can I assist you today?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const isEnvConfigured = currentEnvironmentConfig?.isConfigured ?? false;

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (message: string) => {
    if (!message.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: message,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // Real backend call to /api/chat
    try {
      if (!currentEnvironmentConfig || !isEnvConfigured) {
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: `Environment "${selectedEnv}" is not configured. Please go to Settings and configure it first.`,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorMessage]);
        setIsLoading(false);
        return;
      }

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message,
          environment: selectedEnv,
          config: {
            auth: currentEnvironmentConfig.auth,
            endpoint: currentEnvironmentConfig.endpoint,
            unix: currentEnvironmentConfig.unix,
          },
        }),
      });

      const data = await res.json();

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.reply ?? "No response from backend",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Error connecting to backend. Please try again.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSend(input);
  };

  return (
    <DashboardLayout>
      <div className="-m-6 flex h-[calc(100vh-4rem)] flex-col">
        <div className="border-b border-border p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Bot className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-semibold">AI Testing Assistant</h1>
              <p className="text-sm text-muted-foreground">
                Powered by Autonation AI
              </p>
            </div>
            <Badge variant={isEnvConfigured ? "secondary" : "destructive"} className="ml-auto">
              {isEnvConfigured ? `${selectedEnv} Connected` : `${selectedEnv} Not Configured`}
            </Badge>
          </div>
        </div>

        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          <div className="mx-auto max-w-3xl space-y-6">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {message.role === "assistant" && (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <Bot className="h-4 w-4 text-primary" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-lg px-4 py-3 ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-card border border-border"
                  }`}
                >
                  <p className="whitespace-pre-wrap text-sm">{message.content}</p>
                  <p
                    className={`mt-2 text-xs ${
                      message.role === "user"
                        ? "text-primary-foreground/70"
                        : "text-muted-foreground"
                    }`}
                  >
                    {message.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                {message.role === "user" && (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-secondary">
                    <User className="h-4 w-4 text-secondary-foreground" />
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <Bot className="h-4 w-4 text-primary" />
                </div>
                <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-3">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  <span className="text-sm text-muted-foreground">Thinking...</span>
                </div>
              </div>
            )}

            {messages.length === 1 && (
              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                {suggestedPrompts.map((prompt) => (
                  <Card
                    key={prompt.label}
                    className="cursor-pointer p-4 transition-colors hover:bg-secondary/50"
                    onClick={() => handleSend(prompt.prompt)}
                  >
                    <div className="flex items-center gap-3">
                      <prompt.icon className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium text-sm">{prompt.label}</p>
                        <p className="text-xs text-muted-foreground line-clamp-1">
                          {prompt.prompt}
                        </p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="border-t border-border p-4">
          <form
            onSubmit={handleSubmit}
            className="mx-auto flex max-w-3xl gap-3"
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything about testing..."
              className="flex-1"
              disabled={isLoading}
            />
            <Button type="submit" disabled={isLoading || !input.trim()}>
              <Send className="h-4 w-4" />
              <span className="sr-only">Send message</span>
            </Button>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}
