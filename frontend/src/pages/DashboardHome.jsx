import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useGetMoodHistoryQuery, useLogMoodMutation } from "../slices/mood/moodApi";
import { useGetAssessmentResultsQuery } from "../slices/assessment/assessmentApi";
import { useUpdateSessionProgressMutation } from "../slices/auth/authApi";

import { useSelector } from "react-redux";
import {
  FiSmile,
  FiMeh,
  FiFrown,
  FiArrowRight,
  FiMessageSquare,
  FiHeart,
  FiActivity,
  FiPieChart,
  FiZap,
  FiTrendingUp,
  FiCalendar,
  FiCheckCircle,
  FiLoader,
  FiStar
} from "react-icons/fi";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const DashboardHome = () => {
  const navigate = useNavigate();
  const theme = useSelector((state) => state.ui.theme);
  const user = useSelector((state) => state.auth.userDetails);

  const [todayMood, setTodayMood] = useState(7);

  // RTK Query hooks
  const { data: moodHistoryRes, isLoading: moodLoading } = useGetMoodHistoryQuery(7);
  const { data: assessmentRes, isLoading: assessmentLoading, refetch: refetchAssessment } = useGetAssessmentResultsQuery();
  const [logMood, { isLoading: logLoading }] = useLogMoodMutation();
  const [completeSession, { isLoading: completing }] = useUpdateSessionProgressMutation();

  const handleCompleteSession = async () => {
    try {
      if (!window.confirm("Are you sure you want to mark this session as complete?")) return;
      await completeSession().unwrap();
      // toast.success("Session completed! Great progress!");
      refetchAssessment();
    } catch (err) {
      console.error(err);
      const errorMessage = err?.data?.message || err?.error || "Failed to complete session.";
      toast.error(errorMessage);
    }
  };

  const moodHistory = useMemo(() => {
    if (!moodHistoryRes?.data) return [];
    return [...moodHistoryRes.data]
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .map(entry => ({
        day: new Date(entry.date).toLocaleDateString([], { weekday: 'short' }),
        mood: entry.mood
      }));
  }, [moodHistoryRes]);

  const avgMood = useMemo(() => {
    if (!moodHistoryRes?.data?.length) return 0;
    const sum = moodHistoryRes.data.reduce((acc, curr) => acc + curr.mood, 0);
    return (sum / moodHistoryRes.data.length).toFixed(1);
  }, [moodHistoryRes]);

  const getMoodEmoji = (mood) => {
    if (mood <= 3) return <FiFrown className="text-4xl text-[#10B981]" />;
    if (mood <= 6) return <FiMeh className="text-4xl text-[#10B981]" />;
    return <FiSmile className="text-4xl text-[#10B981]" />;
  };

  const handleSaveMood = async () => {
    try {
      await logMood({ mood: todayMood }).unwrap();
      toast.success("Mood logged successfully!");
    } catch {
      toast.error("Failed to log mood.");
    }
  };

  const quickActions = [
    { icon: FiMessageSquare, label: "Start Chat", path: "/chat", color: "bg-[#E0F2F1]", iconColor: "text-[#00796B]" },
    { icon: FiHeart, label: "Mood Tracker", path: "/mood", color: "bg-[#E0F2F1]", iconColor: "text-[#00796B]" },
    { icon: FiActivity, label: "Therapy Plan", path: "/therapy-plan", color: "bg-[#E0F2F1]", iconColor: "text-[#00796B]" },
    { icon: FiPieChart, label: "Analytics", path: "/analytics", color: "bg-[#E0F2F1]", iconColor: "text-[#00796B]" },
  ];

  const globalProgress = useMemo(() => {
    const sessionInfo = assessmentRes?.session || {};
    const total = sessionInfo.sessions?.length || 4;
    // Robust check for completed sessions
    const completed = sessionInfo.sessions?.filter(s => s.isCompleted || s.status === "completed").length || 0;
    return Math.round((completed / total) * 100);
  }, [assessmentRes]);

  if (moodLoading || assessmentLoading) {
    return (
      <div className={`h-[70vh] flex flex-col items-center justify-center gap-4 opacity-70 ${theme === 'dark' ? 'bg-slate-900' : ''}`}>
        <FiLoader className={`animate-spin ${theme === 'dark' ? 'text-customText' : 'text-[#0B6A5A]'}`} size={40} />
        <p className={`font-bold uppercase tracking-widest text-sm ${theme === 'dark' ? 'text-customText' : 'text-[#0B6A5A]'}`}>Loading your world...</p>
      </div>
    );
  }

  return (
    <div className={`space-y-8 pb-10 ${theme === 'dark' ? 'bg-slate-900' : ''}`}>
      {/* Welcome Section */}
      <div className={`relative overflow-hidden ${theme === 'dark' ? 'bg-gradient-to-r from-slate-800 to-slate-700' : 'bg-gradient-to-r from-[#0B6A5A] to-[#1AC6A9]'} rounded-[2rem] p-8 lg:p-12 text-white shadow-xl transition-all duration-300`}>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold uppercase tracking-wider mb-4">

              <span>Personalized Care</span>
            </div>
            <h2 className="text-4xl lg:text-5xl font-extrabold font-heading mb-4">Welcome Back!</h2>

            <div className="flex flex-wrap gap-4">
              <div className="px-5 py-2.5 bg-white/10 hover:bg-white/20 transition-colors border border-white/20 rounded-xl font-bold text-sm flex items-center gap-3">
                <div>
                  Next Session: {assessmentRes?.session?.nextSessionDate ? new Date(assessmentRes.session.nextSessionDate).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : "All caught up!"}
                </div>
                {assessmentRes?.session?.nextSessionDate && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => navigate("/chat")}
                      className="bg-white text-[#0B6A5A] px-3 py-1 rounded-lg text-xs font-bold hover:bg-gray-100 flex items-center gap-1 shadow-sm"
                    >
                      Start Session <FiMessageSquare />
                    </button>
                    <button
                      onClick={handleCompleteSession}
                      disabled={completing}
                      className="bg-[#0B6A5A] text-white px-3 py-1 rounded-lg text-xs font-bold hover:bg-[#095548] flex items-center gap-1 shadow-sm disabled:opacity-50"
                    >
                      {completing ? <FiLoader className="animate-spin" /> : <FiCheckCircle />} Mark Complete
                    </button>
                  </div>
                )}
              </div>
              {user?.badges?.length > 0 && (
                <div className="px-5 py-2.5 bg-yellow-400/20 border border-yellow-400/50 rounded-xl font-bold text-sm flex items-center gap-2">
                  <FiStar className="text-yellow-400 fill-yellow-400" />
                  {user.badges.length} Badges Earned
                </div>
              )}
            </div>
          </div>
          <div className="hidden lg:block">
            <div className="w-48 h-48 bg-white/10 rounded-full flex items-center justify-center animate-pulse">
              <FiActivity size={80} className="text-white/20" />
            </div>
          </div>
        </div>
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -ml-10 -mb-10 w-40 h-40 bg-black/10 rounded-full blur-2xl"></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Today's Mood Section */}
        <div className="lg:col-span-2">
          <div className={`${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-[#E0F2F1]'} rounded-3xl shadow-sm border p-8 h-full transition-all duration-300`}>
            <div className="flex items-center justify-between mb-8">
              <h3 className={`text-2xl font-bold font-heading ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>How's your mood?</h3>
              <div className={`p-3 ${theme === 'dark' ? 'bg-slate-700 border-slate-600 text-gray-300' : 'bg-gray-50 border-gray-100 text-gray-500'} rounded-2xl border flex items-center gap-2 font-bold text-sm`}>
                <FiCalendar />
                {new Date().toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
              </div>
            </div>

            <div className="flex flex-col md:flex-row items-center gap-10">
              <div className="flex-1 w-full space-y-8">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className={`text-5xl font-black ${theme === 'dark' ? 'text-customText' : 'text-[#0B6A5A]'}`}>{todayMood}</span>
                    <span className={`font-bold text-sm uppercase tracking-widest mt-1 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>out of 10</span>
                  </div>
                  <div className={`w-20 h-20 ${theme === 'dark' ? 'bg-slate-700 border-slate-600' : 'bg-[#F0FDFA] border-[#CCFBF1]'} rounded-[2rem] flex items-center justify-center shadow-inner border`}>
                    {getMoodEmoji(todayMood)}
                  </div>
                </div>

                <div className="space-y-4">
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={todayMood}
                    onChange={(e) => setTodayMood(parseInt(e.target.value))}
                    className={`w-full h-3 ${theme === 'dark' ? 'bg-slate-700' : 'bg-gray-100'} rounded-full appearance-none cursor-pointer accent-[#0B6A5A] transition-all hover:h-4 focus:ring-4 focus:ring-[#0B6A5A]/10`}
                  />
                  <div className="flex justify-between px-2">
                    <span className="flex flex-col items-center">
                      <FiFrown className="text-gray-300" />
                      <span className="text-[10px] font-bold text-gray-400 mt-1 uppercase">Struggling</span>
                    </span>
                    <span className="flex flex-col items-center">
                      <FiMeh className="text-gray-300" />
                      <span className="text-[10px] font-bold text-gray-400 mt-1 uppercase">Neutral</span>
                    </span>
                    <span className="flex flex-col items-center">
                      <FiSmile className="text-gray-300" />
                      <span className="text-[10px] font-bold text-gray-400 mt-1 uppercase">Thriving</span>
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleSaveMood}
                  disabled={logLoading}
                  className={`w-full ${theme === 'dark' ? 'bg-customText text-slate-900 hover:bg-[#15a898]' : 'bg-[#0B6A5A] text-white hover:bg-[#085a4d]'} py-4 rounded-2xl font-bold text-lg transition-all shadow-lg hover:shadow-[#0B6A5A]/30 flex items-center justify-center gap-2 group disabled:opacity-50`}
                >
                  {logLoading ? <FiLoader className="animate-spin" /> : <>Log Today's Mood <FiArrowRight className="group-hover:translate-x-1 transition-transform" /></>}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Column */}
        <div className="grid grid-cols-1 gap-6 h-full">
          {[
            { label: "Planned Sessions", value: assessmentRes?.session?.sessions?.length || 0, icon: FiMessageSquare, color: "text-[#00796B]", bgColor: "bg-[#E0F2F1]" },
            { label: "Average Mood", value: avgMood, icon: FiTrendingUp, color: "text-[#00796B]", bgColor: "bg-[#E0F2F1]" },
            { label: "Overall Progress", value: `${globalProgress}%`, icon: FiZap, color: "text-[#00796B]", bgColor: "bg-[#E0F2F1]" }
          ].map((stat, i) => (
            <div key={i} className={`${theme === 'dark' ? 'bg-slate-800 border-slate-700 hover:border-customText' : 'bg-white border-[#E0F2F1] hover:border-[#90D6CA]'} p-6 rounded-3xl shadow-sm border flex items-center justify-between group transition-all duration-300`}>
              <div className="space-y-1">
                <p className={`font-bold text-xs uppercase tracking-widest ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>{stat.label}</p>
                <p className={`text-3xl font-black ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>{stat.value}</p>
              </div>
              <div className={`${theme === 'dark' ? 'bg-slate-700 text-customText' : stat.bgColor + ' ' + stat.color} p-4 rounded-2xl shadow-sm group-hover:scale-110 transition-transform`}>
                <stat.icon size={28} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions Grid */}
      <div className="space-y-6">
        <h3 className={`text-2xl font-bold font-heading ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>Quick Actions</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {quickActions.map((action, idx) => {
            const Icon = action.icon;
            return (
              <button
                key={idx}
                onClick={() => navigate(action.path)}
                className={`${theme === 'dark' ? 'bg-slate-800 border-slate-700 hover:border-customText' : 'bg-white border-[#E0F2F1] hover:border-[#90D6CA]'} border rounded-3xl p-6 hover:shadow-xl transition-all group text-left relative overflow-hidden`}
              >
                <div className={`${theme === 'dark' ? 'bg-slate-700 text-customText' : action.color + ' ' + action.iconColor} w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <Icon size={32} />
                </div>
                <div className="space-y-1">
                  <p className={`font-black text-lg leading-tight ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>{action.label}</p>
                  <p className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1 transition-colors ${theme === 'dark' ? 'text-gray-500 group-hover:text-customText' : 'text-gray-400 group-hover:text-[#0B6A5A]'}`}>
                    Access Now <FiArrowRight />
                  </p>
                </div>
                <div className={`absolute -right-4 -bottom-4 w-20 h-20 ${theme === 'dark' ? 'bg-customText/20' : action.color} opacity-40 rounded-full blur-2xl group-hover:scale-150 transition-transform`}></div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Weekly Mood Trend */}
      <div className={`${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-[#E0F2F1]'} rounded-3xl shadow-sm border p-8`}>
        <div className="flex items-center justify-between mb-10">
          <div>
            <h3 className={`text-2xl font-bold font-heading ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>Weekly Insights</h3>
            <p className={`font-medium ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>Your emotional landscape over the last few logs</p>
          </div>
          <button
            onClick={() => navigate("/analytics")}
            className={`flex items-center gap-2 font-bold text-sm px-4 py-2 rounded-xl border transition-colors ${theme === 'dark' ? 'text-customText bg-slate-700 border-slate-600 hover:bg-slate-600' : 'text-[#0B6A5A] bg-[#F0FDFA] border-[#90D6CA] hover:bg-white'}`}
          >
            View Reports <FiTrendingUp />
          </button>
        </div>

        <div className="h-80 w-full">
          {moodHistory.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={moodHistory}>
                <defs>
                  <linearGradient id="colorMood" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1AC6A9" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#1AC6A9" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis
                  dataKey="day"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#94A3B8", fontSize: 12, fontWeight: 700 }}
                  dy={10}
                />
                <YAxis
                  domain={[0, 10]}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#94A3B8", fontSize: 12, fontWeight: 700 }}
                  dx={-10}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "none",
                    borderRadius: "16px",
                    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                    padding: "12px"
                  }}
                  itemStyle={{ color: "#0B6A5A", fontWeight: 800 }}
                  labelStyle={{ color: "#94A3B8", fontWeight: 700, marginBottom: "4px" }}
                />
                <Area
                  type="monotone"
                  dataKey="mood"
                  stroke="#1AC6A9"
                  strokeWidth={4}
                  fillOpacity={1}
                  fill="url(#colorMood)"
                  dot={{ fill: "#fff", stroke: "#1AC6A9", strokeWidth: 3, r: 6 }}
                  activeDot={{ r: 8, strokeWidth: 0, fill: "#0B6A5A" }}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex flex-col items-center justify-center opacity-40">
              <FiTrendingUp size={64} className="text-[#0B6A5A] mb-4" />
              <p className="font-bold text-sm uppercase tracking-widest">Connect with your feelings to see trends.</p>
            </div>
          )}
        </div>
      </div>

      {/* Continue Session Banner */}
      <div className={`${theme === 'dark' ? 'bg-slate-800 border border-slate-700' : 'bg-[#0B6A5A]'} rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden group transition-all duration-300`}>
        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="text-center lg:text-left">
            <h3 className="text-3xl font-black text-white mb-3">Resume Your Growth</h3>
            <p className="text-white/70 text-lg leading-relaxed mb-0 font-medium max-w-lg">
              Consistency is key to positive change. Take a moment to check in with your AI therapist today.
            </p>
          </div>
          <button
            onClick={() => navigate("/chat")}
            className={`group flex items-center gap-3 ${theme === 'dark' ? 'bg-customText text-slate-900' : 'bg-white text-[#0B6A5A]'} px-10 py-5 rounded-2xl font-black text-xl hover:shadow-[0_0_30px_rgba(255,255,255,0.3)] transition-all hover:-translate-y-1 active:scale-95`}
          >
            Enter Chat Space <FiArrowRight className="group-hover:translate-x-2 transition-transform" />
          </button>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-white/10 transition-colors"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#1AC6A9]/30 rounded-full ml-10 mb-10 blur-2xl"></div>
      </div>
    </div>
  );
};

export default DashboardHome;
