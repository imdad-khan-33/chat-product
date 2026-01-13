import React, { useEffect, useRef, useState } from "react";
import { useLazyPostChatStreamQuery } from "../slices/chatbotSlice/sseApiSlice";
import DOMPurify from "dompurify";

const ChatStream = () => {
  const [trigger, { data: streamData = "", isFetching }] =
    useLazyPostChatStreamQuery();
  const [input, setInput] = useState("");
  const scrollRef = useRef(null);

  const handleSend = () => {
    if (input.trim()) {
      trigger(input);
      setInput("");
    }
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [streamData]);

  const safeHtml = DOMPurify.sanitize(streamData);

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <div className="mb-4">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          rows={3}
          className="w-full border border-gray-300 rounded p-2"
          placeholder="Type your message..."
        />
        <button
          onClick={handleSend}
          className="mt-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
        >
          Send
        </button>
      </div>

      <div
        ref={scrollRef}
        id="chat-container"
        className="bg-gray-100 p-4 rounded min-h-[120px] max-h-[300px] overflow-y-auto"
      >
        {isFetching && <p className="text-gray-500 italic">Streaming...</p>}
        {streamData && (
          <div
            className="prose whitespace-pre-wrap"
            dangerouslySetInnerHTML={{ __html: safeHtml }}
          />
        )}
      </div>
    </div>
  );
};

export default ChatStream;
