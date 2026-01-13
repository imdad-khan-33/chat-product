import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { useSelector, useDispatch } from "react-redux";
import { useEffect, useState } from "react";
import { setSidebar } from "../slices/uiSlice";
import Header from "../components/Header";

import {
  setChatbotIds,
  setLoadingIds,
} from "../slices/chatbotSlice/chatbotSlice";

const MainLayout = () => {
  const dispatch = useDispatch();
  const isSidebarOpen = useSelector((state) => state.ui.isSidebarOpen);
  const theme = useSelector((state) => state.ui.theme);
  const { loadingIds, chatsIds } = useSelector((state) => state.chatbotSlice);

  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      const isMobileView = window.innerWidth < 768;
      setIsMobile(isMobileView);
      dispatch(setSidebar(!isMobileView));
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, [dispatch]);

  useEffect(() => {
    if (chatsIds && !loadingIds) {
      dispatch(setChatbotIds(chatsIds));
      dispatch(setLoadingIds(loadingIds));
    }
  }, [loadingIds, chatsIds, dispatch]);

  const handleBackdropClick = () => {
    if (isMobile) {
      dispatch(setSidebar(false));
    }
  };

  return (
    <div className="flex h-screen overflow-hidden relative">
      {/* Sidebar */}
      <div
        className={`
          transition-all duration-300 z-40
          ${isMobile ? "absolute h-full top-0 left-0 shadow-lg" : ""}
          ${isSidebarOpen
            ? "w-[266px]"
            : isMobile
              ? "w-0"
              : "w-0"}  /* collapsed state for desktop */
        `}
        style={{ overflow: 'hidden' }}
      >
        <Sidebar idsLoading={loadingIds} botIds={chatsIds} />
      </div>

      {/* Backdrop for mobile */}
      {isSidebarOpen && isMobile && (
        <div
          onClick={handleBackdropClick}
          className="fixed inset-0 bg-black bg-opacity-30 z-30"
        ></div>
      )}

      {/* Main content */}
      <main
        className={`
          flex-1 flex flex-col relative overflow-y-auto transition-all duration-300
          ${theme === 'dark' ? 'bg-slate-900' : 'bg-white'}
          ${!isMobile && isSidebarOpen ? "" : ""}
        `}
      >
        <Header />
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;
