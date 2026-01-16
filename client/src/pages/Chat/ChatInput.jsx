import { Mic, Paperclip, Plus, Send, Smile } from "lucide-react";

const ChatInput = ({ value, onChange, onSend }) => {
  return (
    <div className="min-h-[62px] bg-[#f0f2f5] px-4 py-2 flex items-end gap-2 border-t border-[#d1d7db] relative z-20">
 

      <div className="flex-1 bg-white rounded-lg min-h-[42px] flex items-center mb-1.5 px-4 py-2 mx-1 ring-1 ring-transparent focus-within:ring-white shadow-sm transition-all focus-within:shadow-md">
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onSend()}
          placeholder="Type a message"
          className="w-full bg-transparent border-none focus:outline-none focus:ring-0 text-[15px] text-[#111b21] placeholder-[#54656f] p-0 max-h-[100px] overflow-y-auto leading-[1.4]"
        />
      </div>
    </div>
  );
};

export default ChatInput;
