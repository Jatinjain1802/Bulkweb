import {
  Ban,
  Bell,
  ChevronRight,
  HelpCircle,
  MessageSquare,
  StickyNote,
  ThumbsDown,
  Trash2,
  X,
} from "lucide-react";
import Avatar from "./Avatar";

const RightPanel = ({ activeChat, onClose }) => {
  if (!activeChat) return null;

  return (
    <div className="w-[380px] bg-white border-l border-[#d1d7db] flex flex-col h-full z-20 shadow-[-2px_0_5px_rgba(0,0,0,0.05)] animate-slide-in-right">
      <div className="h-[60px] bg-[#f0f2f5] px-6 flex items-center gap-6 border-b border-[#d1d7db] shrink-0">
        <button
          onClick={onClose}
          className="text-[#54656f] hover:bg-[#d1d7db] rounded-full p-1 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
        <h4 className="text-[16px] text-[#111b21] font-medium">Contact Info</h4>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar bg-[#f0f2f5]">
        {/* Profile Card */}
        <div className="bg-white shadow-sm mb-3 pb-6 pt-8 flex flex-col items-center">
          <div className="mb-4">
            <Avatar src={activeChat.profilePic} size="xl" />
          </div>
          <h2 className="text-[22px] text-[#111b21] font-normal mb-1">
            {activeChat.contactName || activeChat.phoneNumber}
          </h2>
          <p className="text-[#667781] text-[16px]">{activeChat.phoneNumber}</p>
          <div className="flex gap-4 mt-4">
               <div className="flex flex-col items-center gap-1 cursor-pointer hover:bg-gray-50 p-2 rounded-lg">
                   <MessageSquare className="w-6 h-6 text-[#00a884]" />
                   <span className="text-[12px] text-[#00a884]">Message</span>
               </div>
               <div className="flex flex-col items-center gap-1 cursor-pointer hover:bg-gray-50 p-2 rounded-lg">
                   <Bell className="w-6 h-6 text-[#54656f]" />
                   <span className="text-[12px] text-[#54656f]">Mute</span>
               </div>
          </div>
        </div>

        {/* About / Status */}
        <div className="bg-white shadow-sm mb-3 p-4">
          <div className="text-[#667781] text-[14px] mb-2 font-medium">
            About
          </div>
          <p className="text-[#111b21] text-[16px]">
            Hey there! I am using BulkWeb.
          </p>
        </div>

        {/* Media (Placeholder) */}
        <div className="bg-white shadow-sm mb-3 p-4 flex justify-between items-center cursor-pointer hover:bg-[#f5f6f6]">
          <div className="text-[#667781] text-[14px] font-medium">
            Media, links and docs
          </div>
          <ChevronRight className="w-5 h-5 text-[#8696a0]" />
        </div>

        {/* Notes Section */}
        <div className="bg-white shadow-sm mb-3 p-4 h-full min-h-[200px]">
          <div className="text-[#667781] text-[14px] mb-2 flex items-center gap-2 font-medium">
            <StickyNote className="w-4 h-4" /> Notes
          </div>
          <textarea
            className="w-full h-32 p-3 bg-[#f0f2f5] rounded-lg text-sm border-none focus:ring-1 focus:ring-[#00a884] resize-none placeholder-gray-500 text-[#111b21] outline-none"
            placeholder="Click to add a note..."
          />
          <button className="text-sm bg-[#00a884] text-white px-5 py-2 rounded-full hover:shadow-md transition-shadow mt-2 float-right hover:bg-[#008f6f]">
            Save
          </button>
        </div>

        {/* Action Buttons */}
        <div className="bg-white shadow-sm mb-3 p-4 text-[#ea0038] space-y-4">
           <div className="flex items-center gap-3 cursor-pointer hover:bg-[#f5f6f6] p-2 rounded transition-colors">
               <Ban className="w-6 h-6" />
               <span className="text-[16px]">Block {activeChat.contactName}</span>
           </div>
           <div className="flex items-center gap-3 cursor-pointer hover:bg-[#f5f6f6] p-2 rounded transition-colors">
               <ThumbsDown className="w-6 h-6" />
               <span className="text-[16px]">Report {activeChat.contactName}</span>
           </div>
           <div className="flex items-center gap-3 cursor-pointer hover:bg-[#f5f6f6] p-2 rounded transition-colors">
               <Trash2 className="w-6 h-6" />
               <span className="text-[16px]">Delete chat</span>
           </div>
        </div>
      </div>
    </div>
  );
};

export default RightPanel;
