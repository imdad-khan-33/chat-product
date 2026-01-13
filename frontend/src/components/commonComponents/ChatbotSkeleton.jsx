// components/ChatbotSkeleton.jsx
const ChatbotSkeleton = () => {
  return (
    <div className="flex flex-col h-screen p-4 space-y-4 animate-pulse">
      {/* Header */}
      <div className="h-10 w-1/3 bg-gray-300 rounded-lg" />

      {/* Chat messages */}
      <div className="flex-1 space-y-6 overflow-y-auto mt-4">
        {[...Array(6)].map((_, index) => {
          const isBot = index % 2 === 0;
          return (
            <div
              key={index}
              className={`flex items-end gap-3 ${isBot ? "justify-start" : "justify-end"}`}
            >
              {/* Avatar */}
              {isBot && <div className="w-10 h-10 bg-gray-300 rounded-full" />}
              {/* Message bubble */}
              <div
                className={`h-6 rounded-[20px] ${
                  isBot
                    ? "bg-gray-300 rounded-bl-none w-[65%]"
                    : "bg-gray-200 rounded-br-none w-[60%]"
                }`}
              />
              {/* Avatar on the right for user */}
              {!isBot && <div className="w-10 h-10 bg-gray-200 rounded-full" />}
            </div>
          );
        })}
      </div>

      {/* Input area */}
      <div className="h-12 bg-gray-300 rounded-md mt-2" />
    </div>
  );
};

export default ChatbotSkeleton;
