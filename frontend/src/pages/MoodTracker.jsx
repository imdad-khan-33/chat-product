import React, { useState, useMemo } from "react";
import toast from "react-hot-toast";
import { useGetMoodHistoryQuery, useLogMoodMutation, useGetMoodAnalysisQuery } from "../slices/mood/moodApi";
import Slider from "../components/commonComponents/Slider";
import { FiSmile, FiMeh, FiFrown, FiStar, FiCalendar, FiTrendingUp, FiCheckCircle, FiLoader, FiZap, FiActivity, FiLifeBuoy, FiAlertCircle } from "react-icons/fi";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useSelector, useDispatch } from "react-redux";

const MoodTracker = () => {
  const [todayMood, setTodayMood] = useState(7);
  const [moodNote, setMoodNote] = useState("");
  const [tab, setTab] = useState("weekly");

  const user = useSelector((state) => state.auth.userDetails);

  // RTK Query hooks
  const { data: historyRes, isLoading: historyLoading } = useGetMoodHistoryQuery(30);
  const { data: analysisRes, isLoading: analysisLoading } = useGetMoodAnalysisQuery();
  const [logMood, { isLoading: logLoading }] = useLogMoodMutation();

  const moodHistory = useMemo(() => historyRes?.data || [], [historyRes]);
  const aiAnalysis = useMemo(() => analysisRes?.data || null, [analysisRes]);

  const moodLevels = [
    { level: 1, label: "Very Sad", icon: FiFrown, color: "text-[#EF4444]", bgColor: "bg-red-50" },
    { level: 3, label: "Sad", icon: FiFrown, color: "text-[#F59E0B]", bgColor: "bg-orange-50" },
    { level: 5, label: "Neutral", icon: FiMeh, color: "text-[#6B7280]", bgColor: "bg-gray-50" },
    { level: 7, label: "Good", icon: FiSmile, color: "text-[#00796B]", bgColor: "bg-[#E0F2F1]" },
    { level: 9, label: "Thriving", icon: FiStar, color: "text-[#5B21B6]", bgColor: "bg-purple-50" },
  ];

  const getMoodConfig = (level) => {
    if (level <= 2) return moodLevels[0];
    if (level <= 4) return moodLevels[1];
    if (level <= 6) return moodLevels[2];
    if (level <= 8) return moodLevels[3];
    return moodLevels[4];
  };

  // Prepare chart data from real history
  const chartData = useMemo(() => {
    if (!moodHistory.length) return [];

    // Sort by date ascending for the chart
    const sorted = [...moodHistory].sort((a, b) => new Date(a.date) - new Date(b.date));

    return sorted.map(entry => ({
      name: new Date(entry.date).toLocaleDateString([], { weekday: 'short', day: 'numeric' }),
      mood: entry.mood,
      date: entry.date
    }));
  }, [moodHistory]);

  const dispatch = useDispatch();

  const handleSaveMood = async () => {
    try {
      const response = await logMood({
        mood: todayMood,
        note: moodNote
      }).unwrap();

      // Update global user state with new streak and badges
      if (response.data?.streak !== undefined) {
        const updatedUser = { ...user, streak: response.data.streak, badges: response.data.badges };
        dispatch({ type: 'auth/setUserDetails', payload: updatedUser });
      }

      toast.success("Mood recorded! You're doing great.");
      setMoodNote("");
    } catch (error) {
      console.error("Mood log error:", error);
      toast.error("Failed to save mood. Please try again.");
    }
  };

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl lg:text-4xl font-black text-[#0B6A5A] font-heading mb-2">
            Emotional Journey
          </h1>
          <p className="text-gray-500 font-medium">Track your patterns, understand your emotions.</p>
        </div>

        <div className="flex items-center gap-4">
          {/* Streak Badge */}
          {/* <div className="flex items-center gap-2 px-5 py-2.5 bg-orange-50 border border-orange-200 rounded-2xl animate-bounce-slow">
            <FiZap className="text-orange-500 fill-orange-500" />
            <span className="text-orange-700 font-black text-sm">{user?.streak || 0}-Day Streak</span>
          </div> */}

          {/* <div className="flex gap-2 p-1 bg-gray-100 rounded-2xl w-fit">
            <button
              onClick={() => setTab("weekly")}
              className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${tab === "weekly"
                ? "bg-white text-[#0B6A5A] shadow-md"
                : "text-gray-500 hover:text-gray-700"
                }`}
            >
              Pattern
            </button>
          </div> */}
        </div>
      </div>

      {/* AI Insights Section */}
      {aiAnalysis && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 bg-gradient-to-br from-[#0B6A5A] to-[#085a4d] rounded-3xl p-8 text-white shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
              <FiStar size={120} />
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-white/20 p-2 rounded-lg backdrop-blur-md">
                  <FiActivity className="text-white" size={20} />
                </div>
                <span className="text-xs font-black uppercase tracking-widest text-[#1AC6A9]">AI Perspective</span>
              </div>
              <h2 className="text-2xl font-bold mb-4 font-heading">{aiAnalysis.summary}</h2>
              <p className="text-white/80 font-medium leading-relaxed italic border-l-4 border-[#1AC6A9] pl-6 py-2">
                "{aiAnalysis.analysis}"
              </p>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-[#E0F2F1] p-8 shadow-sm">
            <h3 className="text-lg font-black text-gray-800 mb-6 flex items-center gap-2">
              <FiZap className="text-[#0B6A5A]" /> Actionable Tips
            </h3>
            <div className="space-y-4">
              {aiAnalysis.tips?.map((tip, i) => (
                <div key={i} className="flex gap-3">
                  <div className="mt-1">
                    <FiCheckCircle className="text-[#1AC6A9]" />
                  </div>
                  <p className="text-sm font-bold text-gray-600">{tip}</p>
                </div>
              ))}
              {aiAnalysis.triggers?.length > 0 && (
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">Watch out for:</p>
                  <div className="flex flex-wrap gap-2">
                    {aiAnalysis.triggers.map((t, i) => (
                      <span key={i} className="px-3 py-1 bg-red-50 text-red-500 rounded-full text-[10px] font-black">{t}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Tracker Panel */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl shadow-sm border border-[#E0F2F1] p-8 space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-800 font-heading">How are you feeling right now?</h2>
              <div className="px-4 py-2 bg-[#F0FDFA] rounded-xl text-[#0B6A5A] font-bold text-sm border border-[#0B6A5A]">
                Today's Log
              </div>
            </div>

            <div className="py-4">
              <Slider
                min={1}
                max={10}
                value={todayMood}
                onChange={setTodayMood}
              />
              <div className="flex justify-between mt-4">
                <div className="text-center group">
                  <div className="w-12 h-12 bg-red-50 text-[#0B6A5A] rounded-xl flex items-center justify-center mb-2 group-hover:scale-110 transition-transform"><FiFrown size={24} /></div>
                  <span className="text-[10px] font-bold text-black uppercase">Intense</span>
                </div>
                <div className="text-center group">
                  <div className="w-12 h-12 bg-gray-50 text-[#0B6A5A] rounded-xl flex items-center justify-center mb-2 group-hover:scale-110 transition-transform"><FiMeh size={24} /></div>
                  <span className="text-[10px] font-bold text-black uppercase">Steady</span>
                </div>
                <div className="text-center group">
                  <div className="w-12 h-12 bg-[#F0FDFA] text-[#0B6A5A] rounded-xl flex items-center justify-center mb-2 group-hover:scale-110 transition-transform"><FiSmile size={24} /></div>
                  <span className="text-[10px] font-bold text-black uppercase">Radiant</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <textarea
                value={moodNote}
                onChange={(e) => setMoodNote(e.target.value)}
                placeholder="Any thoughts or triggers you'd like to note? (Optional)"
                className="w-full h-24 p-4 rounded-2xl bg-gray-50 border border-transparent focus:bg-white focus:border-[#CCFBF1] focus:ring-4 focus:ring-[#F0FDFA] transition-all text-sm font-medium resize-none"
              />
            </div>

            <button
              onClick={handleSaveMood}
              disabled={logLoading}
              className="w-full bg-[#0B6A5A] text-white py-5 rounded-2xl font-black text-xl hover:bg-[#085a4d] shadow-xl hover:shadow-[#0B6A5A]/30 transition-all active:scale-95 flex items-center justify-center gap-3 disabled:opacity-70"
            >
              {logLoading ? <FiLoader className="animate-spin" /> : <>Log Entry <FiCheckCircle /></>}
            </button>
          </div>

          {/* Chart Card */}
          <div className="bg-white rounded-3xl shadow-sm border border-[#E0F2F1] p-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-bold text-gray-800 font-heading">Mood Trend Analysis</h2>
              <div className="flex items-center gap-2 text-[#0B6A5A] font-bold text-sm">
                <FiTrendingUp />
                Last {chartData.length} entries
              </div>
            </div>

            <div className="h-64 w-full">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#94A3B8", fontSize: 10, fontWeight: 700 }} />
                    <YAxis domain={[0, 10]} axisLine={false} tickLine={false} tick={{ fill: "#94A3B8", fontSize: 12, fontWeight: 700 }} />
                    <Tooltip contentStyle={{ borderRadius: "16px", border: "none", boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" }} />
                    <Line
                      type="monotone"
                      dataKey="mood"
                      stroke="#0B6A5A"
                      strokeWidth={4}
                      dot={{ fill: "#fff", stroke: "#0B6A5A", strokeWidth: 3, r: 6 }}
                      animationDuration={1500}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-gray-400 gap-4">
                  <FiTrendingUp size={48} className="opacity-20" />
                  <p className="font-bold text-sm">Not enough data to map trends yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar Panel */}
        <div className="space-y-6">
          {/* Badges Section */}
          {user?.badges?.length > 0 && (
            <div className="bg-white rounded-3xl shadow-sm border border-[#E0F2F1] p-8">
              <h2 className="text-xl font-bold text-gray-800 font-heading mb-6">Your Badges</h2>
              <div className="flex flex-wrap gap-4">
                {user.badges.map((badge, i) => (
                  <div key={i} className="group relative" title={badge.description}>
                    <div className="w-14 h-14 bg-yellow-50 rounded-2xl flex items-center justify-center text-yellow-600 border border-yellow-100 hover:scale-110 transition-transform cursor-help">
                      <FiStar size={24} />
                    </div>
                    <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full">New</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* History List */}
          <div className="bg-white rounded-3xl shadow-sm border border-[#E0F2F1] p-8 max-h-[600px] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between mb-6 shrink-0">
              <h2 className="text-xl font-bold text-gray-800 font-heading">History</h2>
              <FiCalendar className="text-gray-400" />
            </div>

            <div className="space-y-4 overflow-y-auto pr-2 hide-scrollbar flex-1">
              {historyLoading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                  <FiLoader className="animate-spin text-[#0B6A5A]" size={32} />
                  <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Gathering history...</p>
                </div>
              ) : moodHistory.length > 0 ? (
                moodHistory.map((entry, index) => {
                  const config = getMoodConfig(entry.mood);
                  const Icon = config.icon;
                  return (
                    <div
                      key={entry._id || index}
                      className="group flex flex-col p-4 bg-gray-50/50 rounded-2xl border border-transparent hover:border-[#90D6CA] hover:bg-white transition-all cursor-default"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-xl bg-white border border-gray-100 flex items-center justify-center group-hover:shadow-md transition-shadow`}>
                            <Icon className={`text-xl ${config.color}`} />
                          </div>
                          <div>
                            <p className="font-extrabold text-[#0B6A5A] text-sm">
                              {new Date(entry.date).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                            </p>
                            <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">{config.label} • {entry.mood}/10</p>
                          </div>
                        </div>
                      </div>
                      {entry.note && (
                        <p className="mt-3 text-[11px] text-gray-500 italic font-medium bg-white/50 p-2 rounded-lg border border-gray-100">
                          {entry.note}
                        </p>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-20">
                  <p className="text-gray-400 font-bold text-sm">No entries logged yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MoodTracker;
