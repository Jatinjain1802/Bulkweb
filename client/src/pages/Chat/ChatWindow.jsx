import ChatHeader from "./ChatHeader";
import MessageList from "./MessageList";
import ChatInput from "./ChatInput";

const ChatWindow = ({
  activeChat,
  messages,
  input,
  setInput,
  onSend,
  onToggleRightPanel,
}) => {
  if (!activeChat) {
    return (
      <div className="flex-1 hidden md:flex flex-col items-center justify-center bg-[#f0f2f5]">
        <div className="w-[300px] text-center">
          <h2 className="text-[32px] font-light text-[#41525d] mb-4">
            WhatsApp Web
          </h2>
          <p className="text-[#667781] text-sm leading-6">
            Send and receive messages without keeping your phone online.
            <br />
            Use BulkWeb on up to 4 linked devices and 1 phone.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-[#efeae2] min-w-[400px] relative">
      {/* Background Pattern */}
      <div className="absolute inset-0 z-0 opacity-40 bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')] bg-repeat" />

      {/* Header */}
      <div className="relative z-10 w-full">
        <ChatHeader
          activeChat={activeChat}
          onToggleRightPanel={onToggleRightPanel}
        />
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-hidden relative z-10">
        <MessageList messages={messages} />
      </div>

      {/* Input */}
      <div className="relative z-10 w-full">
        <ChatInput value={input} onChange={setInput} onSend={onSend} />
      </div>
    </div>
  );
};

export default ChatWindow;
