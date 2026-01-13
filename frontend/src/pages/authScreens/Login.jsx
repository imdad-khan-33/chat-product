import { useState } from "react";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import {
  useLoginMutation,
  useVerifyLoginOtpMutation,
  useLazyGetCurrentUserQuery,
} from "../../slices/auth/authApi";
import { useForm } from "react-hook-form";
import { FaEyeSlash } from "react-icons/fa";
import { IoEyeOutline } from "react-icons/io5";
import { useDispatch, useSelector } from "react-redux";
import { setCredentials, setUserDetails } from "../../slices/auth/authSlice";
import CustomGoogleButton from "../../components/commonComponents/CustomGoogleButton";


import notifyToast from "../../utils/utilityFunctions";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const [LoginUser, { isLoading: LoginLoading }] = useLoginMutation();
  const [verifyLoginOtp, { isLoading: VerifyOtpLoading }] = useVerifyLoginOtpMutation();
  const [getCurrentUser] = useLazyGetCurrentUserQuery();
  const { LoadingIds } = useSelector((state) => state.chatbotSlice);
  const dispatch = useDispatch();
  const navigate = useNavigate();


  // Submit Login request
  const onSubmit = async (formData) => {
    if (!otpSent) {
      // Step 1: Send credentials and get OTP
      try {
        const res = await LoginUser(formData).unwrap();
        setUserEmail(formData.email);
        setOtpSent(true);
        notifyToast("OTP sent to your email!", "success");
      } catch (error) {
        console.error("Login error:", error);
        if (error?.data?.message === "User not found") {
          notifyToast("Email not found. Please register first.", "error");
        } else if (error?.data?.message === "Invalid password") {
          notifyToast("Incorrect password. Please try again.", "error");
        } else if (error?.data?.message === "User not verified") {
          notifyToast("User not verified. Please check your email.", "error");
        } else if (error?.data?.message === "User not verfied") {
          notifyToast("User not verified. Please check your email.", "error");
        } else {
          notifyToast(error?.data?.message || "Login failed. Please try again.", "error");
        }
      }
    } else {
      // Step 2: Verify OTP and complete login
      try {
        const res = await verifyLoginOtp({ email: userEmail, otp: formData.otp }).unwrap();
        const { accessToken, refreshToken, user } = res.data;

        // 2. Save token to Redux + localStorage
        dispatch(setCredentials(accessToken));
        dispatch(setUserDetails(user)); // Set user details immediately
        localStorage.setItem("Therapy-user-token", accessToken);
        if (refreshToken) {
          localStorage.setItem("Therapy-refresh-token", refreshToken);
        }

        // 3. Get assessment status
        try {
          const assessmentRes = await getCurrentUser().unwrap();
          console.log("Assessment details:", assessmentRes);

          // 4. Toast and navigate
          toast.success("Login successful!");
          reset();

          if (assessmentRes?.data?.completed) {
            console.log("Navigating to dashboard");
            setTimeout(() => navigate(`/dashboard`), 500);
          } else {
            console.log("Navigating to assessment");
            setTimeout(() => navigate("/auth/assessment"), 500);
          }
        } catch (userError) {
          console.error("Error getting user details:", userError);
          // If getting user details fails, still try to navigate to dashboard
          toast.success("Login successful!");
          reset();
          setTimeout(() => navigate("/dashboard"), 500);
        }
      } catch (error) {
        console.error("OTP verification error:", error);
        notifyToast(error?.data?.message || "Invalid OTP. Please try again.", "error");
      }
    }
  };

  return (
    <div className="min-h-screen w-full flex">
      {/* Left side with #90D6CA background */}
      <div className="w-1/2 h-screen" style={{ backgroundColor: '#90D6CA' }}></div>

      {/* Right side with light background */}
      <div className="w-1/2 h-screen bg-gray-50"></div>

      {/* Centered form container - positioned absolutely to overlap both sides */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {/* Heading above the form */}
        <h1 className="md:text-[33px] text-[24px] font-semibold font-heading text-[#06594A] text-center mb-8">
          Login to Chatbot Therapy
        </h1>

        {/* Form card */}
        <div className="z-10 bg-white py-[30px] md:px-[52px] px-[30px] rounded-[20px] md:w-[400px] w-[90%] shadow-custom flex flex-col gap-3">
          <p className="text-2xl font-semibold font-body text-[#06594A] text-left">
            Login in your account
          </p>

          <div className="w-full">
            <CustomGoogleButton mode="login" />
          </div>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-3"
          >
            <p className="text-center text-[#98A2B3] font-semibold font-body">
              or
            </p>

            {/* Email */}
            <div className="flex flex-col">
              <label
                htmlFor="email"
                className="font-body text-[#344054] text-[14px]"
              >
                Email:
              </label>
              <input
                className="auth-input placeholder:text-[14px]"
                type="email"
                id="email"
                placeholder="Enter your email"
                autoComplete="email"
                disabled={otpSent}
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Invalid email address",
                  },
                })}
              />
              {errors.email && (
                <span className="text-red-500 text-[12px]">
                  {errors.email.message}
                </span>
              )}
            </div>

            {/* Password - Only shown if OTP not sent yet */}
            {!otpSent && (
              <div className="flex flex-col relative">
                <label
                  htmlFor="password"
                  className="font-body text-[#344054] text-[14px] flex justify-between"
                >
                  <span>Password</span>
                  <Link to="/forgot-password">Forgot Password</Link>
                </label>
                <input
                  className="auth-input placeholder:text-[14px]"
                  type={showPassword ? "text" : "password"}
                  id="password"
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  {...register("password", {
                    required: !otpSent ? "Password is required" : false,
                    minLength: {
                      value: 6,
                      message: "Password must be at least 6 characters",
                    },
                    pattern: {
                      value: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/,
                      message:
                        "Password must contain at least one letter and one number",
                    },
                  })}
                />
                <span
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-9 cursor-pointer text-gray-500"
                >
                  {showPassword ? (
                    <IoEyeOutline size={20} />
                  ) : (
                    <FaEyeSlash size={20} />
                  )}
                </span>
                {errors.password && (
                  <span className="text-red-500 text-[12px]">
                    {errors.password.message}
                  </span>
                )}
              </div>
            )}

            {/* OTP Input - Only shown after OTP is sent */}
            {otpSent && (
              <div className="flex flex-col">
                <div className="flex flex-col gap-0">
                  <label
                    htmlFor="otp"
                    className="font-body text-[#344054] font-normal text-[14px]"
                  >
                    Enter OTP
                  </label>
                  <input
                    className="auth-input placeholder:text-[14px]"
                    type="text"
                    id="otp"
                    placeholder="Enter 6-digit OTP sent to your email"
                    maxLength={6}
                    autoFocus
                    {...register("otp", {
                      required: otpSent ? "OTP is required" : false,
                      pattern: {
                        value: /^\d{6}$/,
                        message: "OTP must be 6 digits",
                      },
                    })}
                  />
                </div>
                {errors.otp && (
                  <span className="text-red-500 text-[12px]">
                    {errors.otp.message}
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setOtpSent(false);
                    setUserEmail("");
                    reset({ otp: "", password: "" });
                  }}
                  className="text-[#06594A] text-[12px] mt-1 text-left hover:underline"
                >
                  Change credentials?
                </button>
              </div>
            )}

            <button
              className="bg-customBg text-[#FCFCFD] text-[16px] font-semibold p-2 rounded disabled:opacity-50 disabled:cursor-not-allowed"
              type="submit"
              disabled={LoginLoading || VerifyOtpLoading}
            >
              {LoginLoading
                ? "Sending OTP..."
                : VerifyOtpLoading
                  ? "Verifying..."
                  : otpSent
                    ? "Verify & Log In"
                    : "Continue"}
            </button>
          </form>
        </div>

        <p className="text-[16px] font-normal">
          <span className="text-[#98A2B3] font-body">
            Don't have an account?
          </span>{" "}
          <Link to="/register" className="text-[#000000] font-body">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
