import { RiCheckDoubleLine, RiCheckLine } from "react-icons/ri";

const MessageBubble = ({ message }) => {
  const isOutbound = message.direction === "outbound";

  const MessageTailOut = () => (
    <svg
      viewBox="0 0 8 13"
      height="13"
      width="8"
      className="absolute top-0 -right-[8px] text-[#d9fdd3] fill-current"
    >
      <path d="M5.188 1H0v11.193l6.467-8.625C7.526 2.156 6.958 1 5.188 1z"></path>
    </svg>
  );

  const MessageTailIn = () => (
    <svg
      viewBox="0 0 8 13"
      height="13"
      width="8"
      className="absolute top-0 -left-[8px] text-white fill-current"
    >
      <path d="M1.533 3.568L8 12.193V1H2.812C1.042 1 .474 2.156 1.533 3.568z"></path>
    </svg>
  );

  const renderStatusIcon = () => {
    if (message.status === "read") {
      return <RiCheckDoubleLine className="w-[15px] h-[15px] text-[#53bdeb]" />;
    }
    if (message.status === "delivered") {
      return <RiCheckDoubleLine className="w-[15px] h-[15px] text-[#8696a0]" />;
    }
    return <RiCheckLine className="w-[15px] h-[15px] text-[#8696a0]" />;
  };

  return (
    <div
      className={`flex ${
        isOutbound ? "justify-end" : "justify-start"
      } w-full mb-1 group px-4 md:px-14 lg:px-20`}
    >
      <div
        className={`relative max-w-full sm:max-w-[80%] md:max-w-[65%] shadow-sm rounded-lg ${
          isOutbound ? "bg-[#d9fdd3] rounded-tr-none" : "bg-white rounded-tl-none"
        }`}
      >
        {/* Message Tail */}
        {isOutbound ? <MessageTailOut /> : <MessageTailIn />}

        <div className="px-2 py-1.5 flex flex-col min-w-[80px]">
          {/* Media Attachment */}
          {message.media_url && (
             <div className="mb-1">
                {message.media_url.match(/\.(jpeg|jpg|png|gif|webp)$/i) ? (
                    <img src={message.media_url} alt="Attached Media" className="rounded-lg max-w-full object-cover max-h-[250px]" />
                ) : (
                    <a href={message.media_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 bg-[#f0f2f5] p-3 rounded-lg hover:bg-[#d1d7db] transition-colors border border-gray-200">
                         <div className="bg-[#ff6900] text-white p-2.5 rounded-lg">
                            <svg viewBox="0 0 24 24" width="24" height="24" className="fill-current">
                                <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zM6 20V4h7v5h5v11H6z"/>
                            </svg>
                         </div>
                         <div className="flex flex-col overflow-hidden">
                             <span className="text-sm font-medium text-gray-800 truncate max-w-[150px]">
                                {(message.content || "").match(/📄 (.*)/)?.[1] || message.media_url.split('/').pop()}
                             </span>
                             <span className="text-xs text-gray-500">PDF • 1 Page</span>
                         </div>
                    </a>
                )}
             </div>
          )}

          <div className="text-[14.2px] leading-[19px] text-[#111b21]  whitespace-pre-wrap wrap-break-word">
            {(message.content || "").replace(/📄 (.*)/, '')} 
          </div>
          
          <div className="flex justify-end items-center gap-1 mt-1 -mb-1 ml-2 select-none self-end">
            <span className="text-[11px] text-[#667781] min-w-fit">
              {new Date(message.sent_at).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
            {isOutbound && (
              <span className="flex items-center pb-[3px]">
                {renderStatusIcon()}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
