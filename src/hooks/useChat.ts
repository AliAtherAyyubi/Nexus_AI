"use client";
import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { Message, Conversation } from "@/types";

export function useChat() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingHistory, setIsFetchingHistory] = useState(true);
  const [activePdfUri, setActivePdfUri] = useState<string | null>(null);
  const router = useRouter();

  type ConversationResponse = {
    id: string;
    title: string;
    messages?: { content: string }[];
    updated_at: string;
  };

  // ── Load all conversations from Supabase on mount ──
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const res = await fetch("/api/conversations");

        if (res.status === 401) {
          router.push("/login");
          return;
        }

        const data = await res.json();

        if (!Array.isArray(data)) {
          console.error("Conversations API returned:", data);
          return;
        }

        const mapped: Conversation[] = (data as ConversationResponse[]).map((c) => ({
          id: c.id,
          title: c.title ?? "Untitled",
          lastMessage: c.messages?.at(-1)?.content ?? "",
          timestamp: new Date(c.updated_at ?? Date.now()),
          messageCount: c.messages?.length ?? 0,
          pinned: false,
        }));

        setConversations(mapped);
      } catch (err) {
        console.error("Failed to load conversations", err);
      } finally {
        setIsFetchingHistory(false);
      }
    };

    fetchConversations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Select a conversation and load its messages ──
  const selectConversation = useCallback(async (id: string) => {
    if (id === activeConversationId) return;

    setActiveConversationId(id);
    setMessages([]);
    setActivePdfUri(null);
    setIsLoading(true);

    try {
      const res = await fetch(`/api/conversations/${id}/messages`);

      if (res.status === 401) {
        router.push("/login");
        return;
      }

      const data = await res.json();

      type MessageData = {
        id: string;
        role: "user" | "assistant";
        content: string;
        created_at: string;
      };

      const mapped: Message[] = data.map((m: MessageData) => ({
        id: m.id,
        role: m.role,
        content: m.content,
        timestamp: new Date(m.created_at),
        isStreaming: false,
      }));

      setMessages(mapped);
    } catch (err) {
      console.error("Failed to load messages", err);
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeConversationId]);

  // ── New conversation ──
  const newConversation = useCallback(() => {
    setActiveConversationId(null);
    setMessages([]);
    setActivePdfUri(null);
  }, []);

  // ── Delete conversation ──
  const deleteConversation = useCallback(async (id: string) => {
    try {
      await fetch(`/api/conversations/${id}`, { method: "DELETE" });
      setConversations((prev) => prev.filter((c) => c.id !== id));
      if (activeConversationId === id) {
        setActiveConversationId(null);
        setMessages([]);
      }
    } catch (err) {
      console.error("Failed to delete conversation", err);
    }
  }, [activeConversationId]);

  // ── Send message ──
  const sendMessage = useCallback(
    async (content: string, pdfUri?: string, model?: string) => {
      if (!content.trim() || isLoading) return;

      // Store new PDF URI if provided
      if (pdfUri) setActivePdfUri(pdfUri);
      const effectivePdfUri = pdfUri ?? activePdfUri;

      setIsLoading(true);
      let convId = activeConversationId;

      // 1. Create conversation in DB if none active
      if (!convId) {
        try {
          // ✅ FIXED — only send title, nothing else
          const title =
            content.trim().length > 0
              ? content.trim().slice(0, 40) + (content.trim().length > 40 ? "…" : "")
              : "New conversation";

          const res = await fetch("/api/conversations", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title }), // ✅ only title here
          });

          if (res.status === 401) {
            router.push("/login");
            setIsLoading(false);
            return;
          }

          const newConv = await res.json();

          if (!newConv?.id) {
            console.error("Conversation creation failed:", JSON.stringify(newConv));
            setIsLoading(false);
            return;
          }

          convId = newConv.id;
          setActiveConversationId(convId);

          const mapped: Conversation = {
            id: newConv.id,
            title: newConv.title ?? title,
            lastMessage: content,
            timestamp: new Date(newConv.updated_at ?? Date.now()),
            messageCount: 0,
            pinned: false,
          };
          setConversations((prev) => [mapped, ...prev]);
        } catch (err) {
          console.error("Failed to create conversation", err);
          setIsLoading(false);
          return;
        }
      }

      // Guard — should never happen but safety net
      if (!convId) {
        console.error("No conversation ID — aborting");
        setIsLoading(false);
        return;
      }

      // 2. Add user message to UI
      const userMessage: Message = {
        id: crypto.randomUUID(),
        role: "user",
        content,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, userMessage]);

      // 3. Save user message to DB
      await fetch(`/api/conversations/${convId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: "user", content }),
      });

      // 4. Add empty streaming bubble
      const assistantId = crypto.randomUUID();
      setMessages((prev) => [
        ...prev,
        {
          id: assistantId,
          role: "assistant",
          content: "",
          timestamp: new Date(),
          isStreaming: true,
        },
      ]);

      // 5. Stream Gemini response
      let fullResponse = "";

      try {
        const res = await fetch("/api/gemini", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt: content,
            conversationId: convId,
            pdfUri: effectivePdfUri ?? null,
            model: model ?? "gemini-3.5-flash-lite",
          }),
        });

        if (!res.ok || !res.body) throw new Error("Stream failed");

        const reader = res.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          fullResponse += chunk;

          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId
                ? { ...m, content: m.content + chunk, isStreaming: true }
                : m
            )
          );
        }

        // 6. Mark streaming done
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId ? { ...m, isStreaming: false } : m
          )
        );

        // 7. Save assistant response to DB
        await fetch(`/api/conversations/${convId}/messages`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ role: "assistant", content: fullResponse }),
        });

        // 8. Update sidebar preview
        setConversations((prev) =>
          prev.map((c) =>
            c.id === convId
              ? {
                  ...c,
                  lastMessage: fullResponse.slice(0, 60),
                  timestamp: new Date(),
                  messageCount: c.messageCount + 2,
                }
              : c
          )
        );
      } catch (err) {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId
              ? { ...m, content: "Failed to connect to Nexus.", isStreaming: false }
              : m
          )
        );
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading, activeConversationId, activePdfUri]
  );

  const setPdfUri = useCallback((uri: string) => {
    setActivePdfUri(uri);
  }, []);

  // Edit a user message and resend
const editMessage = useCallback(async (messageId: string, newContent: string) => {
  // Find the message index
  const msgIndex = messages.findIndex((m) => m.id === messageId);
  if (msgIndex === -1) return;

  // Keep messages up to and including the edited one, remove everything after
  const trimmedMessages = messages.slice(0, msgIndex);

  setMessages(trimmedMessages);

  // Resend as new message
  await sendMessage(newContent, activePdfUri ?? undefined);
}, [messages, sendMessage, activePdfUri]);

// Regenerate the AI response after a user message
const regenerateMessage = useCallback(async (messageId: string) => {
  const msgIndex = messages.findIndex((m) => m.id === messageId);
  if (msgIndex === -1) return;

  // Find the user message — if clicked on AI message, go back one
  const isAI = messages[msgIndex].role === "assistant";
  const userMsgIndex = isAI ? msgIndex - 1 : msgIndex;
  if (userMsgIndex < 0) return;

  const userMessage = messages[userMsgIndex];

  // Remove the AI response (everything after the user message)
  const trimmedMessages = messages.slice(0, userMsgIndex + 1);
  setMessages(trimmedMessages);

  // Re-trigger Gemini with the same user message
  await sendMessage(userMessage.content, activePdfUri ?? undefined);
}, [messages, sendMessage, activePdfUri]);
  return {
    conversations,
    activeConversationId,
    messages,
    isLoading,
    isFetchingHistory,
    activePdfUri,
    selectConversation,
    newConversation,
    sendMessage,
    deleteConversation,
    setPdfUri,
    editMessage,
    regenerateMessage,
  };
}