import { useSelector, useDispatch } from "react-redux";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { useGetCurrentUserQuery } from "../slices/auth/authApi";
import { logout } from "../slices/auth/authSlice";
import CustomLoader from "../components/commonComponents/CustomLoader";
import { useLazyGetbotChatIdsQuery } from "../slices/chatbotSlice/chatbotApi";
import { setChatbotIds, setLoadingIds } from "../slices/chatbotSlice/chatbotSlice";
import socket from "../utils/socket";
import { addRealtimeNotification } from "../slices/NotificationSlice/NotificationSlice";
import { notificationApi } from "../slices/NotificationSlice/notificationApi";
import { jwtDecode } from "jwt-decode";

const PrivateRoutes = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const user = useSelector((state) => state.auth.user);
  const userDetails = useSelector((state) => state.auth.userDetails);
  const token = localStorage.getItem("Therapy-user-token");

  const { isLoading: isUserLoading, isError } = useGetCurrentUserQuery(undefined, {
    skip: !token,
  });

  const [triggerIds, { data: idsData, isLoading: idsLoading }] = useLazyGetbotChatIdsQuery();
  const [fetchedChatIds, setFetchedChatIds] = useState(false);
  const [dispatchedChatIds, setDispatchedChatIds] = useState(false);

  // Fetch chatbot session IDs once after assessment is completed
  useEffect(() => {
    if (userDetails?.completed && !fetchedChatIds) {
      triggerIds();
      setFetchedChatIds(true);
    }
  }, [userDetails?.completed, fetchedChatIds, triggerIds]);

  // Dispatch chatbot session IDs to store
  useEffect(() => {
    if (idsData && !dispatchedChatIds) {
      dispatch(setChatbotIds(idsData.data));
      dispatch(setLoadingIds(idsLoading));
      setDispatchedChatIds(true);
    }
  }, [idsData, idsLoading, dispatchedChatIds, dispatch]);

  //  Register user on socket after assessment is completed
  useEffect(() => {
    if (userDetails && token) {
      const decodedToken = jwtDecode(token);
      const userIdFromToken = decodedToken?._id;
      if (!socket.connected) socket.connect();

      const handleConnect = () => {
        console.log("User ID:", userIdFromToken);
        console.log("Socket connected:", socket.id);
        socket.emit("register", userIdFromToken);
      };

      const handleNotification = (data) => {
        console.log("Notification received via socket:", data);
        dispatch(addRealtimeNotification(data));
        // Refetch notifications to sync with backend
        dispatch(notificationApi.util.invalidateTags(["Notifications"]));
      };

      const handleError = (err) => {
        console.error("Socket error:", err.message);
      };

      socket.on("connect", handleConnect);
      socket.on("notification", handleNotification);
      socket.on("connect_error", handleError);

      // If already connected, register immediately
      if (socket.connected) {
        handleConnect();
      }

      return () => {
        socket.off("connect", handleConnect);
        socket.off("notification", handleNotification);
        socket.off("connect_error", handleError);
      };
    }
  }, [userDetails, token, dispatch]);

  // Logout and redirect on token error
  if (isError) {
    dispatch(logout());
    return <Navigate to="/login" replace />;
  }

  // Show loader while checking token or user info
  if (isUserLoading || (token && !user)) {
    return <CustomLoader />;
  }

  // Redirect unauthenticated users
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  // Check if accessing dashboard routes - allow if authenticated
  const isDashboardRoute = location.pathname.startsWith("/dashboard") ||
    location.pathname.startsWith("/chat") ||
    location.pathname.startsWith("/mood") ||
    location.pathname.startsWith("/therapy-plan") ||
    location.pathname.startsWith("/analytics") ||
    location.pathname.startsWith("/emergency") ||
    location.pathname.startsWith("/profile") ||
    location.pathname.startsWith("/settings");

  // If accessing dashboard and user is authenticated, allow access
  if (isDashboardRoute) {
    return <Outlet />;
  }

  // For /auth/* routes, check assessment completion
  // If userDetails not loaded yet or chatbot IDs still loading
  if (!userDetails || (userDetails?.completed && (!idsData || idsLoading))) {
    return <CustomLoader />;
  }

  // If userDetails exists but is not completed and trying to access protected routes
  if (location.pathname === "/auth/user-dashboard" && userDetails && !userDetails.completed) {
    return <Navigate to="/auth/assessment" replace />;
  }

  // If current path is "/" (root), redirect to first chatbot session
  if (location.pathname === "/") {
    const firstChatId = idsData?.data?.[0]?.sessionId || "new-chat";
    return <Navigate to={`/auth/chatbot/${firstChatId}`} replace />;
  }

  // Authenticated and ready — show protected content
  return <Outlet />;
};

export default PrivateRoutes;
