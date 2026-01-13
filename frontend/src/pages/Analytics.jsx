import React, { useMemo } from "react";
import { useSelector } from "react-redux";
import { useGetMoodHistoryQuery } from "../slices/mood/moodApi";
import { useGetAssessmentResultsQuery } from "../slices/assessment/assessmentApi";
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { FiTrendingUp, FiActivity, FiMessageSquare, FiCalendar, FiZap, FiLoader } from "react-icons/fi";

const Analytics = () => {
  const theme = useSelector((state) => state.ui.theme);
  // RTK Query hooks
  const { data: assessmentRes, isLoading: assessmentLoading } = useGetAssessmentResultsQuery();
  const { data: moodHistoryRes, isLoading: moodLoading } = useGetMoodHistoryQuery(30);

  const moodHistory = useMemo(() => moodHistoryRes?.data || [], [moodHistoryRes]);

  // Calculate Average Mood
  const avgMood = useMemo(() => {
    if (!moodHistory.length) return 0;
    const sum = moodHistory.reduce((acc, curr) => acc + curr.mood, 0);
    return (sum / moodHistory.length).toFixed(1);
  }, [moodHistory]);

  // Prepare Mood Trend Chart Data
  const moodTrendData = useMemo(() => {
    if (!moodHistory.length) return [];
    return [...moodHistory]
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .map(entry => ({
        date: new Date(entry.date).toLocaleDateString([], { month: 'short', day: 'numeric' }),
        mood: entry.mood
      }));
  }, [moodHistory]);

  // Progress Data - Based on session count vs total plan
  const therapyProgressData = useMemo(() => {
    const sessionInfo = assessmentRes?.session || {};
    const totalSessions = sessionInfo.sessions?.length || 4;

    // Sort completed sessions by date
    // Check both isCompleted and status to be safe against different schema versions/typos
    const completedSessions = (sessionInfo.sessions || [])
      .filter(s => (s.isCompleted || s.status === "completed") && (s.completedAt || s.isCompleted))
      .sort((a, b) => new Date(a.completedAt || 0) - new Date(b.completedAt || 0));

    // Start point: Assessment Creation Date
    const startDate = assessmentRes?.createdAt ? new Date(assessmentRes.createdAt) : new Date();

    const dataPoints = [
      { week: startDate.toLocaleDateString([], { month: 'short', day: 'numeric' }), progress: 0 }
    ];

    completedSessions.forEach((session, index) => {
      dataPoints.push({
        week: session.completedAt ? new Date(session.completedAt).toLocaleDateString([], { month: 'short', day: 'numeric' }) : "Recently",
        progress: Math.round(((index + 1) / totalSessions) * 100)
      });
    });

    // If no progress, show flat line
    if (dataPoints.length === 1) {
      dataPoints.push({ week: "Today", progress: 0 });
    }

    return dataPoints;
  }, [assessmentRes]);

  const globalProgress = useMemo(() => {
    const lastPoint = therapyProgressData[therapyProgressData.length - 1];
    return lastPoint ? lastPoint.progress.toFixed(0) : "0";
  }, [therapyProgressData]);

  const lastActiveDate = useMemo(() => {
    if (!moodHistory.length) return "N/A";
    return new Date(moodHistory[0].date).toLocaleDateString([], { month: 'short', day: 'numeric' });
  }, [moodHistory]);

  if (assessmentLoading || moodLoading) {
    return (
      <div className={`h-[60vh] flex flex-col items-center justify-center gap-4 ${theme === 'dark' ? 'bg-slate-950' : ''}`}>
        <FiLoader className={`animate-spin ${theme === 'dark' ? 'text-customText' : 'text-[#0B6A5A]'}`} size={40} />
        <p className={`font-bold uppercase tracking-widest ${theme === 'dark' ? 'text-customText' : 'text-[#0B6A5A]'}`}>Crunching your numbers...</p>
      </div>
    );
  }

  const completedCount = assessmentRes?.session?.sessions?.filter(s => s.isCompleted || s.status === "completed").length || 0;
  const totalCount = assessmentRes?.session?.sessions?.length || 0;

  return (
    <div className={`space-y-8 pb-10 ${theme === 'dark' ? 'bg-slate-950' : ''}`}>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className={`text-3xl lg:text-4xl font-black font-heading mb-2 ${theme === 'dark' ? 'text-white' : 'text-[#0B6A5A]'}`}>
            Insight Engine
          </h1>
          <p className={`font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Real-time data on your progress and emotional evolution.</p>
        </div>
        <div className="flex gap-2">
          <div className={`px-4 py-2 rounded-xl font-bold text-sm border shadow-sm flex items-center gap-2 ${theme === 'dark' ? 'bg-slate-800 border-slate-700 text-gray-400' : 'bg-white border-[#E0F2F1] text-gray-500'}`}>
            <FiCalendar />
            Live Analytics
          </div>
        </div>
      </div>

      {/* Key Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Sessions Status", value: `${completedCount}/${totalCount}`, icon: FiMessageSquare, color: theme === 'dark' ? "text-customText" : "text-white", bgColor: theme === 'dark' ? "bg-slate-800" : "bg-[#0B6A5A]" },
          { label: "Average Mood", value: avgMood, icon: FiActivity, color: theme === 'dark' ? "text-customText" : "text-white", bgColor: theme === 'dark' ? "bg-slate-800" : "bg-[#0B6A5A]" },
          { label: "Overall Progress", value: `${globalProgress}%`, icon: FiTrendingUp, color: theme === 'dark' ? "text-customText" : "text-white", bgColor: theme === 'dark' ? "bg-slate-800" : "bg-[#0B6A5A]" },
          { label: "Last Log", value: lastActiveDate, icon: FiZap, color: theme === 'dark' ? "text-customText" : "text-white", bgColor: theme === 'dark' ? "bg-slate-800" : "bg-[#0B6A5A]" }
        ].map((stat, i) => (
          <div key={i} className={`${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-[#E0F2F1]'} p-6 rounded-3xl shadow-sm border group hover:border-[#90D6CA] transition-colors relative overflow-hidden`}>
            <div className="relative z-10">
              <div className={`${stat.bgColor} ${stat.color} w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <stat.icon size={24} />
              </div>
              <p className={`font-bold text-xs uppercase tracking-widest mb-1 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>{stat.label}</p>
              <p className={`text-3xl font-black ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>{stat.value}</p>
            </div>
            <div className={`absolute -right-4 -bottom-4 w-20 h-20 ${stat.bgColor} opacity-20 rounded-full blur-2xl`}></div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-8">
        {/* Progress Chart Panel */}
        <div className="space-y-8">
          <div className={`${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-[#E0F2F1]'} rounded-3xl shadow-sm border p-8`}>
            <div className="flex items-center justify-between mb-10">
              <div>
                <h2 className={`text-2xl font-bold font-heading ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>Therapy Velocity</h2>
                <p className={`font-medium ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>Your overall milestone completion over time</p>
              </div>
              <div className="text-right">
                <span className={`text-3xl font-black ${theme === 'dark' ? 'text-customText' : 'text-[#0B6A5A]'}`}>{globalProgress}%</span>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Global Progress</p>
              </div>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={therapyProgressData}>
                  <defs>
                    <linearGradient id="colorProgress" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={theme === 'dark' ? "#1AC6A9" : "#0B6A5A"} stopOpacity={0.1} />
                      <stop offset="95%" stopColor={theme === 'dark' ? "#1AC6A9" : "#0B6A5A"} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme === 'dark' ? "#334155" : "#F1F5F9"} />
                  <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{ fill: "#94A3B8", fontSize: 12, fontWeight: 700 }} dy={10} />
                  <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fill: "#94A3B8", fontSize: 12, fontWeight: 700 }} dx={-10} />
                  <Tooltip
                    contentStyle={{ backgroundColor: theme === 'dark' ? '#1e293b' : '#fff', borderRadius: "16px", border: "none", boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)", padding: "12px" }}
                    labelStyle={{ color: '#94A3B8' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="progress"
                    stroke="#1AC6A9"
                    strokeWidth={4}
                    fillOpacity={1}
                    fill="url(#colorProgress)"
                    dot={{ fill: "#fff", stroke: "#1AC6A9", strokeWidth: 3, r: 6 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className={`${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-[#E0F2F1]'} rounded-3xl shadow-sm border p-8`}>
            <div className="flex items-center justify-between mb-10">
              <div>
                <h2 className={`text-2xl font-bold font-heading ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>Mood Spectrum</h2>
                <p className={`font-medium ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>Tracking your emotional health across entries</p>
              </div>
            </div>

            <div className="h-72 w-full">
              {moodTrendData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={moodTrendData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme === 'dark' ? "#334155" : "#F1F5F9"} />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: "#94A3B8", fontSize: 12, fontWeight: 700 }} dy={10} />
                    <YAxis domain={[0, 10]} axisLine={false} tickLine={false} tick={{ fill: "#94A3B8", fontSize: 12, fontWeight: 700 }} dx={-10} />
                    <Tooltip
                      contentStyle={{ backgroundColor: theme === 'dark' ? '#1e293b' : '#fff', borderRadius: "16px", border: "none", boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)", padding: "12px" }}
                      labelStyle={{ color: '#94A3B8' }}
                    />
                    <Line
                      type="monotone"
                      dataKey="mood"
                      stroke={theme === 'dark' ? "#1AC6A9" : "#0B6A5A"}
                      strokeWidth={4}
                      dot={{ fill: "#fff", stroke: "#1AC6A9", strokeWidth: 3, r: 6 }}
                      activeDot={{ r: 8, strokeWidth: 0, fill: "#0B6A5A" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-gray-300 gap-4">
                  <FiActivity size={48} className="opacity-20" />
                  <p className="font-bold text-sm">Log more moods to see your spectrum.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
