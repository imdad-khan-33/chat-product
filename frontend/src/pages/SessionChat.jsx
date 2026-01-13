import { useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { useUpdateSessionProgressMutation, useLazyGetCurrentUserQuery } from "../slices/auth/authApi";
import { useSelector } from "react-redux";

const SessionChat = () => {
  const { sessionId } = useParams();
  const [completeSession, { isLoading }] = useUpdateSessionProgressMutation();
  const [currentUser] = useLazyGetCurrentUserQuery();
  const theme = useSelector((state) => state.ui.theme);

  const handleComplete = async () => {
    try {
      await completeSession().unwrap();
      toast.success("Session completed! Next session unlocked.");
      // Refresh user details to update sidebar locking
      currentUser();
    } catch (err) {
      console.error("Failed to complete session:", err);
      toast.error("Failed to complete session.");
    }
  };

  return (
    <div className={`p-8 h-full flex flex-col items-center justify-center ${theme === 'dark' ? 'bg-slate-900' : 'bg-[#FDFEFE]'}`}>
      <div className="max-w-2xl w-full text-center space-y-8">
        <div className={`${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-[#E0F7F6] border-[#bcece8]'} p-8 rounded-[2.5rem] shadow-sm border`}>
          <h1 className={`text-3xl font-black ${theme === 'dark' ? 'text-customText' : 'text-[#0B6A5A]'} font-heading mb-4`}>
            Session {sessionId}
          </h1>
          <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} mb-8 font-medium leading-relaxed`}>
            Welcome to your session. This is a dedicated space for your therapy journey.
            Currently, this is a placeholder for the actual session content (video/chat).
          </p>

          <div className="flex justify-center">
            <button
              onClick={handleComplete}
              disabled={isLoading}
              className={`${theme === 'dark' ? 'bg-customText text-slate-900 hover:bg-[#15a898]' : 'bg-[#0B6A5A] text-white hover:bg-[#095548]'} px-8 py-3 rounded-xl font-bold transition-all disabled:opacity-50 flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-1`}
            >
              {isLoading ? "Completing..." : "Complete Session & Unlock Next"}
            </button>
          </div>
          <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'} mt-4 font-bold uppercase tracking-wider`}>
            Click to simulate completing this session
          </p>
        </div>
      </div>
    </div>
  );
};

export default SessionChat;
