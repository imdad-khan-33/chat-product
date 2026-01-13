import React, { useState, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import toast from "react-hot-toast";
import { useUpdateProfileMutation } from "../slices/auth/authApi";
import { setUserDetails } from "../slices/auth/authSlice";
import { useGetMoodHistoryQuery } from "../slices/mood/moodApi";
import { useGetAssessmentResultsQuery } from "../slices/assessment/assessmentApi";
import { FiUser, FiEdit3, FiCheck, FiX, FiAward, FiMessageSquare, FiTrendingUp, FiMail, FiPhone, FiCalendar, FiCheckCircle, FiActivity, FiLoader } from "react-icons/fi";
import { getProfileImage } from "../utils/imageHelper";

const Profile = () => {
  const user = useSelector((state) => state.auth.userDetails);
  const dispatch = useDispatch();
  const [updateProfile, { isLoading: isUpdating }] = useUpdateProfileMutation();

  // Stats queries
  const { data: moodHistoryRes } = useGetMoodHistoryQuery(30);
  const { data: assessmentRes } = useGetAssessmentResultsQuery();

  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    username: user?.username || "",
    email: user?.email || "",
  });

  const stats = useMemo(() => {
    const moods = moodHistoryRes?.data || [];
    const avg = moods.length ? (moods.reduce((a, b) => a + b.mood, 0) / moods.length).toFixed(1) : "0.0";
    const sessions = assessmentRes?.session?.sessions || [];
    // Fix: Check for isCompleted boolean instead of status string
    const completed = sessions.filter(s => s.isCompleted === true).length;
    const progress = sessions.length ? Math.round((completed / sessions.length) * 100) : 0;

    return {
      avgMood: avg,
      totalSessions: sessions.length,
      completedSessions: completed,
      progress
    };
  }, [moodHistoryRes, assessmentRes]);

  const achievements = useMemo(() => {
    const baseAchievements = [
      {
        icon: FiMessageSquare,
        label: "First Assessment",
        earned: !!assessmentRes,
        color: "text-[#00796B]",
        bgColor: "bg-[#E0F2F1]"
      },
      {
        icon: FiCheckCircle,
        label: "Started Journey",
        earned: stats.completedSessions > 0 && stats.completedSessions === stats.totalSessions,
        color: "text-[#00796B]",
        bgColor: "bg-[#E0F2F1]"
      },
    ];

  
    const dbBadges = (user?.badges || [])
      .filter(badge =>
        !baseAchievements.some(a => a.label === badge.name) &&
        !["First Step", "Started Journey", "First Assessment", "Warrior", "Halfway Hero", "Mood Logged"].includes(badge.name)
      )
      .map(badge => ({
        icon: FiAward,
        label: badge.name,
        earned: true,
        color: "text-[#00796B]",
        bgColor: "bg-[#E0F2F1]",
        description: badge.description
      }));

    return [...baseAchievements, ...dbBadges];
  },);



  const handleEditChange = (field, value) => {
    setEditData((prev) => ({ ...prev, [field]: value }));
  };

  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
      setIsEditing(true);
    }
  };

  const handleSaveProfile = async () => {
    try {
      const formData = new FormData();
      formData.append("username", editData.username);
      if (selectedImage) {
        formData.append("userImage", selectedImage);
      }

      const res = await updateProfile(formData).unwrap();
      // res.data contains the updated user object from the backend
      if (res.data) {
        // Add cache buster to image URL to force refresh
        const updatedUser = { ...res.data };
        if (updatedUser.userImage) {
          updatedUser.userImage = `${updatedUser.userImage}?t=${new Date().getTime()}`;
        }
        dispatch(setUserDetails(updatedUser));
      } else {
        // Fallback if data is missing for some reason
        dispatch(setUserDetails({ ...user, username: editData.username, userImage: (previewUrl || user?.userImage) + `?t=${new Date().getTime()}` }));
      }
      toast.success("Profile updated successfully!");
      setIsEditing(false);
      setSelectedImage(null);
      setPreviewUrl(null);
    } catch {
      toast.error("Failed to update profile.");
    }
  };

  return (
    <div className="space-y-8 pb-10 dark:text-white">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl lg:text-4xl font-black text-[#0B6A5A] font-heading mb-2">
            Patient Profile
          </h1>
          <p className="text-gray-500 dark:text-gray-400 font-medium">Manage your identity and track your growth milestones.</p>
        </div>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-sm transition-all shadow-lg active:scale-95 ${isEditing ? "bg-red-50 text-red-600 border border-red-100" : "bg-[#0B6A5A] text-white"
            }`}
        >
          {isEditing ? <FiX /> : <FiEdit3 />}
          {isEditing ? "Discard Changes" : "Update Profile"}
        </button>
      </div>

      {/* Profile Card */}
      <div className="relative overflow-hidden bg-gradient-to-r from-[#0B6A5A] to-[#1AC6A9] rounded-[2.5rem] p-8 lg:p-12 text-white shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 lg:gap-12">
          <div className="relative group cursor-pointer" onClick={() => document.getElementById('avatar-upload').click()}>
            <div className="w-32 h-32 lg:w-40 lg:h-40 bg-white rounded-full flex items-center justify-center text-6xl border-[6px] border-white/20 shadow-2xl group-hover:scale-105 transition-transform overflow-hidden relative">
              {(previewUrl || getProfileImage(user, null)) ? (
                <img
                  src={previewUrl || getProfileImage(user, null)}
                  onError={(e) => { e.target.onerror = null; e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                  alt="profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-[#E0F2F1] flex items-center justify-center text-[#0B6A5A]" style={{ display: (previewUrl || getProfileImage(user, null)) ? 'none' : 'flex' }}>
                  <FiUser size={60} />
                </div>
              )}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <FiEdit3 className="text-white" size={30} />
              </div>
            </div>
            <input
              id="avatar-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
            />
          </div>

          <div className="text-center md:text-left space-y-2">
            <h2 className="text-4xl lg:text-5xl font-black font-heading tracking-tight capitalize flex items-center justify-center md:justify-start gap-3">
              {user?.username}
              {user?.isVerified && (
                <FiCheckCircle className="text-white w-8 h-8" title="Verified Account" />
              )}
            </h2>
            <div className="flex flex-wrap justify-center md:justify-start gap-4">
              <span className="flex items-center gap-2 bg-white/10 px-4 py-1.5 rounded-full text-sm font-bold border border-white/20">
                <FiMail size={14} /> {user?.email}
              </span>
              <span className="flex items-center gap-2 bg-white/10 px-4 py-1.5 rounded-full text-sm font-bold border border-white/20">
                <FiCalendar size={14} /> Joined {user?.createdAt ? new Date(user.createdAt).toLocaleDateString([], { month: 'long', year: 'numeric' }) : "Recently"}
              </span>
            </div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-black/10 rounded-full ml-10 mb-10 blur-2xl"></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Information Panel */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-[#E0F2F1] dark:border-slate-700 p-8">
            <h3 className="text-2xl font-bold text-gray-800 dark:text-white font-heading mb-8 flex items-center gap-3">
              <FiUser className="text-[#0B6A5A]" /> Core Information
            </h3>

            {isEditing ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest pl-1">Display Name</label>
                  <input
                    type="text"
                    value={editData.username}
                    onChange={(e) => handleEditChange("username", e.target.value)}
                    className="w-full px-5 py-4 bg-gray-50 dark:bg-slate-700 border-none rounded-2xl focus:ring-2 focus:ring-[#90D6CA] font-bold text-gray-700 dark:text-gray-200 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest pl-1">Email Address</label>
                  <input
                    type="email"
                    value={editData.email}
                    disabled
                    className="w-full px-5 py-4 bg-gray-100 dark:bg-slate-600 border-none rounded-2xl font-bold text-gray-400 dark:text-gray-400 cursor-not-allowed"
                  />
                </div>
                <div className="md:col-span-2 flex gap-4 pt-4">
                  <button
                    onClick={handleSaveProfile}
                    disabled={isUpdating}
                    className="flex-1 bg-[#0B6A5A] text-white py-4 rounded-2xl font-black text-lg shadow-xl hover:bg-[#085a4d] transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
                  >
                    {isUpdating ? <FiLoader className="animate-spin" /> : <><FiCheck size={24} /> Confirm Changes</>}
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { label: "Username", value: user?.username, icon: FiUser },
                  { label: "Email System", value: user?.email, icon: FiMail },
                  { label: "Account Status", value: user?.isVerified ? "Verified" : "Unverified", icon: FiCheckCircle },
                  { label: "Member Since", value: user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A", icon: FiCalendar }
                ].map((item, i) => (
                  <div key={i} className="group p-6 bg-gray-50 dark:bg-slate-700/50 rounded-2xl border border-transparent hover:border-[#90D6CA] hover:bg-white dark:hover:bg-slate-700 transition-all">
                    <div className="flex items-center gap-3 mb-3 text-gray-400 font-medium group-hover:text-[#0B6A5A] dark:group-hover:text-[#2dd4bf] transition-colors">
                      <item.icon size={18} />
                      <span className="text-[10px] font-black uppercase tracking-widest">{item.label}</span>
                    </div>
                    <p className="text-xl font-bold text-gray-800 dark:text-white break-all">{item.value}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Achievements List */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-[#E0F2F1] dark:border-slate-700 p-8">
            <h3 className="text-2xl font-bold text-gray-800 dark:text-white font-heading mb-8 flex items-center gap-3">
              <FiAward className="text-[#0B6A5A]" /> Therapy Badges
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {achievements.map((achievement, idx) => {
                const Icon = achievement.icon;
                return (
                  <div
                    key={idx}
                    className={`p-6 rounded-3xl text-center transition-all group relative overflow-hidden border-2 cursor-default ${achievement.earned
                      ? "border-[#E0F2F1] bg-white dark:bg-slate-700 dark:border-slate-600 hover:border-[#90D6CA] hover:shadow-xl hover:-translate-y-2"
                      : "border-dashed border-gray-100 dark:border-slate-700 bg-gray-50/30 dark:bg-slate-800/50 opacity-40 grayscale"
                      }`}
                  >
                    <div className={`${achievement.bgColor} ${achievement.color} w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                      <Icon size={32} />
                    </div>
                    <p className="font-black text-gray-800 dark:text-gray-200 text-sm leading-tight mb-1">{achievement.label}</p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                      {achievement.earned ? "Locked" : "Unlocked"}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Stats Column */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-[#E0F2F1] dark:border-slate-700 p-8 space-y-8">
            <h3 className="text-xl font-bold text-gray-800 dark:text-white font-heading">Patient Performance</h3>

            <div className="space-y-6">
              {[
                { label: "Plan Sessions", value: stats.totalSessions, sub: "Total Planned", icon: FiMessageSquare, color: "text-[#00796B]", bgColor: "bg-[#E0F2F1]" },
                { label: "Average Mood", value: `${stats.avgMood}/10`, sub: "Last 30 Logs", icon: FiTrendingUp, color: "text-[#166534]", bgColor: "bg-[#F0FDF4]" },
                { label: "Plan Progress", value: `${stats.progress}%`, sub: "Overall Mastery", icon: FiActivity, color: "text-[#5B21B6]", bgColor: "bg-[#F5F3FF]" }
              ].map((stat, i) => (
                <div key={i} className="flex items-center justify-between group">
                  <div className="flex items-center gap-4">
                    <div className={`${stat.bgColor} ${stat.color} w-12 h-12 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                      <stat.icon size={20} />
                    </div>
                    <div>
                      <p className="text-xl font-black text-gray-800 dark:text-white leading-none mb-1">{stat.value}</p>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{stat.label}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-gray-300 font-bold uppercase tracking-widest">{stat.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
