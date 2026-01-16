import { Trash2, Search } from "lucide-react";
import Avatar from "./Avatar";

const ChatHeader = ({ activeChat, onToggleRightPanel, onDeleteChat }) => {

  return (
    <div className="h-[60px] bg-[#f0f2f5] px-4 py-2 flex items-center justify-between shrink-0 border-b border-[#d1d7db] relative">
      <div
        className="flex items-center gap-4 cursor-pointer"
        onClick={onToggleRightPanel}
      >
        <Avatar src={activeChat?.profilePic} size="md" />
        <div className="flex flex-col justify-center">
          <h4 className="text-[16px] text-[#111b21] font-medium leading-tight">
            {activeChat?.contactName || activeChat?.phoneNumber}
          </h4>
          <p className="text-[13px] text-[#667781] truncate">click for info</p>
        </div>
      </div>
      {/* <div className="flex gap-6 text-[#54656f]">
        <Search className="w-5 h-5 cursor-pointer" />
        <Trash2 
          className="w-5 h-5 cursor-pointer hover:text-red-500 transition-colors" 
          onClick={onDeleteChat}
          title="Delete chat"
        />
      </div> */}
    </div>
  );
};

export default ChatHeader;
