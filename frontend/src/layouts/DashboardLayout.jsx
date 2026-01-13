import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  FiHome,
  FiMessageSquare,
  FiHeart,
  FiActivity,
  FiBarChart2,
  FiPhone,
  FiUser,
  FiSettings,
  FiMenu,
  FiX,
  FiChevronDown,
  FiSun,
  FiMoon
} from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import { toggleTheme } from "../slices/uiSlice";
import { logout } from "../slices/auth/authSlice";
import { useLogoutMutation } from "../slices/auth/authApi";
import toast from "react-hot-toast";
//import userImg from "../assets/images/user.png";
import { getProfileImage } from "../utils/imageHelper";
import NotificationDropdown from "../components/NotificationDropdown";

const DashboardLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const dispatch = useDispatch();
  const theme = useSelector((state) => state.ui.theme);
  const userDetails = useSelector((state) => state.auth.userDetails);
  const [logoutApiCall] = useLogoutMutation();

  const profileImgUrl = getProfileImage(userDetails, null);

  const handleLogout = async () => {
    if (window.confirm("Are you sure you want to log out?")) {
      try {
        await logoutApiCall().unwrap();
        dispatch(logout());
        toast.success("Logged out successfully");
        navigate("/login");
      } catch (error) {
        console.error("Logout failed", error);
        dispatch(logout());
        toast.success("Logged out successfully");
        navigate("/login");
      }
    }
  };

  const menuItems = [
    { icon: FiHome, label: "Home", path: "/dashboard" },
    { icon: FiMessageSquare, label: "Chat Therapy", path: "/chat" },
    { icon: FiHeart, label: "Mood Tracker", path: "/mood" },
    { icon: FiActivity, label: "Therapy Plan", path: "/therapy-plan" },
    { icon: FiBarChart2, label: "Analytics", path: "/analytics" },
    { icon: FiPhone, label: "Emergency", path: "/emergency" },
    { icon: FiUser, label: "Profile", path: "/profile" },
    { icon: FiSettings, label: "Settings", path: "/settings" },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className={`flex h-screen ${theme === 'dark' ? 'bg-slate-950 text-white' : 'bg-[#F0FDFA]'} transition-colors duration-300`}>
      {/* Desktop Sidebar */}
      <div className={`hidden lg:flex w-72 ${theme === 'dark' ? 'bg-slate-900 border-r border-white/5' : 'bg-[#0B6A5A]'} shadow-2xl flex-col fixed h-screen z-20 transition-colors duration-300`}>
        <div className="p-8 flex items-center mb-4">
          <h1 className="text-2xl font-black font-heading text-white tracking-widest uppercase">ChatBot</h1>
        </div>

        <nav className="flex-1 overflow-y-auto px-4 space-y-2 hide-scrollbar">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center justify-between px-6 py-4 rounded-xl transition-all duration-300 group ${active
                  ? "bg-white/10 text-white shadow-inner"
                  : "text-white/70 hover:bg-white/5 hover:text-white"
                  }`}
              >
                <div className="flex items-center gap-4">
                  <Icon size={20} className={active ? "text-[#1AC6A9]" : "text-inherit"} />
                  <span className="font-bold text-sm tracking-wide">{item.label}</span>
                </div>
                {(item.label === "Chat" || item.label === "Sessions") && (
                  <FiChevronDown size={16} className="opacity-50" />
                )}
              </button>
            );
          })}

          <div className="mt-10 pt-10 border-t border-white/10">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-4 px-6 py-4 text-white/70 hover:text-white transition-colors"
            >
              <FiBarChart2 size={20} className="rotate-90" />
              <span className="font-bold text-sm uppercase tracking-widest">Logout</span>
            </button>
          </div>
        </nav>
      </div>

      {/* Main Content Area */}
      <div className="w-full lg:ml-72 flex flex-col min-h-screen">
        {/* Top Header Bar */}
        <div className={`${theme === 'dark' ? 'bg-slate-900 border-b border-white/5' : 'bg-[#0B6A5A]'} px-6 lg:px-10 py-4 flex items-center justify-between sticky top-0 z-10 shadow-lg transition-colors duration-300`}>
          <div className="flex items-center gap-6 flex-1">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 text-white bg-white/10 rounded-lg border border-white/20"
            >
              {sidebarOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>

            {/* Search Bar */}
            {/* <div className={`hidden md:flex items-center ${theme === 'dark' ? 'bg-slate-800' : 'bg-white/90'} rounded-full px-5 py-2 w-full max-w-md shadow-inner transition-colors duration-300`}>
              <FiSearch className="text-gray-400 mr-3" />
              <input
                type="text"
                placeholder="Search"
                className={`bg-transparent border-none focus:ring-0 text-sm font-bold ${theme === 'dark' ? 'text-white placeholder:text-gray-500' : 'text-gray-700 placeholder:text-gray-400'} w-full transition-colors duration-300`}
              />
            </div> */}
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-4">
              {/* Theme Toggle Button */}
              <button
                onClick={() => dispatch(toggleTheme())}
                className="p-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-all duration-200"
                title={theme === "light" ? "Switch to Dark Mode" : "Switch to Light Mode"}
              >
                {theme === "light" ? <FiMoon size={22} /> : <FiSun size={22} />}
              </button>

              {/* Notification Dropdown */}
              <NotificationDropdown />
            </div>

            <div
              className="flex items-center gap-3 cursor-pointer group"
              onClick={() => navigate("/profile")}
            >
              <div className="relative">
                <div className="w-10 h-10 rounded-full border-2 border-[#1AC6A9] shadow-md group-hover:scale-105 transition-transform overflow-hidden bg-white/10 flex items-center justify-center">
                  <img
                    key={profileImgUrl}
                    src={profileImgUrl}
                    alt="User"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'block';
                    }}
                    onLoad={(e) => {
                      e.target.style.display = 'block';
                      e.target.nextSibling.style.display = 'none';
                    }}
                  />
                  <FiUser className="text-white hidden" size={20} />
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-[#0B6A5A] rounded-full z-10"></div>
              </div>
              <div className="hidden lg:block">
                <p className="text-white font-black text-sm leading-none">
                  {userDetails?.username || "Profile"}
                </p>
              </div>
              <FiChevronDown className="text-white/60 hidden lg:block" size={14} />
            </div>
          </div>
        </div>

        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div className="lg:hidden fixed inset-0 z-30 transition-opacity">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setSidebarOpen(false)}></div>
            <nav className={`absolute left-0 top-0 bottom-0 w-64 ${theme === 'dark' ? 'bg-slate-900 border-r border-white/5' : 'bg-[#0B6A5A]'} shadow-2xl p-6 space-y-4 overflow-y-auto hide-scrollbar transition-colors duration-300`}>
              <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/10">
                <h1 className="text-xl font-black text-white tracking-widest">CHATBOT</h1>
                <FiX size={24} className="text-white/60" onClick={() => setSidebarOpen(false)} />
              </div>
              <div className="space-y-1">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.path);
                  return (
                    <button
                      key={item.path}
                      onClick={() => {
                        navigate(item.path);
                        setSidebarOpen(false);
                      }}
                      className={`w-full flex items-center gap-4 px-5 py-3.5 rounded-xl transition-all font-bold ${active
                        ? "bg-white/10 text-white"
                        : "text-white/70 hover:bg-white/5"
                        }`}
                    >
                      <Icon size={20} />
                      <span className="text-sm">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </nav>
          </div>
        )}

        {/* Dynamic Content */}
        <div className={`flex-1 overflow-y-auto p-6 lg:p-10 hide-scrollbar ${theme === 'dark' ? 'bg-slate-950' : 'bg-white'} transition-colors duration-300`}>
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
