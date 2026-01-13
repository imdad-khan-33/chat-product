import "./App.css";
import { Route, Routes } from "react-router-dom";
import { Navigate } from "react-router-dom";
import PrivateRoutes from "./layouts/PrivateRoutes";
import DashboardLayout from "./layouts/DashboardLayout";
import DashboardProtect from "./layouts/DashboardProtect";
import { Toaster } from "react-hot-toast";
import { lazy, Suspense } from "react";
import CustomLoader from "./components/commonComponents/CustomLoader";
import AssessmentResult from "./pages/AssessmentResult";
import Chatbot from "./pages/Chatbot";
import SessionChat from "./pages/SessionChat";
import UserDashboard from "./pages/UserDashboard";
import StreamChat from "./pages/StreamChat";
import Splash from "./pages/Splash";
import LanguageSelect from "./pages/LanguageSelect";
import DashboardHome from "./pages/DashboardHome";
import ChatTherapy from "./pages/ChatTherapy";
import MoodTracker from "./pages/MoodTracker";
import TherapyPlan from "./pages/TherapyPlan";
import Analytics from "./pages/Analytics";
import EmergencyHelp from "./pages/EmergencyHelp";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";

// Lazy loading components
const Assessment = lazy(() => import("./pages/Assessment"));
const Login = lazy(() => import("./pages/authScreens/Login"));
const Register = lazy(() => import("./pages/authScreens/Register"));
const NotFound = lazy(() => import("./pages/NotFound"));
const ForgotPassword = lazy(() => import("./pages/authScreens/ForgotPassword"));
const ForgotOtp = lazy(() => import("./pages/authScreens/ForgotOtp"));
const Newpassword = lazy(() => import("./pages/authScreens/Newpassword"));
const VerifyEmail = lazy(() => import("./pages/authScreens/VerifyEmail"));
const OAuthSuccess = lazy(() => import("./pages/authScreens/OAuthSuccess"));
const MainLayout = lazy(() => import("./layouts/MainLayout"));
const Onboarding = lazy(() => import("./pages/Onboarding"));
const Main = lazy(() => import("./pages/Main"));

import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import socket from "./utils/socket";
import { addRealtimeNotification } from "./slices/NotificationSlice/NotificationSlice";
import { notificationApi } from "./slices/NotificationSlice/notificationApi";
import toast from "react-hot-toast";

function App() {
  const theme = useSelector((state) => state.ui.theme);
  const location = useLocation();

  useEffect(() => {
    const excludedPaths = ["/login", "/register", "/auth/assessment", "/onboarding"];
    const isExcluded = excludedPaths.some(path => location.pathname === path || location.pathname.startsWith("/auth/assessment"));

    if (theme === "dark" && !isExcluded) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme, location.pathname]);
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.userDetails);

  useEffect(() => {
    if (!user?._id) return;

    // Connect socket if not already
    if (!socket.connected) socket.connect();

    const handleConnect = () => {
      console.log("✅ Connected to socket:", socket.id);
      socket.emit("register", user._id);
    };

    const handleNotification = (data) => {
      console.log("🟨 [App] Socket: Notification received event", data);
      dispatch(addRealtimeNotification(data));
      // Refetch notifications to sync with backend
      console.log("🟨 [App] Invalidating notification tags");
      dispatch(notificationApi.util.invalidateTags(["Notifications"]));
      toast.success(data.message || data.title, {
        icon: '🔔',
        duration: 5000
      });
    };

    const handleError = (err) => {
      console.error("❌ Socket connect error:", err.message);
    };

    socket.on("connect", handleConnect);
    socket.on("notification", handleNotification);
    socket.on("connect_error", handleError);

    // Initial registration if already connected
    if (socket.connected) {
      socket.emit("register", user._id);
    }

    return () => {
      socket.off("connect", handleConnect);
      socket.off("notification", handleNotification);
      socket.off("connect_error", handleError);
    };
  }, [user?._id, dispatch]);

  return (
    <div className="App w-full h-screen">
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Splash />} />
        <Route path="/home" element={<Splash />} />
        <Route path="/language-select" element={<LanguageSelect />} />
        <Route
          path="/login"
          element={
            <Suspense fallback={<CustomLoader />}>
              <Login />
            </Suspense>
          }
        />
        <Route
          path="/register"
          element={
            <Suspense fallback={<CustomLoader />}>
              <Register />
            </Suspense>
          }
        />
        <Route
          path="/forgot-password"
          element={
            <Suspense fallback={<CustomLoader />}>
              <ForgotPassword />
            </Suspense>
          }
        />
        <Route
          path="/api/v1/users/verify-email"
          element={
            <Suspense fallback={<CustomLoader />}>
              <VerifyEmail />
            </Suspense>
          }
        />
        <Route
          path="/forgot-otp"
          element={
            <Suspense fallback={<CustomLoader />}>
              <ForgotOtp />
            </Suspense>
          }
        />
        <Route
          path="/create-new-password"
          element={
            <Suspense fallback={<CustomLoader />}>
              <Newpassword />
            </Suspense>
          }
        />
        <Route
          path="/oauth-success"
          element={
            <Suspense fallback={<CustomLoader />}>
              <OAuthSuccess />
            </Suspense>
          }
        />
        <Route
          path="/onboarding"
          element={
            <Suspense fallback={<CustomLoader />}>
              <Onboarding />
            </Suspense>
          }
        />
        <Route
          path="/main"
          element={
            <Suspense fallback={<CustomLoader />}>
              <Main />
            </Suspense>
          }
        />

        {/* Dashboard Routes - Protected */}
        <Route
          path="/dashboard"
          element={
            <DashboardProtect>
              <DashboardLayout>
                <DashboardHome />
              </DashboardLayout>
            </DashboardProtect>
          }
        />
        <Route
          path="/chat"
          element={
            <DashboardProtect>
              <DashboardLayout>
                <ChatTherapy />
              </DashboardLayout>
            </DashboardProtect>
          }
        />
        <Route
          path="/mood"
          element={
            <DashboardProtect>
              <DashboardLayout>
                <MoodTracker />
              </DashboardLayout>
            </DashboardProtect>
          }
        />
        <Route
          path="/therapy-plan"
          element={
            <DashboardProtect>
              <DashboardLayout>
                <TherapyPlan />
              </DashboardLayout>
            </DashboardProtect>
          }
        />
        <Route
          path="/analytics"
          element={
            <DashboardProtect>
              <DashboardLayout>
                <Analytics />
              </DashboardLayout>
            </DashboardProtect>
          }
        />
        <Route
          path="/emergency"
          element={
            <DashboardProtect>
              <DashboardLayout>
                <EmergencyHelp />
              </DashboardLayout>
            </DashboardProtect>
          }
        />
        <Route
          path="/profile"
          element={
            <DashboardProtect>
              <DashboardLayout>
                <Profile />
              </DashboardLayout>
            </DashboardProtect>
          }
        />
        <Route
          path="/settings"
          element={
            <DashboardProtect>
              <DashboardLayout>
                <Settings />
              </DashboardLayout>
            </DashboardProtect>
          }
        />

        {/* Private Routes */}
        <Route path="/auth" element={<PrivateRoutes />}>
          <Route
            path="assessment"
            element={
              <Suspense fallback={<CustomLoader />}>
                <Assessment />
              </Suspense>
            }
          />
          <Route path="" element={<MainLayout />}>
            <Route
              path="user-dashboard"
              element={
                <Suspense fallback={<CustomLoader />}>
                  <UserDashboard />
                </Suspense>
              }
            />
            <Route
              path="assessment-result"
              element={
                <Suspense fallback={<CustomLoader />}>
                  <AssessmentResult />
                </Suspense>
              }
            />
            <Route
              path="chatbot/new-chat"
              element={
                <Suspense fallback={<CustomLoader />}>
                  <ChatTherapy />
                </Suspense>
              }
            />
            <Route
              path="chatbot/:id"
              element={
                <Suspense fallback={<CustomLoader />}>
                  <ChatTherapy />
                </Suspense>
              }
            />
            <Route
              path="session/:sessionId"
              element={
                <Suspense fallback={<CustomLoader />}>
                  <SessionChat />
                </Suspense>
              }
            />
          </Route>
        </Route>

        {/* 404 Not Found */}
        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />
      </Routes>
      <Toaster position="top-center" />
    </div>
  );
}

export default App;
