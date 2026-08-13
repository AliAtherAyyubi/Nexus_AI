"use client";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Moon, PanelLeftClose, PanelLeftOpen, Sun } from "lucide-react";
import Sidebar from "@/components/sidebar/Sidebar";
import ChatArea from "@/components/chat/ChatArea";
import { useChat } from "@/hooks/useChat";
import { useTheme } from "@/hooks/useTheme";

export default function ChatLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const {
  conversations,
  activeConversationId,
  messages,
  isLoading,
  selectConversation,
  newConversation,
  activePdfUri, 
  sendMessage,
  deleteConversation, 
  editMessage,
  regenerateMessage,
} = useChat();
const handlePdfUploaded = (uri: string, name: string) => {
  sendMessage("", uri); // stores URI in activePdfUri without sending a visible message
};
  const { theme, toggleTheme, mounted } = useTheme();
  return (
    <div
      className="flex h-screen overflow-hidden "
      style={{ background: "var(--color-bg)" }}
    >
      {/* Sidebar */}
      <Sidebar
  conversations={conversations}
  activeId={activeConversationId}
  onSelect={selectConversation}
  onDelete={deleteConversation} 
  onNew={newConversation}
  collapsed={sidebarCollapsed}
  onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
/>

      {/* Divider */}
      <div
        className="w-px  shrink-0"
        style={{ background: "var(--color-border)" }}
      />

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
       
        {/* toggle button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={toggleTheme}
          className="absolute top-4 right-4 z-10 p-1.5 rounded-lg transition-all cursor-pointer"
          style={{
            color: "var(--color-text)",
            background: "var(--color-overlay)",
            border: "1px solid var(--color-border-hover)",
          }}
        >
          <AnimatePresence mode="wait">
            {!mounted ? (
              <Sun size={15} />
            ) : theme === "dark" ? (
              <motion.div
                key="sun"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Sun size={15} />
              </motion.div>
            ) : (
              <motion.div
                key="moon"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Moon size={15} />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>

        {/*  */}
        <ChatArea
          messages={messages}
          isLoading={isLoading}
          onSend={sendMessage}
          onPdfUploaded={handlePdfUploaded}
          activePdfUri={activePdfUri}
          activeConversationId={activeConversationId}
          onEdit={editMessage}
          onRegenerate={regenerateMessage}
        />
      </div>
    </div>
  );
}
