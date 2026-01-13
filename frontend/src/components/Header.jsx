import { IoMdNotifications } from "react-icons/io";
import DropdownMenu from "./commonComponents/DropDown";
import userImg from "../assets/images/user.png";
import { RiArrowDropDownLine } from "react-icons/ri";
import { GoSidebarCollapse } from "react-icons/go";
import { useDispatch, useSelector } from "react-redux";
import { useState, useEffect } from "react";
import { setSidebar, toggleTheme } from "../slices/uiSlice";
import { FiSun, FiMoon, FiUser } from "react-icons/fi";
import { useLogoutMutation } from "../slices/auth/authApi";
import { logout } from "../slices/auth/authSlice";
import toast from "react-hot-toast";
import { getProfileImage } from "../utils/imageHelper";

const Header = () => {
  const [openSidebar, setOpenSidebar] = useState(false);
  const dispatch = useDispatch();
  const notifications = useSelector((state) => state.notificationSlice.list);
  const theme = useSelector((state) => state.ui.theme);
  const userDetails = useSelector((state) => state.auth.userDetails);

  const handleToggleSidebar = () => {
    setOpenSidebar((prev) => !prev);
    dispatch(setSidebar(openSidebar));
  };



  const [logoutApiCall] = useLogoutMutation();

  // State to manage local image source for safe fallback
  const [imgSrc, setImgSrc] = useState(userImg);

  useEffect(() => {
    // When userDetails changes, update the source
    setImgSrc(getProfileImage(userDetails, userImg));
  }, [userDetails]);

  const handleProfileSelect = async (action) => {
    console.log("Selected Action:", action);
    if (action === "My Profile") {
      window.location.href = "/profile";
    }
    if (action === "Logout") {
      if (window.confirm("Are you sure you want to log out?")) {
        try {
          await logoutApiCall().unwrap();
          dispatch(logout());
          toast.success("Logged out successfully");
          // Force reload or redirect to ensure clean state
          window.location.href = "/login";
        } catch (error) {
          console.error("Logout failed", error);
          // Even if API fails, clear local state
          dispatch(logout());
          toast.success("Logged out successfully");
          window.location.href = "/login";
        }
      }
    }
  };

  // Calculate profile image URL once to use as key and source
  const profileImgUrl = getProfileImage(userDetails, null);

  return (
    <div className="bg-componentBg dark:bg-slate-900 py-3 px-5 shadow-md h-[60px] flex items-center justify-between transition-colors duration-300">
      <GoSidebarCollapse
        size={26}
        color="white"
        className="cursor-pointer"
        onClick={handleToggleSidebar}
      />
      <div className="flex md:gap-8 gap-3 ms-auto items-center justify-end h-[70px] text-white">
        {/* Theme Toggle Button */}
        <button
          onClick={() => dispatch(toggleTheme())}
          className="p-2 rounded-full hover:bg-white/10 transition-colors duration-200"
          title={theme === "light" ? "Switch to Dark Mode" : "Switch to Light Mode"}
        >
          {theme === "light" ? (
            <FiMoon className="text-white" size={24} />
          ) : (
            <FiSun className="text-white" size={24} />
          )}
        </button>

        {/* Notification Dropdown */}
        <DropdownMenu
          label={
            <div className="flex gap-1 items-center relative">
              <IoMdNotifications
                className="text-white cursor-pointer"
                size={30}
              />
              {notifications.length > 0 && (
                <span className="bg-red-700 rounded-full w-5 h-5 flex justify-center items-center text-xs absolute -top-2 -right-1">
                  {notifications.length}
                </span>
              )}
            </div>
          }
          name={"Notifications"}
          items={
            notifications.length > 0
              ? notifications.map((notif, i) => (
                <div
                  key={i}
                  className="group group-hover:text-black px-4 py-3 transition-colors cursor-pointer"
                >
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="font-semibold text-sm">{notif.title}</h4>
                    <span className="text-xs whitespace-nowrap ml-2">
                      Just Now
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed">{notif.message}</p>
                </div>
              ))
              : [
                <p
                  key="none"
                  className="text-sm text-center py-4 text-white/80"
                >
                  No new notifications.
                </p>,
              ]
          }
        ></DropdownMenu>

        {/* Notification Dropdown */}

        {/* Profile setting Dropdown */}
        <DropdownMenu
          label={
            <div className="flex md:gap-1 gap-0 items-center">
              <span className="flex items-center gap-3">
                <div className="relative w-8 h-8 rounded-full overflow-hidden bg-white/10 flex items-center justify-center">
                  <img
                    key={profileImgUrl}
                    className="w-full h-full object-cover"
                    src={profileImgUrl}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.parentElement.classList.add('fallback-active');
                    }}
                    onLoad={(e) => {
                      e.target.style.display = 'block';
                      e.target.parentElement.classList.remove('fallback-active');
                    }}
                    alt="Profile"
                  />
                  <FiUser className="absolute text-white fallback-icon opacity-0" size={18} style={{ opacity: 0 }} />
                  <style>{`
                    .fallback-active img { display: none !important; }
                    .fallback-active .fallback-icon { opacity: 1 !important; position: static !important; }
                  `}</style>
                </div>
                {userDetails?.username || "Profile"}
              </span>
              <RiArrowDropDownLine size={30} />
            </div>
          }
          name={"Profile"}
          items={["My Profile", "Logout"]}
          onItemClick={handleProfileSelect}
        />
      </div>
    </div>
  );
};

export default Header;
