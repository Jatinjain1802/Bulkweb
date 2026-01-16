import { useEffect, useRef } from "react";
import MessageBubble from "./MessageBubble";

const MessageList = ({ messages }) => {
  const messagesEndRef = useRef(null);

  // useEffect(() => {
  //   messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  // }, [messages]);

  // Helper to format date for the separator
  const formatDateSeparator = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    }
    if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    }
    return date.toLocaleDateString([], { month: "long", day: "numeric", year: "numeric" });
  };

  // Group messages by date
  const groupedMessages = messages.reduce((groups, message) => {
    const date = new Date(message.sent_at).toDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(message);
    return groups;
  }, {});

  return (
    <div className="flex-1 overflow-y-auto p-4 pt-4 space-y-1 custom-scrollbar h-full bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')] bg-fixed opacity-100">
      {/* Note: The background pattern is applied in ChatWindow wrapper usually, but can be here too. 
          If using the wrapper method, remove the BG here. 
          We'll rely on the parent wrapper for BG, but adding padding-bottom for visual ease. */
      }
      
      <div className="flex flex-col pb-4">
        {Object.keys(groupedMessages).map((dateKey) => (
          <div key={dateKey}>
            {/* Date Separator */}
            <div className="flex justify-center my-4 sticky top-2 z-10 opacity-95">
              <span className="bg-white/95 shadow-sm text-[#54656f] text-[12.5px] font-medium px-3 py-1.5 rounded-[7.5px] uppercase tracking-wide border border-gray-100">
                {formatDateSeparator(groupedMessages[dateKey][0].sent_at)}
              </span>
            </div>

            {/* Messages for this date */}
            {groupedMessages[dateKey].map((msg) => (
              <MessageBubble key={msg.id} message={msg} />
            ))}
          </div>
        ))}
      </div>
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;
