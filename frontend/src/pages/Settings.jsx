import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { logout } from "../slices/auth/authSlice";
import { useLogoutMutation } from "../slices/auth/authApi";
import { FiBell, FiLogOut, FiCheck, FiZap, FiShield, FiLoader, FiUser } from "react-icons/fi";
import { getProfileImage } from "../utils/imageHelper";

const Settings = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.userDetails);
  const [logoutApi, { isLoading: isLoggingOut }] = useLogoutMutation();

  const [settings, setSettings] = useState({
    notifications: true,
    emailNotifications: true,
    language: localStorage.getItem("language") || "en",
  });

  const [saveStatus, setSaveStatus] = useState("");

  const handleSettingChange = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSaveSettings = () => {
    setSaveStatus("saving");
    setTimeout(() => {
      localStorage.setItem("userSettings", JSON.stringify(settings));
      setSaveStatus("saved");
      toast.success("Settings saved successfully!");
      setTimeout(() => setSaveStatus(""), 2000);
    }, 500);
  };

  const handleLogout = async () => {
    if (window.confirm("Are you sure you want to logout?")) {
      try {
        await logoutApi().unwrap();
        dispatch(logout());
        localStorage.removeItem("Therapy-user-token");
        localStorage.removeItem("Therapy-refresh-token");
        navigate("/login");
      } catch {
        toast.error("Logout failed. Please try again.");
      }
    }
  };

  const settingsSections = [
    {
      title: "Alerts & Notifications",
      icon: FiBell,
      description: "Manage how we communicate with you.",
      settings: [
        {
          label: "Push Notifications",
          key: "notifications",
          type: "toggle",
          description: "Receive push notifications from therapy sessions.",
        },
        {
          label: "Email Notifications",
          key: "emailNotifications",
          type: "toggle",
          description: "Receive monthly wellness reports and reminders.",
        },
      ],
    },
  ];

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl lg:text-4xl font-black text-[#0B6A5A] font-heading mb-2">
            System Preferences
          </h1>
          <p className="text-gray-500 font-medium">Fine-tune your digital therapy environment.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleSaveSettings}
            disabled={saveStatus === "saving"}
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-sm transition-all shadow-lg active:scale-95 ${saveStatus === "saved"
              ? "bg-green-100 text-green-700 border border-green-200"
              : "bg-[#0B6A5A] text-white"
              }`}
          >
            {saveStatus === "saving" ? (
              <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
            ) : saveStatus === "saved" ? (
              <FiCheck />
            ) : (
              <FiZap />
            )}
            {saveStatus === "saving" ? "Applying..." : saveStatus === "saved" ? "Values Synced" : "Apply Changes"}
          </button>
        </div>
      </div>

      {/* User Quick Info */}
      <div className="bg-gradient-to-r from-[#0B6A5A] to-[#1AC6A9] text-white rounded-[2.5rem] p-8 lg:p-10 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative">
        <div className="flex items-center gap-6 relative z-10">
          <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center text-4xl border-[4px] border-white/20 shadow-lg overflow-hidden flex-shrink-0 relative">
            <img
              key={getProfileImage(user, null)}
              src={getProfileImage(user, null)}
              alt="profile"
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
            <div className="absolute inset-0 w-full h-full bg-[#E0F2F1] flex items-center justify-center text-[#0B6A5A]" style={{ display: 'none' }}>
              <FiUser size={32} />
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-black tracking-tight mb-1 capitalize">{user?.username || "Therapy User"}</h2>
            <p className="text-white/70 font-bold text-xs uppercase tracking-widest flex items-center gap-1">
              <FiShield size={12} /> Verified Member
            </p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="relative z-10 flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 px-6 py-3 rounded-2xl font-black text-sm transition-all active:scale-95 disabled:opacity-50"
        >
          {isLoggingOut ? <FiLoader className="animate-spin" /> : <><FiLogOut /> Logout Session</>}
        </button>

        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
      </div>

      {/* Settings Sections Grid */}
      <div className="grid grid-cols-1 gap-8">
        {settingsSections.map((section, idx) => {
          const Icon = section.icon;
          return (
            <div key={idx} className="bg-white rounded-3xl border border-[#E0F2F1] shadow-sm overflow-hidden hover:border-[#90D6CA] transition-colors group">
              <div className="bg-gray-50/50 p-6 border-b border-[#E0F2F1] flex items-center gap-4">
                <div className="bg-white p-3 rounded-2xl shadow-sm text-[#0B6A5A] group-hover:scale-110 transition-transform">
                  <Icon size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-gray-500 tracking-tight">{section.title}</h3>
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">{section.description}</p>
                </div>
              </div>

              <div className="p-8 space-y-8">
                {section.settings.map((setting, sIdx) => (
                  <div key={sIdx} className="space-y-4">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1">
                        <label className="text-lg font-bold text-gray-500 leading-none">{setting.label}</label>
                        <p className="text-sm text-gray-400 font-medium mt-1">{setting.description}</p>
                      </div>

                      {setting.type === "toggle" && (
                        <button
                          onClick={() => handleSettingChange(setting.key, !settings[setting.key])}
                          className={`w-14 h-8 rounded-full transition-all relative ${settings[setting.key] ? "bg-[#0B6A5A]" : "bg-gray-200"
                            }`}
                        >
                          <div className={`absolute top-1 bottom-1 aspect-square bg-white rounded-full transition-all shadow-sm ${settings[setting.key] ? "left-7" : "left-1"
                            }`}></div>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Settings;
