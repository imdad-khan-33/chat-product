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
  const [selectedResource, setSelectedResource] = useState(null);

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
        <div className="flex items-center justify-between">
          <h2 className={`text-2xl font-black font-heading ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>Self-Study Library</h2>
          <span className={`text-xs font-bold uppercase tracking-widest ${theme === 'dark' ? 'text-customText' : 'text-[#0B6A5A]'}`}>2 Resources Available</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              id: 1,
              title: "Building Boundaries",
              time: "12 min read",
              type: "read",
              icon: FiBookOpen,
              color: theme === 'dark' ? "bg-gradient-to-br from-teal-500/20 to-emerald-500/20 text-customText" : "bg-[#F0FDFA] text-[#0B6A5A]",
              content: "Boundaries are the limits and rules we set for ourselves within relationships. A person with healthy boundaries can say 'no' to others when they want to, but they are also comfortable opening themselves up to intimacy and close relationships..."
            },
            {
              id: 2,
              title: "Anxiety Management",
              time: "8 min video",
              type: "video",
              icon: FiActivity,
              color: theme === 'dark' ? "bg-gradient-to-br from-blue-500/20 to-teal-500/20 text-customText" : "bg-[#F0FDFA] text-[#0B6A5A]",
              content: "In this session, we explore the 5-4-3-2-1 technique for grounding during high anxiety. Identify 5 things you can see, 4 things you can touch, 3 things you can hear, 2 things you can smell, and 1 thing you can taste...",
              videoUrl: "https://www.youtube.com/embed/EM7r6RWo-z0"
            }
          ].map(item => (
            <div
              key={item.id}
              onClick={() => setSelectedResource(item)}
              className={`${theme === 'dark' ? 'bg-slate-800/40 backdrop-blur-md border-slate-700 hover:border-customText/50 hover:shadow-2xl hover:shadow-customText/10' : 'bg-white border-[#E0F2F1] hover:shadow-xl'} rounded-[2rem] p-6 border transition-all flex items-center gap-5 group cursor-pointer relative overflow-hidden`}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-customText/0 to-customText/5 opacity-0 group-hover:opacity-100 transition-opacity" />

              <div className={`w-14 h-14 ${item.color} rounded-2xl flex items-center justify-center group-hover:rotate-6 transition-all duration-300 relative z-10`}>
                <item.icon size={28} />
              </div>
              <div className="flex-1 relative z-10">
                <h4 className={`font-black leading-tight text-lg ${theme === 'dark' ? 'text-white' : 'text-[#0B6A5A]'}`}>{item.title}</h4>
                <p className={`text-[10px] font-black uppercase mt-1 tracking-widest ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>{item.time}</p>
              </div>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all relative z-10 ${theme === 'dark' ? 'bg-slate-700/50 group-hover:bg-customText group-hover:text-slate-900' : 'bg-gray-50 group-hover:bg-[#0B6A5A] group-hover:text-white'}`}>
                <FiChevronRight size={20} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Resource Modal */}
      {selectedResource && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={() => setSelectedResource(null)} />
          <div className={`relative w-full max-w-2xl ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-white'} rounded-[2.5rem] shadow-2xl overflow-hidden border animate-in fade-in zoom-in duration-300`}>
            {/* Modal Header */}
            <div className={`p-8 pb-0 flex justify-between items-start`}>
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 ${selectedResource.color} rounded-xl flex items-center justify-center`}>
                  <selectedResource.icon size={24} />
                </div>
                <div>
                  <h3 className={`text-2xl font-black ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>{selectedResource.title}</h3>
                  <p className="text-[10px] font-black text-customText uppercase tracking-[0.2em]">{selectedResource.time}</p>
                </div>
              </div>
              <button onClick={() => setSelectedResource(null)} className={`p-2 rounded-full ${theme === 'dark' ? 'bg-slate-800 text-gray-400 hover:text-white' : 'bg-gray-100 text-gray-500 hover:text-gray-800'}`}>
                <FiChevronRight className="rotate-90" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-8">
              {selectedResource.type === 'read' && (
                <div className={`space-y-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} leading-relaxed font-medium`}>
                  <p className="first-letter:text-5xl first-letter:font-black first-letter:text-customText first-letter:mr-3 first-letter:float-left">
                    {selectedResource.content}
                  </p>
                  <p>This is a foundational concept in your therapeutic journey. By understanding where you end and others begin, you reclaim your emotional energy.</p>
                </div>
              )}

              {selectedResource.type === 'video' && (
                <div className="space-y-6">
                  <div className="aspect-video bg-slate-800 rounded-3xl overflow-hidden border-4 border-slate-700/50 shadow-2xl">
                    {selectedResource.videoUrl ? (
                      <iframe
                        width="100%"
                        height="100%"
                        src={selectedResource.videoUrl}
                        title="YouTube video player"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                      ></iframe>
                    ) : (
                      <div className="flex items-center justify-center h-full group cursor-pointer relative">
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        <div className="w-20 h-20 bg-customText rounded-full flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform relative z-10">
                          <div className="w-0 h-0 border-t-[10px] border-t-transparent border-l-[18px] border-l-slate-900 border-b-[10px] border-b-transparent ml-1" />
                        </div>
                        <p className="absolute bottom-6 left-6 text-white font-black uppercase tracking-widest text-xs z-10">Click to Play Session</p>
                      </div>
                    )}
                  </div>
                  <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} italic text-sm leading-relaxed`}>
                    {selectedResource.content}
                  </p>
                </div>
              )}

              {selectedResource.type === 'audio' && (
                <div className="space-y-6">
                  <div className={`${theme === 'dark' ? 'bg-slate-800' : 'bg-slate-50'} p-8 rounded-[2rem] border border-dashed ${theme === 'dark' ? 'border-slate-700' : 'border-slate-200'}`}>
                    <div className="flex items-center gap-6 mb-8">
                      <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg animate-pulse">
                        <FiZap className="text-white" size={32} />
                      </div>
                      <div className="flex-1 space-y-2">
                        <div className="h-1 bg-customText w-full rounded-full opacity-20" />
                        <div className="h-1 bg-customText w-3/4 rounded-full" />
                        <div className="h-1 bg-customText w-1/2 rounded-full opacity-20" />
                      </div>
                    </div>
                    <div className="flex justify-center gap-8">
                      <div className="w-12 h-12 rounded-full border border-gray-100 flex items-center justify-center text-gray-400">-15s</div>
                      <div className="w-16 h-16 bg-customText rounded-full flex items-center justify-center text-slate-900 shadow-xl"><FiZap size={24} /></div>
                      <div className="w-12 h-12 rounded-full border border-gray-100 flex items-center justify-center text-gray-400">+15s</div>
                    </div>
                  </div>
                  <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} text-center font-bold text-sm`}>
                    {selectedResource.content}
                  </p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className={`p-8 pt-0`}>
              <button
                onClick={() => setSelectedResource(null)}
                className="w-full bg-customText text-slate-900 py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg hover:shadow-customText/20 transition-all active:scale-[0.98]"
              >
                Mark as Completed
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TherapyPlan;
