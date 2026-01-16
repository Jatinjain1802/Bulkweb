import React, { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import ChatWindow from "./ChatWindow";
import RightPanel from "./RightPanel";
import ConfirmationModal from "../../components/ConfirmationModal";
import toast, { Toaster } from "react-hot-toast";

const Chat = () => {
  const [conversations, setConversations] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [showRightPanel, setShowRightPanel] = useState(false);

  // Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [phonesToDelete, setPhonesToDelete] = useState([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteCallback, setDeleteCallback] = useState(null);

  // Fetch Conversations
  useEffect(() => {
    fetchConversations();
    const interval = setInterval(fetchConversations, 10000);
    return () => clearInterval(interval);
  }, []);

  // Fetch Messages when chat is active
  useEffect(() => {
    if (activeChat) {
      fetchMessages(activeChat.phoneNumber);
      markAsRead(activeChat.phoneNumber);
      const interval = setInterval(() => fetchMessages(activeChat.phoneNumber), 3000);
      return () => clearInterval(interval);
    }
  }, [activeChat]);

  const markAsRead = async (phoneNumber) => {
    try {
      await fetch(`http://localhost:5000/api/chat/read/${phoneNumber}`, {
        method: "PUT",
      });
      // Refresh conversations to update the badges in sidebar
      fetchConversations();
    } catch (error) {
      console.error("Error marking as read:", error);
    }
  };

  const fetchConversations = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/chat/conversations");
      const data = await res.json();
      setConversations(data);
    } catch (error) {
      console.error("Error fetching conversations:", error);
    }
  };

  const fetchMessages = async (phoneNumber) => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/chat/messages/${phoneNumber}`
      );
      const data = await res.json();
      setMessages(data);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim() || !activeChat) return;

    try {
      // Optimistic UI Update
      const newMessage = {
        id: Date.now(),
        content: input,
        direction: "outbound",
        status: "sending", // Will update to sent/delivered via poll
        sent_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, newMessage]);
      setInput("");

      const payload = {
        phoneNumber: activeChat.phoneNumber,
        message: input,
      };

      await fetch("http://localhost:5000/api/chat/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      // Fetch immediately to ensure sync
      fetchMessages(activeChat.phoneNumber);
      fetchConversations(); // Update "last message" in sidebar
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
    }
  };

  const requestDeleteConversation = (phoneNumbers, onSuccess) => {
    setPhonesToDelete(phoneNumbers);
    setDeleteCallback(() => onSuccess);
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteConversation = async () => {
    if (!phonesToDelete.length) return;
    
    setIsDeleting(true);
    try {
      await fetch("http://localhost:5000/api/chat/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumbers: phonesToDelete }),
      });
      
      // If active chat is deleted, close it
      if (activeChat && phonesToDelete.includes(activeChat.phoneNumber)) {
        setActiveChat(null);
        setMessages([]);
      }
      
      await fetchConversations();
      toast.success("Deleted successfully");
      
      if (deleteCallback) {
        deleteCallback();
      }
    } catch (error) {
      console.error("Error deleting conversations:", error);
      toast.error("Failed to delete chat");
    } finally {
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
      setPhonesToDelete([]);
      setDeleteCallback(null);
    }
  };

  return (
    <div className="flex h-[calc(100vh-20px)] relative overflow-hidden font-sans"> 
      <Toaster position="top-right" />
      <ConfirmationModal 
         isOpen={isDeleteModalOpen}
         onClose={() => setIsDeleteModalOpen(false)}
         onConfirm={confirmDeleteConversation}
         title="Delete Chat?"
         message={`Are you sure you want to delete ${phonesToDelete.length > 1 ? 'these chats' : 'this chat'}? This action cannot be undone.`}
         isLoading={isDeleting}
      />

      {/* Green Header Strip */}
      <div className="absolute top-0 w-full h-32 z-0"></div>

      {/* Main App Window */}
      <div className="relative z-10 flex w-full h-full max-w-[1700px] mx-auto bg-[#f0f2f5] shadow-lg xl:rounded-lg xl:my-5 xl:h-[calc(100%-40px)] overflow-hidden">
        
        <Sidebar
          conversations={conversations}
          activeChat={activeChat}
          setActiveChat={setActiveChat}
          onDeleteConversation={requestDeleteConversation}
        />

        <ChatWindow
          activeChat={activeChat}
          messages={messages}
          input={input}
          setInput={setInput}
          onSend={handleSendMessage}
          onToggleRightPanel={() => setShowRightPanel(!showRightPanel)}
          onDeleteConversation={requestDeleteConversation}
        />

        {showRightPanel && activeChat && (
          <RightPanel 
            activeChat={activeChat} 
            onClose={() => setShowRightPanel(false)}
          />
        )}

      </div>
    </div>
  );
};

export default Chat;

