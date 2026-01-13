import { useEffect, useRef, useState } from "react";
import botIcon from "../assets/images/bot.png";
import userIcon from "../assets/images/user.png";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import {
  useCreateNewChatMutation,
  useExistingChatMutation,
  useGetbotChatsQuery,
} from "../slices/chatbotSlice/chatbotApi";
import ChatbotSkeleton from "../components/commonComponents/ChatbotSkeleton";
import { TbSend2 } from "react-icons/tb";
import { ScaleLoader } from "react-spinners";
import {
  setAddAssistantMessage,
  setAddUserMessages,
  setChatMessages,
  setCreatingNewChatLoading,
  setSubmittingChatLoading,
  setUpdateBotIds,
} from "../slices/chatbotSlice/chatbotSlice";
import TypingIndicator from "../components/commonComponents/TypingIndicator";

const Chatbot = () => {
  const [message, setMessage] = useState("");
  const isSidebarOpen = useSelector((state) => state.ui.isSidebarOpen);
  const theme = useSelector((state) => state.ui.theme);
  const chatMessages = useSelector((state) => state.chatbotSlice.chatsMessages);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();
  const endOfMessagesRef = useRef(null);

  const isNewChat = id === "new-chat";

  const {
    data: chatsData,
    isLoading: chatsLoading,
    isError: chatsError,
    isFetching: chatsFetching,
  } = useGetbotChatsQuery(id, {
    skip: isNewChat || !id, // Skip fetch for new-chat or undefined id
    refetchOnMountOrArgChange: true,
  });

  const [
    createNewChat,
    {
      isLoading: isCreating,
    },
  ] = useCreateNewChatMutation();

  const [
    existingChat,
    {
      isLoading: isSubmitting,
    },
  ] = useExistingChatMutation();

  // Side Effects
  useEffect(() => {
    if (!chatsLoading) {
      dispatch(setChatMessages(chatsData));
    }
    return () => {
      dispatch(setChatMessages({ data: { messages: [] } }));
    };
  }, [id, chatsData, isNewChat, dispatch, chatsLoading]);

  useEffect(() => {
  if (isCreating || isSubmitting) {
    endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
  }
}, [isCreating, isSubmitting]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (message.trim()) {
      const userPrompt = {
        userPrompt: message,
      };
      if (isNewChat) {
        setMessage("");
        dispatch(setCreatingNewChatLoading(true));
        const data = await createNewChat(userPrompt);
        dispatch(setCreatingNewChatLoading(false));
        if (data && id === "new-chat") {
          navigate(`/chatbot/${data?.data?.data?.sessionId}`, {
            replace: true,
          });
          dispatch(setUpdateBotIds(data));
        }
      } else {
        const now = new Date();
        const fullDateTime = now.toISOString();
        const addToChats = {
          content: message.trim(),
          role: "user",
          timestamp: fullDateTime,
        };
        dispatch(setAddUserMessages(addToChats));
        setMessage("");
        dispatch(setSubmittingChatLoading(true));
        const { data } = await existingChat({ userPrompt, id });
        dispatch(setSubmittingChatLoading(false));
        if (data) {
          dispatch(setAddAssistantMessage(data));
        }
      }
      // isNewChat ? createNewChat(userPrompt) : existingChat({userPrompt, id});
      // TODO: handle sending message here
    }
  };

 const renderMessages = () => {
  if (chatsLoading || chatsFetching) return <ChatbotSkeleton />;
  if (chatsError)
    return <div className="text-red-500">Failed to load chat session.</div>;
  if (!chatsData?.data?.messages?.length)
    return <div className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>No messages yet.</div>;

  return (
    <>
      {chatMessages?.map((chat, i) => (
        <div key={i} className="my-2 flex flex-col gap-8">
          {chat.role === "user" && (
            <div className="flex justify-end items-center gap-3">
              <h2
                className={`text-[16px] font-normal leading-[24px] ${theme === 'dark' ? 'bg-slate-600 text-white' : 'bg-[#D0FFF7] text-black'} md:w-[50%] w-[80%] p-4 rounded-[20px] rounded-br-none font-botFont`}
                dangerouslySetInnerHTML={{
                  __html: chat.content
                    ?.replace(/\n+/g, "<br />")
                    .replace(/(<br \/>)+/g, "<br />"),
                }}
              />
              <img src={userIcon} alt="" className="w-10 h-10 self-end" />
            </div>
          )}
          {chat.role === "assistant" && (
            <div className="flex justify-start my-8 gap-3">
              <img src={botIcon} alt="" className="w-10 h-10 self-end" />
              <h2
                className={`text-[16px] leading-[24px] font-normal ${theme === 'dark' ? 'bg-customText text-slate-900' : 'bg-[#058B74] text-[#FFFEFA]'} md:w-[65%] w-[80%] p-4 rounded-[20px] rounded-bl-none font-botFont`}
                dangerouslySetInnerHTML={{
                  __html: chat.content
                    ?.replace(/\n+/g, "<br />")
                    .replace(/(<br \/>)+/g, "<br />"),
                }}
              />
            </div>
          )}
        </div>
      ))}

      {/* Show typing animation if assistant is generating */}
      {(isCreating || isSubmitting) && <TypingIndicator />}
      <div ref={endOfMessagesRef} />
    </>
  );
};


  return (
    <div className={`relative h-full flex flex-col w-[100%] overflow-hidden ${theme === 'dark' ? 'bg-slate-900' : ''}`}>
      <h1 className={`${theme === 'dark' ? 'text-white' : 'text-[#0B6A5A]'} font-bold text-2xl w-[95%] mx-auto my-auto`}>
        {isNewChat ? "Start New Conversation" : "Messages"}
      </h1>

      {/* Scrollable messages area */}

      <div
        className={`chatBot flex-1 overflow-y-auto px-4 pb-3 max-h-[75vh] ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-chatBg'} w-[95%] m-auto rounded border`}
        style={{ borderColor: theme === 'dark' ? '#334155' : "#313D4F", borderRadius: "7px" }}
      >
        {isNewChat ? (
          <div className={`text-lg ${theme === 'dark' ? 'text-customText' : 'text-customBg'} mt-4 h-full flex justify-center items-center`}>
            Start typing to begin a new chat ...
          </div>
        ) : (
          renderMessages()
        )}
      </div>

      {/* Fixed input area */}
      <div className={`${isSidebarOpen ? "left-[0px]" : "md:left-20 left-14"}`}>
        <form
          onSubmit={handleSubmit}
          className="flex items-center p-4 mx-auto relative w-[98%]"
        >
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className={`flex-1 ${theme === 'dark' ? 'bg-slate-700 text-white placeholder:text-gray-400' : 'bg-customBg text-white placeholder:text-[#dfd7d7]'} border-0 h-[55px] rounded-[56.3px] py-2 px-8 font-medium`}
            placeholder="Type something..."
          />
          <button
            type="submit"
            disabled={isCreating || isSubmitting}
            className="absolute bottom-19 right-12"
          >
            {isCreating || isSubmitting ? (
              <ScaleLoader color="white" width={2} height={20} />
            ) : (
              <TbSend2 color="white" size={25} />
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Chatbot;
