import React, { useState, useRef, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import {
  useLazyGetbotChatIdsQuery,
  useGetbotChatsQuery,
  useCreateNewChatMutation,
  useExistingChatMutation
} from "../slices/chatbotSlice/chatbotApi";
import { useGetAssessmentResultsQuery, useMarkSessionCompleteMutation } from "../slices/assessment/assessmentApi";
import ChatBubble from "../components/commonComponents/ChatBubble";
import TypingIndicator from "../components/commonComponents/TypingIndicator";
import { FiMic, FiSend, FiLoader, FiPlusCircle, FiClock, FiLock, FiUser, FiPause, FiPlay, FiSquare } from "react-icons/fi";
import { getProfileImage } from "../utils/imageHelper";

const ChatTherapy = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [inputMessage, setInputMessage] = useState("");
  const [recordingState, setRecordingState] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const messagesEndRef = useRef(null);
  const userDetails = useSelector((state) => state.auth.userDetails);

  // Timer State
  const { data: assessmentData } = useGetAssessmentResultsQuery();
  const [timeLeft, setTimeLeft] = useState(null); // in seconds
  const [isTimeUp, setIsTimeUp] = useState(false);
  const [isSessionActive, setIsSessionActive] = useState(false);

  useEffect(() => {
    if (assessmentData?.session?.sessionDuration) {
      // Parse duration if it's a string like "30 mins"
      let duration = 30;
      if (typeof assessmentData.session.sessionDuration === 'string') {
        const match = assessmentData.session.sessionDuration.match(/(\d+)/);
        if (match) duration = parseInt(match[0]);
      } else if (typeof assessmentData.session.sessionDuration === 'number') {
        duration = assessmentData.session.sessionDuration;
      }

      // Convert to seconds (FORCING 1 MINUTE FOR TESTING)
      if (timeLeft === null) setTimeLeft(duration * 60);
    }
  }, [assessmentData]);

  useEffect(() => {
    if (!isSessionActive || timeLeft === null) return;
    if (timeLeft <= 0) {
      setIsTimeUp(true);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, isSessionActive]);

  const isSessionDue = useMemo(() => {
    if (!assessmentData?.session?.nextSessionDate) return false;
    return new Date() >= new Date(assessmentData.session.nextSessionDate);
  }, [assessmentData]);

  const noMoreSessions = useMemo(() => {
    return assessmentData?.session && !assessmentData.session.nextSessionDate;
  }, [assessmentData]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // Queries & Mutations
  const [getChatIds, { isLoading: idsLoading }] = useLazyGetbotChatIdsQuery();
  const { data: chatDataRes, isLoading: chatLoading, refetch: refetchChat } = useGetbotChatsQuery(currentSessionId, {
    skip: !currentSessionId,
  });
  const [createNewChat, { isLoading: creatingChat }] = useCreateNewChatMutation();
  const [sendToExistingChat, { isLoading: sendingToExisting }] = useExistingChatMutation();
  const [markComplete] = useMarkSessionCompleteMutation();

  // Handle automatic session completion
  useEffect(() => {
    if (isTimeUp && isSessionActive) {
      const handleSessionCompletion = async () => {
        try {
          await markComplete().unwrap();
          toast.success("Session completed! Progressive marks added.", { icon: "✅" });
          setIsSessionActive(false); // Stop session activity
        } catch (err) {
          console.error("Failed to automatically mark session complete:", err);
        }
      };
      handleSessionCompletion();
    }
  }, [isTimeUp, isSessionActive, markComplete]);

  // Sync sessionId with URL params
  useEffect(() => {
    if (id && id !== "new-chat") {
      setCurrentSessionId(id);
      // For existing chats, we might want to mark them as "active" or just show messages
      setIsSessionActive(true);
    } else if (id === "new-chat") {
      setCurrentSessionId(null);
      setIsSessionActive(false);
      setTimeLeft(null);
      setIsTimeUp(false);
    } else {
      // If just at /chat without ID, get latest
      const fetchInitial = async () => {
        try {
          const res = await getChatIds().unwrap();
          if (res?.data?.length > 0) {
            setCurrentSessionId(res.data[0].sessionId);
            setIsSessionActive(true);
          }
        } catch (err) {
          console.error("Failed to load chat sessions:", err);
        }
      };
      fetchInitial();
    }
  }, [id, getChatIds]);

  const messages = useMemo(() => {
    if (!chatDataRes?.data?.messages) return [];

    // Deduplicate messages based on content and role
    const uniqueMessages = [];
    chatDataRes.data.messages.forEach((m) => {
      const lastMsg = uniqueMessages[uniqueMessages.length - 1];
      // Check if current message is identical to the last one (content & role)
      // We allow standard duplicates if they are not consecutive (rare in chat)
      if (lastMsg && lastMsg.content === m.content && lastMsg.role === m.role) {
        return;
      }
      uniqueMessages.push(m);
    });

    return uniqueMessages.map((m, idx) => ({
      id: m._id || idx,
      text: m.content,
      sender: m.role === "assistant" ? "therapist" : "user",
      timestamp: new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }));
  }, [chatDataRes]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    if (!inputMessage.trim() || creatingChat || sendingToExisting) return;

    const userPrompt = inputMessage;
    setInputMessage("");

    try {
      if (!currentSessionId) {
        // Start a new session
        const res = await createNewChat({ userPrompt }).unwrap();
        if (res?.data?.sessionId) {
          setCurrentSessionId(res.data.sessionId);
          // Refresh session list in background
          getChatIds();
          // Navigate to the new ID after creation
          navigate(`/auth/chatbot/${res.data.sessionId}`);
        }
      } else {
        // Send to existing session
        await sendToExistingChat({ userPrompt, id: currentSessionId }).unwrap();
        refetchChat();
      }
    } catch {
      toast.error("Message failed to send. Please try again.");
      setInputMessage(userPrompt); // Restore text on failure
    }
  };

  const handleNewChat = () => {
    // Navigate and reset everything
    navigate('/auth/chatbot/new-chat');
    setCurrentSessionId(null);
    setIsSessionActive(false);
    setTimeLeft(null);
    setIsTimeUp(false);
    toast.success("Started a new conversation.");
  };


  const handleRecording = () => {
    setRecordingState(!recordingState);
    if (!recordingState) {
      toast("Voice input active...", { icon: "🎤" });
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] bg-white dark:bg-slate-900 overflow-hidden transition-colors duration-300">
      {/* Page Title & Actions */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-black text-[#0B6A5A] font-heading">Messages</h1>
        <button
          onClick={handleNewChat}
          className="flex items-center gap-2 px-4 py-2 bg-[#F0FDF4] text-[#0B6A5A] rounded-xl font-bold text-sm border border-[#DCFCE7] hover:bg-[#DCFCE7] transition-all"
        >
          <FiPlusCircle /> New Chat
        </button>
      </div>

      {/* Timer Banner */}
      {timeLeft !== null && (
        <div className={`mx-4 lg:mx-8 mb-4 px-6 py-3 rounded-2xl flex items-center justify-between border shadow-sm transition-all duration-500 ${isTimeUp ? "bg-red-50 border-red-200 text-red-700" : "bg-[#F0FDFA] border-[#CCFBF1] text-[#0B6A5A]"}`}>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 font-bold">
              <FiClock className={isTimeUp || (isSessionActive && timeLeft > 0) ? "animate-pulse" : ""} />
              <span className="hidden sm:inline">{isSessionActive ? "Session Active:" : "Session Paused:"}</span>
            </div>
            <span className="text-2xl font-black font-mono tracking-widest min-w-[70px]">
              {formatTime(timeLeft)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {noMoreSessions ? (
              <div className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-xl font-bold text-xs">
                ✨ All sessions completed!
              </div>
            ) : isTimeUp ? (
              <div className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-xl font-bold text-xs">
                ✅ Session Complete
              </div>
            ) : isSessionDue ? (
              <>
                {isSessionActive ? (
                  <button
                    onClick={(e) => { e.preventDefault(); setIsSessionActive(false); }}
                    className="flex items-center gap-2 px-4 py-2 bg-amber-100 text-amber-700 rounded-xl font-bold text-xs hover:bg-amber-200 transition-all"
                    title="Pause Session"
                  >
                    <FiPause /> <span className="hidden md:inline">Pause</span>
                  </button>
                ) : (
                  <button
                    onClick={(e) => { e.preventDefault(); setIsSessionActive(true); }}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-100 text-emerald-700 rounded-xl font-bold text-xs hover:bg-emerald-200 transition-all"
                    title="Start/Resume Session"
                  >
                    <FiPlay /> <span className="hidden md:inline">Start/Resume</span>
                  </button>
                )}
              </>
            ) : (
              <div className={`flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-500 rounded-xl font-bold text-xs`} title="Your next session is not due yet.">
                🔒 Next session: {new Date(assessmentData?.session?.nextSessionDate).toLocaleDateString()}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Messaging Container */}
      <div className="flex-1 flex flex-col bg-[#99D6CA]/40 dark:bg-slate-800/50 border border-[#E0F2F1] dark:border-white/10 rounded-[2rem] overflow-hidden shadow-sm p-4 lg:p-8 relative">


        {/* Messages List Area */}
        <div className="flex-1 overflow-y-auto px-4 lg:px-10 py-6 space-y-10 hide-scrollbar">
          {idsLoading || chatLoading ? (
            <div className="h-full flex flex-col items-center justify-center gap-4 opacity-50">
              <FiLoader className="animate-spin text-[#0B6A5A]" size={32} />
              <p className="font-bold text-sm uppercase tracking-widest text-[#0B6A5A]">Synchronizing history...</p>
            </div>
          ) : messages.length > 0 ? (
            messages.map((message) => {
              const isUser = message.sender === "user";
              return (
                <div key={message.id} className={`flex items-end gap-4 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
                  <div className="shrink-0 mb-1">
                    <div className="w-10 h-10 rounded-full border-2 border-white shadow-sm overflow-hidden bg-white/10 flex items-center justify-center">
                      <img
                        src={isUser ? getProfileImage(userDetails, null) : "https://randomuser.me/api/portraits/men/32.jpg"}
                        alt="avatar"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'block';
                        }}
                      />
                      <FiUser className="text-[#0B6A5A] hidden" size={20} />
                    </div>
                  </div>

                  <div className={`relative max-w-[80%] px-8 py-5 rounded-[2.5rem] shadow-sm font-medium leading-relaxed ${isUser
                    ? "bg-[#0B6A5A] text-white rounded-br-none"
                    : "bg-[#E0F7F6] dark:bg-slate-700 text-gray-800 dark:text-gray-100 rounded-bl-none border border-white/20"
                    }`}
                  >
                    {isUser ? (
                      <p className="text-sm font-bold tracking-tight">{message.text}</p>
                    ) : (
                      <div
                        className="text-sm font-bold tracking-tight chat-response"
                        dangerouslySetInnerHTML={{ __html: message.text }}
                      />
                    )}
                    <p className={`text-[10px] mt-2 opacity-40 font-bold uppercase ${isUser ? "text-right" : "text-left"}`}>
                      {message.timestamp}
                    </p>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="h-full flex flex-col items-center justify-center gap-6 text-center max-w-sm mx-auto">

              <div>
                <h3 className="text-xl font-bold text-[#0B6A5A] mb-2 font-heading">Start your healing session</h3>
                <p className="text-gray-500 font-medium text-sm">Every journey begins with a first message. How are you feeling today?</p>
              </div>
            </div>
          )}

          {(creatingChat || sendingToExisting) && (
            <div className="flex items-center gap-4 animate-fade-in">

              <div className="bg-[#E0F7F6] px-6 py-4 rounded-full shadow-inner border border-white/50">
                <TypingIndicator />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Bottom Input Area */}
        <div className="mt-6">
          <form
            onSubmit={handleSendMessage}
            className="group relative flex items-center bg-[#0B6A5A] dark:bg-slate-700 rounded-full p-2.5 shadow-xl border border-white/10 transition-all focus-within:ring-4 focus-within:ring-[#0B6A5A]/20"
          >
            <div className="flex-1 pl-6">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder={isTimeUp ? "Session time finished. Please conclude." : "Tell me what's on your mind..."}
                disabled={isTimeUp}
                className="w-full bg-transparent border-none focus:ring-0 text-white placeholder:text-white/60 font-bold text-sm py-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            <div className="flex items-center gap-2 pr-1">
              <button
                type="button"
                onClick={handleRecording}
                className={`p-3 rounded-full transition-colors ${recordingState ? "bg-red-500 text-white animate-pulse" : "bg-white/10 text-white hover:bg-white/20"}`}
              >
                <FiMic size={20} />
              </button>
              <button
                type="submit"
                disabled={!inputMessage.trim() || creatingChat || sendingToExisting || isTimeUp}
                className="bg-transparent text-[#1AC6A9] p-3 rounded-full hover:scale-110 active:scale-95 transition-all disabled:opacity-30"
              >
                {creatingChat || sendingToExisting ? <FiLoader className="animate-spin" size={20} /> : <FiSend size={28} />}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChatTherapy;
