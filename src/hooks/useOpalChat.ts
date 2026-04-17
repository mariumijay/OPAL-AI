"use client";

import { useState, useCallback } from "react";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { API_BASE_URL } from "@/lib/config";

export type Message = {
  id: string;
  role: "user" | "assistant";
  text: string;
  advisory?: string;
  source?: string;
  timestamp: Date;
};

export function useOpalChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const pathname = usePathname();
  const supabase = createClient();

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim()) return;

    const userMessage: Message = {
      id: Math.random().toString(36).substring(7),
      role: "user",
      text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;
      
      const role = user?.user_metadata?.role || "donor";
      const user_id = user?.id || "unauthenticated";

      // Gemini expects conversation history formatted correctly
      const conversation_history = messages.slice(-10).map((m) => ({
        role: m.role === "user" ? "user" : "model",
        parts: [{ text: m.text }],
      }));

      const apiEndpoint = `${API_BASE_URL}/api/chat/ask`;
      console.log(`[OPAL-AI-SYSTEM] Initiating transmission to: ${apiEndpoint}`);

      const response = await fetch(apiEndpoint, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({
          message: text,
          role,
          user_id,
          page_context: pathname,
          conversation_history,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[OPAL-AI-SYSTEM] Node Error (${response.status}):`, errorText);
        throw new Error(`Cloud Node Error: ${response.status}`);
      }

      const data = await response.json();
      console.log(`[OPAL-AI-SYSTEM] Transmission Received:`, data.source);

      const assistantMessage: Message = {
        id: Math.random().toString(36).substring(7),
        role: "assistant",
        text: data.reply,
        advisory: data.advisory,
        source: data.source,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);

    } catch (error: any) {
      console.error("[OPAL-AI-SYSTEM] Critical Hook Failure:", error);
      toast.error(error.message || "Chat service unavailable");
      
      const errorMessage: Message = {
        id: "err-" + Date.now(),
        role: "assistant",
        text: "I'm having trouble connecting to the network. Please check your connection or try again later.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [messages, pathname, supabase]);

  const clearChat = useCallback(() => {
    setMessages([]);
  }, []);

  return {
    messages,
    sendMessage,
    isLoading,
    clearChat,
  };
}
