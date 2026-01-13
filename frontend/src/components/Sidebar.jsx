import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion as Motion, AnimatePresence } from "framer-motion";


import { RiArrowDropDownLine } from "react-icons/ri";
import { closeSidebar, toggleTheme } from "../slices/uiSlice";
import { useLogoutMutation } from "../slices/auth/authApi";
import LogoutModal from "./Modals/Logout";

// sidebar Icons
import { RxDashboard } from "react-icons/rx";
import { MdOutlineAssessment } from "react-icons/md";
import { RiRobot3Line } from "react-icons/ri";
import { BiMessageAltDetail } from "react-icons/bi";
import { CiSettings } from "react-icons/ci";
import { FiLogOut, FiLock, FiCheckCircle, FiSun, FiMoon } from "react-icons/fi";

const menuList = [
  { name: "Dashboard", path: "/user-dashboard", icon: <RxDashboard size={25} color="white" /> },
  { name: "Initial Assessment", path: "/assessment-result", icon: <MdOutlineAssessment size={25} color="white" /> },
  { name: "Therapy Plan", path: "/therapy-plan", icon: <FiCheckCircle size={25} color="white" /> },
  { name: "Analytics", path: "/analytics", icon: <RxDashboard size={25} color="white" /> }, // Re-using dashboard icon or finding better one
  {
    name: "Chatbot",
    path: "/chatbot",
    icon: <BiMessageAltDetail size={25} color="white" />,
    subMenu: [], // This will be replaced dynamically using `botIds`
  },
  { name: "Settings", path: "/settings", icon: <CiSettings size={25} color="white" /> },
  { name: "Logout", path: "/logout", icon: <FiLogOut size={25} color="white" /> },
];

const Sidebar = ({ idsLoading, botIds }) => {
  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isSidebarOpen = useSelector((state) => state.ui.isSidebarOpen);
  const theme = useSelector((state) => state.ui.theme);
  const { isCreatingNewChat, isExistingChat } = useSelector((state) => state.chatbotSlice);
  const userDetails = useSelector((state) => state.auth.userDetails);
  const [logout] = useLogoutMutation();

  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const items = Array(5).fill(0);

  useEffect(() => {
    if (location.pathname.startsWith("/chatbot")) {
      setIsChatbotOpen(true);
    }
  }, [location.pathname]);

  const toggleChatbotMenu = () => setIsChatbotOpen((prev) => !prev);
  const handleLogoutClick = () => setShowLogoutModal(true);

  const handleConfirmLogout = async () => {
    try {
      await logout().unwrap();
      localStorage.removeItem("Therapy-user-token");
      setShowLogoutModal(false);
      window.location.href = "/login";
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <div className="relative h-screen z-50">
      <AnimatePresence initial={false}>
        {isSidebarOpen && (
          <>
            <div
              onClick={() => dispatch(closeSidebar())}
              className="fixed inset-0 bg-black bg-opacity-40 z-50 md:hidden"
            ></div>

            <Motion.div
              key="sidebar"
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className={`fixed md:static top-0 left-0 ${theme === 'dark' ? 'bg-slate-900 border-r border-white/5' : 'bg-customBg'} w-[266px] h-full z-50 shadow-lg transition-all duration-300`}
            >
              <header className="flex justify-between items-center py-3 h-[60px] px-5">
                <h2 className="text-xl font-bold cursor-pointer" onClick={() => navigate('/user-dashboard')}>Online<span className="text-white">Therapy</span></h2>
                {/* Theme Toggle Button */}
                <button
                  onClick={() => dispatch(toggleTheme())}
                  className="p-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-all duration-200"
                  title={theme === "light" ? "Switch to Dark Mode" : "Switch to Light Mode"}
                >
                  {theme === "light" ? <FiMoon size={20} /> : <FiSun size={20} />}
                </button>
              </header>

              {idsLoading ? (
                <div className="animate-pulse mt-20">
                  {items.map((_, index) => (
                    <div
                      key={index}
                      className="h-10 bg-[#1ac6a942] rounded-full dark:bg-gray-700 mb-8"
                    ></div>
                  ))}
                </div>
              ) : (
                <div className="hide-scrollbar overflow-y-scroll h-full pb-20">
                  <nav className="">
                    <ul className="flex flex-col">
                      {menuList.map((item) => {
                        const isChatbot = item.name === "Chatbot";
                        const subMenu = isChatbot
                          ? botIds?.map((bot) => ({
                            name: bot.title,
                            path: `/chatbot/${bot.sessionId}`,
                          }))
                          : item.subMenu;

                        const isSubmenuOpen =
                          item.name === "Chatbot"
                            ? isChatbotOpen
                            : false;

                        const handleToggle =
                          item.name === "Chatbot"
                            ? toggleChatbotMenu
                            : null;

                        return (
                          <li key={item.name} className="mb-[0.5px]">
                            {subMenu?.length > 0 || item?.name === "Chatbot" ? (
                              <button
                                type="button"
                                onClick={handleToggle}
                                disabled={isCreatingNewChat || isExistingChat}
                                style={{ cursor: isCreatingNewChat || isExistingChat ? "not-allowed" : "pointer" }}
                                className={`w-full text-left ${theme === 'dark' ? 'bg-slate-800 hover:bg-slate-700 text-white' : 'bg-componentBg text-gray-700'} flex items-center gap-3 px-4 py-3 hover:text-blue-500 transition-all duration-300 ${isSubmenuOpen ? (theme === 'dark' ? 'bg-slate-700' : 'bg-[#1AC6A975]') : ''
                                  }`}
                              >
                                {item.icon}
                                {/* <img src={item.icon} alt={item.name} /> */}
                                <div className="flex items-center gap-2 text-[#FFFFFF] font-normal font-heading">
                                  <span>{item.name}</span>

                                  {item.name === "Chatbot" && (
                                    <span
                                      className="text-xs bg-[#1AC6A9] text-white px-2 py-1 rounded hover:bg-[#159a88] transition"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        navigate('/auth/chatbot/new-chat')
                                        // Your custom logic here (e.g., open modal, redirect, etc.)
                                        console.log(
                                          "Create new chatbot clicked!"
                                        );
                                      }}
                                    >
                                      + New
                                    </span>
                                  )}

                                  {subMenu?.length > 0 && (
                                    <RiArrowDropDownLine
                                      className={`transform transition-transform duration-300 ${isSubmenuOpen ? "rotate-180" : ""
                                        }`}
                                      size={30}
                                    />
                                  )}
                                </div>
                              </button>
                            ) : item.name === "Logout" ? (
                              <button
                                onClick={handleLogoutClick}
                                className={`w-full text-left ${theme === 'dark' ? 'bg-slate-800 hover:bg-slate-700' : 'bg-componentBg'} flex items-center gap-3 px-4 py-3 text-gray-700 hover:text-blue-500 transition-all duration-300`}
                              >
                                {item.icon}
                                {/* <img src={item.icon} alt={item.name} /> */}
                                <p className="text-[#FFFFFF] font-normal font-heading">
                                  {item.name}
                                </p>
                              </button>
                            ) : (
                              <NavLink
                                to={item.path}
                                className={({ isActive }) =>
                                  `flex items-center mb-[0.5px] ${theme === 'dark' ? 'bg-slate-800 hover:bg-slate-700' : 'bg-componentBg'} gap-3 px-4 py-3 text-gray-700 hover:text-blue-500 transition-all duration-300 ${isActive ? (theme === 'dark' ? 'bg-slate-700 border-l-4 border-customText' : 'bg-chatBg') : ''
                                  }`
                                }
                              >
                                {item.icon}
                                {/* <img src={item.icon} alt={item.name} /> */}
                                <div className="flex items-center justify-between w-full">
                                  <p className="text-[#FFFFFF] font-normal font-heading">
                                    {item.name}
                                  </p>
                                  {item.name === "Initial Assessment" && userDetails?.completed && (
                                    <FiCheckCircle className="text-green-400" size={18} />
                                  )}
                                </div>
                              </NavLink>
                            )}

                            {subMenu?.length > 0 && (
                              <ul
                                className={`transition-all duration-300 ${isSubmenuOpen
                                  ? "max-h-[500px]"
                                  : "max-h-0 overflow-hidden"
                                  }`}
                              >
                                {subMenu.map((subItem, index) => {
                                  let isLocked = false;
                                  // Removed obsolete session locking logic

                                  return (
                                    <li key={index}>
                                      {isLocked ? (
                                        <div className="flex items-center justify-between pl-10 pr-4 py-2 text-gray-400 cursor-not-allowed">
                                          <span className="font-medium text-sm">
                                            {subItem?.name?.length > 22
                                              ? `${subItem.name.slice(0, 22)}...`
                                              : subItem.name}
                                          </span>
                                          <FiLock size={14} />
                                        </div>
                                      ) : (
                                        <NavLink
                                          to={subItem.path}
                                          className={({ isActive }) =>
                                            `block pl-10 py-2 font-medium hover:text-black ${isActive ? "font-semibold bg-customText text-black" : "text-white"
                                            }`
                                          }
                                        >
                                          {subItem?.name?.length > 22
                                            ? `${subItem.name.slice(0, 22)}...`
                                            : subItem.name}
                                        </NavLink>
                                      )}
                                    </li>
                                  );
                                })}
                              </ul>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  </nav>
                </div>
              )}
            </Motion.div>
          </>
        )}
      </AnimatePresence>

      {/* {!isSidebarOpen && (
        <div className="p-4 fixed top-4 left-4 z-40">
          <img
            src={logo}
            alt="Open Sidebar"
            className="cursor-pointer"
            onClick={() => dispatch(toggleSidebar())}
          />
        </div>
      )} */}

      <LogoutModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleConfirmLogout}
      />
    </div>
  );
};

export default Sidebar;
