import React, { useMemo, useState } from "react";
import { useGetAssessmentResultsQuery } from "../slices/assessment/assessmentApi";
import { useSelector } from "react-redux";
import { FiCheckCircle, FiActivity, FiTarget, FiCalendar, FiBookOpen, FiZap, FiChevronRight, FiLoader } from "react-icons/fi";

const TherapyPlan = () => {
  const theme = useSelector((state) => state.ui?.theme);
  const { data: assessmentRes, isLoading } = useGetAssessmentResultsQuery();

  const sessionInfo = assessmentRes?.session || {};
  const sessions = sessionInfo.sessions || [];
  const initialAssessment = assessmentRes?.initialAssessment || {};

  // Map habits from AI-generated details
  const [localHabits, setLocalHabits] = useState([]);

  // Initialize habits when data arrives
  React.useEffect(() => {
    if (initialAssessment.selfCareActivity?.details) {
      const mapped = initialAssessment.selfCareActivity.details.map((detail, idx) => ({
        id: idx,
        title: detail,
        completed: false,
        priority: idx === 0 ? "high" : idx === 1 ? "medium" : "low"
      }));
      setLocalHabits(mapped);
    }
  }, [initialAssessment]);

  const toggleHabit = (id) => {
    setLocalHabits(prev => prev.map(h => h.id === id ? { ...h, completed: !h.completed } : h));
  };

  const weeklyPlans = useMemo(() => {
    return sessions.map((s, idx) => {
      let statusDate = "Pending";
      if (s.isCompleted) {
        statusDate = s.completedAt ? new Date(s.completedAt).toLocaleDateString([], { month: 'short', day: 'numeric' }) : "Completed";
      } else if (s.scheduledAt) {
        statusDate = new Date(s.scheduledAt).toLocaleDateString([], { month: 'short', day: 'numeric' });
      }

      return {
        day: `Session ${idx + 1}`,
        focus: s.isCompleted ? "Goal Achieved" : (idx === sessions.findIndex(sec => !sec.isCompleted) ? "Current Active Focus" : "Future Strategy"),
        tasks: 1,
        completed: s.isCompleted ? 1 : 0,
        date: statusDate
      };
    });
  }, [sessions]);

  const overallProgress = useMemo(() => {
    if (!sessions.length) return 0;
    const completed = sessions.filter(s => s.isCompleted).length;
    return Math.round((completed / sessions.length) * 100);
  }, [sessions]);

  if (isLoading) {
    return (
      <div className={`h-[70vh] flex flex-col items-center justify-center gap-4 opacity-70 ${theme === 'dark' ? 'bg-slate-900' : ''}`}>
        <FiLoader className={`animate-spin ${theme === 'dark' ? 'text-customText' : 'text-[#0B6A5A]'}`} size={40} />
        <p className={`font-bold uppercase tracking-widest text-sm ${theme === 'dark' ? 'text-customText' : 'text-[#0B6A5A]'}`}>Refining your strategy...</p>
      </div>
    );
  }

  return (
    <div className={`space-y-8 pb-10 ${theme === 'dark' ? 'bg-slate-900' : ''}`}>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className={`text-3xl lg:text-4xl font-black font-heading mb-2 ${theme === 'dark' ? 'text-white' : 'text-[#0B6A5A]'}`}>
            Growth Strategy
          </h1>
          <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} font-medium`}>
            {initialAssessment.userName ? `Tailored roadmap for ${initialAssessment.userName}.` : "Your personalized path to mental wellness."}
          </p>
        </div>
      </div>

      {/* Progress Card */}
      <div className={`${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-[#E0F2F1]'} relative overflow-hidden rounded-3xl p-8 border shadow-sm`}>
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 md:gap-12">
          <div className="relative w-32 h-32 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="64"
                cy="64"
                r="58"
                strokeWidth="12"
                stroke={theme === 'dark' ? '#334155' : '#F1F5F9'}
                fill="transparent"
              />
              <circle
                cx="64"
                cy="64"
                r="58"
                strokeWidth="12"
                strokeDasharray={364.4}
                strokeDashoffset={364.4 * (1 - overallProgress / 100)}
                strokeLinecap="round"
                stroke={theme === 'dark' ? '#1AC6A9' : '#0B6A5A'}
                fill="transparent"
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`text-2xl font-black ${theme === 'dark' ? 'text-white' : 'text-[#0B6A5A]'}`}>{overallProgress}%</span>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Done</span>
            </div>
          </div>

          <div className="flex-1 space-y-4 text-center md:text-left">
            <div>
              <h2 className={`text-2xl font-bold font-heading ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>Session Completion</h2>
              <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} font-medium`}>
                You've attended {sessions.filter(s => s.isCompleted).length} out of {sessions.length} scheduled therapeutic milestones.
              </p>
            </div>
          </div>

          <button
            onClick={() => window.open('/chat', '_self')}
            className={`${theme === 'dark' ? 'bg-customText text-slate-900 border-none' : 'bg-[#0B6A5A] text-white hover:bg-[#085a4d]'} px-8 py-4 rounded-2xl font-black text-sm shadow-xl transition-all hover:scale-105 active:scale-95`}
          >
            Continue Journey
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Weekly Focus */}
        <div className="space-y-6">
          <h2 className={`text-2xl font-bold font-heading flex items-center gap-3 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
            <FiCalendar className={theme === 'dark' ? 'text-customText' : 'text-[#0B6A5A]'} />
            Journey Milestones
          </h2>
          <div className="grid grid-cols-1 gap-4">
            {weeklyPlans.map((plan, index) => (
              <div key={index} className={`${theme === 'dark' ? 'bg-slate-800 border-slate-700 hover:border-customText' : 'bg-white border-[#E0F2F1] hover:border-[#90D6CA]'} p-6 rounded-2xl border transition-all group cursor-default`}>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className={`font-extrabold ${theme === 'dark' ? 'text-customText' : 'text-[#0B6A5A]'}`}>{plan.day} - {plan.date}</h3>
                    <p className={`text-xs font-bold uppercase tracking-wider ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                      {plan.focus}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`text-lg font-black ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>{plan.completed}/1</span>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-none">Status</p>
                  </div>
                </div>
                <div className={`h-2 ${theme === 'dark' ? 'bg-slate-700' : 'bg-gray-50'} rounded-full overflow-hidden`}>
                  <div
                    className="h-full bg-gradient-to-r from-[#1AC6A9] to-[#0B6A5A] transition-all duration-500"
                    style={{ width: `${(plan.completed / 1) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Habits Checklist */}
        <div className="space-y-6">
          <h2 className={`text-2xl font-bold font-heading flex items-center gap-3 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
            <FiCheckCircle className={theme === 'dark' ? 'text-customText' : 'text-[#0B6A5A]'} />
            Personalized Daily Habits
          </h2>
          <div className={`${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-[#E0F2F1]'} rounded-3xl border p-6 lg:p-8 space-y-4`}>
            {localHabits.length > 0 ? localHabits.map((task) => (
              <div
                key={task.id}
                onClick={() => toggleHabit(task.id)}
                className={`group flex items-center gap-4 p-4 rounded-2xl border-2 transition-all cursor-pointer ${task.completed
                  ? "bg-slate-700/50 border-transparent opacity-60"
                  : theme === 'dark' ? "bg-slate-700/30 border-slate-600 hover:border-customText" : "bg-white border-gray-100 hover:border-[#90D6CA] hover:shadow-md"
                  }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${task.completed
                  ? "bg-[#0B6A5A] text-white"
                  : theme === 'dark' ? "bg-slate-700 text-gray-500" : "bg-gray-100 text-gray-300 group-hover:bg-[#E0F2F1] group-hover:text-[#0B6A5A]"
                  }`}>
                  {task.completed ? <FiCheckCircle size={20} /> : <div className="w-4 h-4 border-2 border-current rounded-full"></div>}
                </div>

                <div className="flex-1">
                  <p
                    className={`font-bold transition-all ${task.completed
                      ? "line-through text-gray-400"
                      : theme === 'dark' ? "text-gray-200" : "text-gray-800"
                      }`}
                  >
                    {task.title}
                  </p>
                </div>

                <div className={`px-3 py-1 text-[10px] rounded-full font-black uppercase tracking-widest ${task.priority === "high"
                  ? "bg-red-500/10 text-red-400"
                  : task.priority === "medium"
                    ? "bg-yellow-500/10 text-yellow-500"
                    : "bg-blue-500/10 text-blue-400"
                  }`}>
                  {task.priority}
                </div>
              </div>
            )) : (
              <div className="text-center py-10 opacity-50">
                <FiZap size={40} className="mx-auto mb-4" />
                <p className="font-bold">No active habits. Try generating your plan first!</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recommended Content */}
      <div className="space-y-6">
        <h2 className={`text-2xl font-bold font-heading ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>Self-Study Library</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { id: 1, title: "Building Boundaries", time: "12 min read", icon: FiBookOpen, color: theme === 'dark' ? "bg-slate-800 text-customText" : "bg-[#F0FDFA] text-[#0B6A5A]" },
            { id: 2, title: "Anxiety Management", time: "8 min video", icon: FiActivity, color: theme === 'dark' ? "bg-slate-800 text-customText" : "bg-[#F0FDFA] text-[#0B6A5A]" },
            { id: 3, title: "Mastering Mindfulness", time: "15 min audio", icon: FiZap, color: theme === 'dark' ? "bg-slate-800 text-customText" : "bg-[#F0FDFA] text-[#0B6A5A]" }
          ].map(item => (
            <div key={item.id} className={`${theme === 'dark' ? 'bg-slate-800 border-slate-700 hover:border-customText' : 'bg-white border-[#E0F2F1] hover:shadow-lg'} rounded-2xl p-6 border transition-all flex items-center gap-5 group cursor-pointer`}>
              <div className={`w-14 h-14 ${item.color} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                <item.icon size={28} />
              </div>
              <div className="flex-1">
                <h4 className={`font-extrabold leading-tight ${theme === 'dark' ? 'text-white' : 'text-[#0B6A5A]'}`}>{item.title}</h4>
                <p className="text-xs text-gray-400 font-bold uppercase mt-1">{item.time}</p>
              </div>
              <FiChevronRight className="text-gray-300 group-hover:text-[#0B6A5A] transition-colors" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TherapyPlan;
