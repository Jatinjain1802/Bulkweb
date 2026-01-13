import React, { useState, useEffect, useRef } from 'react';
import { 
  MoreVertical, 
  Search, 
  Smile, 
  Paperclip, 
  Mic, 
  CheckCheck,
  Plus,
  MessageSquareText,
  X,
  Tag,
  StickyNote,
  Clock,
  FileText,
  Send,
  User,
  ChevronLeft
} from 'lucide-react';

const Chat = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [showRightPanel, setShowRightPanel] = useState(true);
  const [conversations, setConversations] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const messagesEndRef = useRef(null);
  
  // Custom Default Avatar Component for "Proper" Look
  const DefaultAvatar = ({ className }) => (
    <div className={`bg-[#DFE5E7] flex items-end justify-center overflow-hidden ${className}`}>
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-[80%] h-[80%] text-[#FFFFFF] mb-[-10%]">
        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
      </svg>
    </div>
  );

  // Fetch Conversations
  useEffect(() => {
    fetchConversations();
    const interval = setInterval(fetchConversations, 10000);
    return () => clearInterval(interval);
  }, []);

  // Fetch Messages
  useEffect(() => {
    if (activeChat) {
      fetchMessages(activeChat.phoneNumber);
      const interval = setInterval(() => fetchMessages(activeChat.phoneNumber), 5000);
      return () => clearInterval(interval);
    }
  }, [activeChat]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
  }, [messages]);

  const fetchConversations = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/chat/conversations');
      const data = await res.json();
      setConversations(data);
    } catch (error) {
      console.error("Error fetching conversations:", error);
    }
  };

  const fetchMessages = async (phoneNumber) => {
    try {
      const res = await fetch(`http://localhost:5000/api/chat/messages/${phoneNumber}`);
      const data = await res.json();
      setMessages(data);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !activeChat) return;

    try {
      const payload = { phoneNumber: activeChat.phoneNumber, message: inputMessage };
      const newMessage = {
        id: Date.now(),
        content: inputMessage,
        direction: 'outbound',
        status: 'sending',
        sent_at: new Date().toISOString()
      };
      setMessages(prev => [...prev, newMessage]);
      setInputMessage("");

      const res = await fetch('http://localhost:5000/api/chat/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      if (data.success) {
        fetchMessages(activeChat.phoneNumber); 
        fetchConversations();
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const formatTime = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Components for Message Tails
  const MessageTailOut = () => (
    <svg viewBox="0 0 8 13" height="13" width="8" className="absolute top-0 -right-[8px] text-[#d9fdd3] fill-current">
      <path d="M5.188 1H0v11.193l6.467-8.625C7.526 2.156 6.958 1 5.188 1z"></path>
    </svg>
  );

  const MessageTailIn = () => (
    <svg viewBox="0 0 8 13" height="13" width="8" className="absolute top-0 -left-[8px] text-white fill-current">
      <path d="M1.533 3.568L8 12.193V1H2.812C1.042 1 .474 2.156 1.533 3.568z"></path>
    </svg>
  );

  const filteredConversations = conversations.filter(c => {
    if (activeTab === 'unread') return c.unreadCount > 0;
    return true;
  });

  const renderAvatar = (contact, size = "md") => {
    const sizeClasses = {
      sm: "w-8 h-8",
      md: "w-10 h-10",
      lg: "w-12 h-12",
      xl: "w-32 h-32"
    };

    if (contact?.profilePic) {
        return <img src={contact.profilePic} alt="Avatar" className={`${sizeClasses[size]} rounded-full object-cover`} />;
    }
    return <DefaultAvatar className={`${sizeClasses[size]} rounded-full`} />;
  };

  return (
    <div className="flex h-[calc(100vh-80px)] bg-[#d1d7db] relative overflow-hidden font-sans"> 
      
      {/* Green Header Strip */}
      <div className="absolute top-0 w-full h-32 bg-[#00a884] z-0"></div>

      {/* Main App Window */}
      <div className="relative z-10 flex w-full h-full max-w-[1700px] mx-auto bg-[#f0f2f5] shadow-lg xl:rounded-lg xl:my-5 xl:h-[calc(100%-40px)] overflow-hidden">
        
        {/* --- LEFT SIDEBAR --- */}
        <div className="w-[400px] flex flex-col border-r border-[#d1d7db] bg-white h-full">
          
          {/* My Profile Header */}
          <div className="h-[60px] bg-[#f0f2f5] px-4 py-2.5 flex items-center justify-between shrink-0">
             <div className="cursor-pointer" title="My Profile">
                <DefaultAvatar className="w-10 h-10 rounded-full cursor-pointer" />
             </div>
             <div className="flex gap-5 text-[#54656f]">
                <button title="Communities"><MessageSquareText className="w-5 h-5" /></button>
                <button title="New Chat"><Plus className="w-6 h-6" /></button>
                <button title="Menu"><MoreVertical className="w-5 h-5" /></button>
             </div>
          </div>

          {/* Search & Filter */}
          <div className="pl-3 pr-2 py-2 border-b border-[#e9edef] bg-white">
            <div className="bg-[#f0f2f5] rounded-lg px-3 py-1.5 flex items-center gap-4 mb-2">
               <Search className="w-4 h-4 text-[#54656f] shrink-0" />
               <input 
                 type="text" 
                 placeholder="Search or start new chat" 
                 className="bg-transparent border-none focus:ring-0 w-full text-[14px] text-[#3b4a54] placeholder-[#54656f] px-0 h-6" 
               />
            </div>
            <div className="flex gap-2 pb-1">
              {['All', 'Unread', 'Groups'].map((tab) => (
                <button 
                  key={tab}
                  onClick={() => setActiveTab(tab.toLowerCase())}
                  className={`px-3 py-1 rounded-full text-[13px] font-medium transition-colors ${
                    activeTab === tab.toLowerCase()
                      ? 'bg-[#e9edef] text-[#111b21]' 
                      : 'bg-[#f0f2f5] text-[#54656f] hover:bg-[#e9edef]'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Contact List */}
          <div className="flex-1 overflow-y-auto bg-white custom-scrollbar">
             {filteredConversations.map((contact, index) => (
               <div 
                 key={index} 
                 onClick={() => setActiveChat(contact)}
                 className={`flex items-center gap-3 px-3 py-3 cursor-pointer hover:bg-[#f5f6f6] border-b border-[#f0f2f5] group relative ${activeChat?.phoneNumber === contact.phoneNumber ? 'bg-[#f0f2f5]' : ''}`}
               >
                  <div className="shrink-0 relative">
                     {renderAvatar(contact, "lg")}
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col justify-center h-full pt-1">
                     <div className="flex justify-between items-center mb-0.5">
                        <h4 className="text-[17px] text-[#111b21] font-normal leading-tight truncate">{contact.contactName || contact.phoneNumber}</h4>
                        <span className={`text-[12px] ${contact.unreadCount > 0 ? 'text-[#00a884] font-medium' : 'text-[#667781]'}`}>{formatTime(contact.lastMessageTime)}</span>
                     </div>
                     <div className="flex justify-between items-center">
                        <div className="flex items-center gap-1 text-[#667781] text-[14px] truncate max-w-[90%]">
                            <p className="truncate block leading-5">{contact.lastMessage}</p>
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
    
        {/* --- MIDDLE: Chat Window --- */}
        {activeChat ? (
          <div className="flex-1 flex flex-col bg-[#efeae2] min-w-[400px] relative">
            {/* Background Pattern */}
            <div className="absolute inset-0 z-0 opacity-40 bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')] bg-repeat" />

             {/* Header */}
             <div className="h-[60px] bg-[#f0f2f5] px-4 py-2 flex items-center justify-between shrink-0 border-b border-[#d1d7db] relative z-10 w-full">
                <div className="flex items-center gap-4 cursor-pointer" onClick={() => setShowRightPanel(!showRightPanel)}>
                   {renderAvatar(activeChat, "md")}
                   <div className="flex flex-col justify-center">
                      <h4 className="text-[16px] text-[#111b21] font-medium leading-tight">{activeChat.contactName || activeChat.phoneNumber}</h4>
                      <p className="text-[13px] text-[#667781] truncate">click for info</p>
                   </div>
                </div>
                <div className="flex gap-6 text-[#54656f]">
                   <Search className="w-5 h-5 cursor-pointer" />
                   <MoreVertical className="w-5 h-5 cursor-pointer" />
                </div>
             </div>
             
             {/* Messages */}
             <div className="flex-1 overflow-y-auto p-4 pt-8 space-y-1 relative z-10 custom-scrollbar">
                {messages.map((msg, index) => {
                  const isOutbound = msg.direction === 'outbound';
                  // Logic to barely show tail on standard messages if desired, 
                  // but for now we put tails on ALL bubbles for effect.
                  
                  return (
                    <div key={index} className={`flex ${isOutbound ? 'justify-end' : 'justify-start'} w-full mb-1 group`}>
                       <div 
                         className={`
                           relative max-w-[65%] px-2 py-1.5 text-[14.2px] shadow-[0_1px_0.5px_rgba(11,20,26,.13)] rounded-lg leading-[19px] 
                           ${isOutbound ? 'bg-[#d9fdd3]' : 'bg-white'}
                         `}
                       >
                          {/* Message Tail */}
                          {isOutbound ? <MessageTailOut /> : <MessageTailIn />}
                          
                          {/* Dropdown Arrow (Hidden by default, shown on group hover) */}
                          <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-l from-inherit to-transparent pl-2 cursor-pointer">
                             <span className="text-[#aebac1]"><svg viewBox="0 0 18 18" width="18" height="18" className="fill-current"><path fill="currentColor" d="M3.3 4.6L9 10.3l5.7-5.7 1.6 1.6-7.3 7.3-7.3-7.3 1.6-1.6z"></path></svg></span>
                          </div>

                          <div className="px-1.5 pt-0.5 pb-4 text-[#111b21]">
                             {msg.content}
                          </div>
                          
                          <div className="flex justify-end items-center gap-1 absolute bottom-1 right-2 select-none">
                              <span className="text-[11px] text-[#667781] min-w-[45px] text-right">{formatTime(msg.sent_at)}</span>
                              {isOutbound && (
                                <span className={msg.status === 'read' ? 'text-[#53bdeb]' : 'text-[#8696a0]'}>
                                   <svg viewBox="0 0 16 11" height="11" width="16" className="fill-current"><path d="M11.4003 0.17511C11.1666 -0.0585699 10.7877 -0.0585699 10.554 0.17511L4.85243 5.8767L12.4497 5.8767L11.4003 0.17511Z"></path><path d="M15.4851 1.7082L11 6.19323L11.8494 7.04261L16.3312 2.56079C16.5649 2.32711 16.5649 1.94819 16.3312 1.7145C16.0975 1.48082 15.7186 1.48082 15.4849 1.7145L15.4851 1.7082Z"></path><path d="M10.8242 7.04599L6.59596 11.2743C6.36228 11.5079 5.98336 11.5079 5.74968 11.2743L0.273763 5.79834C0.0400806 5.56466 0.0400806 5.18573 0.273763 4.95205C0.507446 4.71837 0.886368 4.71837 1.12005 4.95205L6.17282 10.0048L10.8242 7.04599Z"></path></svg>
                                </span>
                              )}
                          </div>
                       </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
             </div>
      
             {/* Input Bar */}
             <div className="min-h-[62px] bg-[#f0f2f5] px-4 py-2 flex items-end gap-2 relative z-10 w-full border-t border-[#d1d7db]">
                <div className="mb-2 flex gap-3 text-[#54656f]">
                   <Smile className="w-6 h-6 cursor-pointer hover:opacity-80" />
                   <Paperclip className="w-6 h-6 cursor-pointer hover:opacity-80" />
                </div>
                
                <div className="flex-1 bg-white rounded-lg min-h-[42px] flex items-center mb-1.5 px-3 py-1 mx-2 ring-1 ring-transparent focus-within:ring-white">
                   <input 
                     type="text" 
                     placeholder="Type a message" 
                     value={inputMessage}
                     onChange={(e) => setInputMessage(e.target.value)}
                     onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                     className="w-full bg-transparent border-none focus:ring-0 text-[15px] text-[#111b21] placeholder-[#54656f] p-0 max-h-[100px] overflow-y-auto" 
                   />
                </div>
                
                <div className="mb-2 flex items-center justify-center">
                   {inputMessage.trim() ? (
                     <button onClick={handleSendMessage} className="text-[#00a884] p-1">
                        <Send className="w-6 h-6" />
                     </button>
                   ) : (
                     <Mic className="w-6 h-6 text-[#54656f] cursor-pointer" />
                   )}
                </div>
             </div>
          </div>
        ) : (
          <div className="flex-1 hidden md:flex flex-col items-center justify-center bg-[#f0f2f5] border-b-[6px] border-[#25d366]">
             <div className="w-[300px] text-center">
                 <h2 className="text-[32px] font-light text-[#41525d] mb-4">WhatsApp Web</h2>
                 <p className="text-[#667781] text-sm leading-6">
                    Send and receive messages without keeping your phone online.<br/>
                    Use BulkWeb on up to 4 linked devices and 1 phone.
                 </p>
             </div>
          </div>
        )}

        {/* --- RIGHT SIDEBAR: Contact Info --- */}
        {showRightPanel && activeChat && (
          <div className="w-[350px] bg-white border-l border-[#d1d7db] flex flex-col h-full animate-fade-in z-20 shadow-[-2px_0_5px_rgba(0,0,0,0.05)]">
             <div className="h-[60px] bg-[#f0f2f5] px-6 flex items-center gap-6 border-b border-[#d1d7db] shrink-0">
                <button onClick={() => setShowRightPanel(false)} className="text-[#54656f] hover:bg-[#d1d7db] rounded-full p-1 transition-colors">
                  <X className="w-5 h-5" />
                </button>
                <h4 className="text-[16px] text-[#111b21] font-medium">Contact Info</h4>
             </div>

             <div className="flex-1 overflow-y-auto custom-scrollbar bg-[#f0f2f5]">
                <div className="bg-white shadow-sm mb-3 pb-6 pt-8 flex flex-col items-center">
                   <div className="mb-4">
                      {renderAvatar(activeChat, "xl")}
                   </div>
                   <h2 className="text-[22px] text-[#111b21] font-normal mb-1">{activeChat.contactName || activeChat.phoneNumber}</h2>
                   <p className="text-[#667781] text-[16px]">{activeChat.phoneNumber}</p>
                </div>

                <div className="bg-white shadow-sm mb-3 p-4">
                   <div className="text-[#667781] text-[14px] mb-2 font-medium">Status</div>
                   <p className="text-[#111b21] text-[16px]">Active Customer</p>
                </div>

                <div className="bg-white shadow-sm mb-3 p-4">
                  <div className="flex justify-between items-center mb-3">
                    <div className="text-[#667781] text-[14px] font-medium">Tags</div>
                    <button className="text-[#00a884] bg-[#f0f2f5] p-1 rounded hover:bg-[#d9dbde]"><Plus className="w-4 h-4" /></button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                     <span className="bg-[#f0f2f5] text-[#54656f] px-2 py-1 rounded text-sm">Lead</span>
                     <span className="bg-[#f0f2f5] text-[#54656f] px-2 py-1 rounded text-sm">Vital</span>
                  </div>
                </div>

                <div className="bg-white shadow-sm p-4 h-full min-h-[200px]">
                   <div className="text-[#667781] text-[14px] mb-2 flex items-center gap-2 font-medium">
                     <StickyNote className="w-4 h-4" /> Notes
                   </div>
                   <textarea 
                     className="w-full h-32 p-3 bg-[#f0f2f5] rounded-lg text-sm border-none focus:ring-1 focus:ring-[#00a884] resize-none placeholder-gray-500 text-[#111b21]"
                     placeholder="Click to add a note..."
                   />
                   <button className="text-sm bg-[#00a884] text-white px-5 py-2 rounded-full hover:shadow-md transition-shadow mt-2 float-right hover:bg-[#008f6f]">
                     Save
                   </button>
                </div>
             </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Chat;
