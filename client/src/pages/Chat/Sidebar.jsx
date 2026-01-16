import { useState } from "react";
import { MessageSquareText, MoreVertical, Plus, Search, Trash2 } from "lucide-react";
import Avatar from "./Avatar";

const Sidebar = ({ conversations, activeChat, setActiveChat, onDeleteConversation }) => {
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedItems, setSelectedItems] = useState(new Set());

  const formatTime = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const filteredConversations = conversations.filter((c) => {
    // Search filter
    const matchesSearch = (c.contactName || c.phoneNumber || "")
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    // Tab filter
    if (activeTab === "unread") return c.unreadCount > 0;
    // Add 'groups' logic if data supports it
    return true;
  });

  const handleItemClick = (contact) => {
    if (selectionMode) {
      const newSelected = new Set(selectedItems);
      if (newSelected.has(contact.phoneNumber)) {
        newSelected.delete(contact.phoneNumber);
      } else {
        newSelected.add(contact.phoneNumber);
      }
      setSelectedItems(newSelected);
    } else {
      setActiveChat(contact);
    }
  };

  const handleDeleteSelected = () => {
    if (selectedItems.size === 0) return;
    onDeleteConversation(Array.from(selectedItems), () => {
      setSelectionMode(false);
      setSelectedItems(new Set());
    });
  };

  const toggleAll = () => {
     if (selectedItems.size === filteredConversations.length) {
         setSelectedItems(new Set());
     } else {
         const allPhones = new Set(filteredConversations.map(c => c.phoneNumber));
         setSelectedItems(allPhones);
     }
  }

  return (
    <div className="w-[400px] flex flex-col border-r border-[#d1d7db] bg-white h-full">
      {/* Header */}
      {!selectionMode ? (
        <div className="h-[60px] bg-[#f0f2f5] px-4 py-2.5 flex items-center justify-between shrink-0">
          <div className="cursor-pointer" title="My Profile">
            <Avatar size="md" />
          </div>
          {/* <div className="flex gap-4 text-[#54656f]">
             <button title="Select Chats" onClick={() => setSelectionMode(true)}>
                <MoreVertical className="w-5 h-5" /> 
             </button>
          </div> */}
        </div>
      ) : (
        <div className="h-[60px] bg-[#00a884] text-white px-4 py-2.5 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-4">
               <button onClick={() => { setSelectionMode(false); setSelectedItems(new Set()); }}>
                  <Plus className="w-6 h-6 rotate-45" />
               </button>
               <span className="font-medium text-[16px]">{selectedItems.size} selected</span>
            </div>
            <div className="flex gap-4">
                 <button onClick={handleDeleteSelected} title="Delete Selected">
                    <Trash2 className="w-5 h-5" />
                 </button>
            </div>
        </div>
      )}

      {/* Search & Filter - Hide in selection mode? WhatsApp Web keeps it usually, but disables interaction maybe. I'll keep it. */}
      {!selectionMode && (
      <div className="pl-3 pr-2 py-2 border-b border-[#e9edef] bg-white">
        <div className="bg-[#f0f2f5] rounded-lg px-3 py-1.5 flex items-center gap-4 mb-2">
          <Search className="w-4 h-4 text-[#54656f] shrink-0" />
          <input
            type="text"
            placeholder="Search or start new chat"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent border-none focus:outline-none focus:ring-0 w-full text-[14px] text-[#3b4a54] placeholder-[#54656f] px-0 h-6"
          />
        </div>
        <div className="flex gap-2 pb-1 text-[#54656f]">
          {["All", "Unread"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab.toLowerCase())}
              className={`px-3 py-1 rounded-full text-[13px] font-medium transition-colors ${
                activeTab === tab.toLowerCase()
                  ? "bg-[#00a884] text-white" 
                  : "bg-[#f0f2f5] hover:bg-[#e9edef]"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>
      )}

      {/* Contact List */}
      <div className="flex-1 overflow-y-auto bg-white custom-scrollbar">
        {filteredConversations.map((contact, index) => (
          <div
            key={index}
            onClick={() => handleItemClick(contact)}
            className={`flex items-center gap-3 px-3 py-3 cursor-pointer hover:bg-[#f5f6f6] border-b border-[#f0f2f5] group relative ${
              activeChat?.phoneNumber === contact.phoneNumber && !selectionMode
                ? "bg-[#f0f2f5]"
                : ""
            } ${selectionMode && selectedItems.has(contact.phoneNumber) ? "bg-[#f0f2f5]" : ""}`}
          >
            {selectionMode && (
                <div className="shrink-0 animate-in fade-in zoom-in duration-200">
                    <input 
                        type="checkbox" 
                        checked={selectedItems.has(contact.phoneNumber)} 
                        onChange={() => {}} // Handled by div click
                        className="w-4 h-4 accent-[#00a884] cursor-pointer"
                    />
                </div>
            )}
            
            <div className="shrink-0 relative">
              <Avatar src={contact.profilePic} size="lg" />
            </div>
            <div className="flex-1 min-w-0 flex flex-col justify-center h-full pt-1">
              <div className="flex justify-between items-center mb-0.5">
                <h4 className="text-[17px] text-[#111b21] font-normal leading-tight truncate">
                  {contact.contactName || contact.phoneNumber}
                </h4>
                <span
                  className={`text-[12px] ${
                    contact.unreadCount > 0
                      ? "text-[#00a884] font-medium"
                      : "text-[#667781]"
                  }`}
                >
                  {formatTime(contact.lastMessageTime)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-1 text-[#667781] text-[14px] truncate max-w-[90%]">
                  <p className="truncate block leading-5">
                    {contact.lastMessage}
                  </p>
                </div>
                {contact.unreadCount > 0 && (
                  <span className="bg-[#00a884] text-white text-[11px] font-medium h-5 min-w-[20px] px-1.5 rounded-full flex items-center justify-center shadow-sm">
                    {contact.unreadCount}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
