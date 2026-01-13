import React from "react";

const ChatBubble = ({ message, sender = "user", timestamp, emotion }) => {
  const isUser = sender === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-4`}>
      <div
        className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
          isUser
            ? "bg-customText text-white rounded-br-none"
            : "bg-gray-200 text-gray-800 rounded-bl-none"
        }`}
      >
        <p className="text-sm lg:text-base break-words">{message}</p>
        {timestamp && (
          <p className="text-xs mt-1 opacity-70">{timestamp}</p>
        )}
        {emotion && !isUser && (
          <p className="text-xs mt-2 italic">Emotion: {emotion}</p>
        )}
      </div>
    </div>
  );
};

export default ChatBubble;
