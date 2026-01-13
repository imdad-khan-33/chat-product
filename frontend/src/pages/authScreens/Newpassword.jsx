import { useState } from "react";
import { useForm } from "react-hook-form";
import { FaEyeSlash } from "react-icons/fa";
import { IoEyeOutline } from "react-icons/io5";
import { useResetPasswordMutation } from "../../slices/auth/authApi";
import { useLocation, useNavigate } from "react-router-dom";
import notifyToast from "../../utils/utilityFunctions";

const Newpassword = () => {
    const {  register, handleSubmit, formState: { errors }, reset } = useForm();
    const [showPassword, setShowPassword] = useState(false);
    const [showCPassword, setShowCPassword] = useState(false);
    const location = useLocation();
    const [email, setEmail] = useState(location.state?.email);
    const [resetPassword, { isLoading: resetLoading }] = useResetPasswordMutation();
    const navigate = useNavigate();


    const onSubmit = async (data) => {
        const payload ={
            password: data.password,
            email: email,
        }
        try {
            await resetPassword(payload).unwrap();
            notifyToast("Password reset successful!", "success");
            navigate('/login');
            reset();
        } catch (error) {
            console.error("Login failed:", error);
            notifyToast("Password reset failed. Please try again.", "error");
        }
    };


  return (
    <div className="min-h-screen relative flex">
      {/* Left side with teal background */}
      <div className="w-1/2 bg-[#90D6CA]"></div>
      
      {/* Right side with light background */}
      <div className="w-1/2 bg-gray-50"></div>
      
      {/* Centered form container - positioned absolutely to overlap both sides */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="z-10 bg-white py-[65.89px] px-[49.42px] rounded-[20px] md:w-[490.97px] md:mx-0 mx-6 gap-3 shadow-lg flex justify-center items-center flex-col m-auto">
        
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="z-10   md:w-[400px] flex flex-col gap-3"
        >
          <p className="text-2xl font-semibold text-center font-body text-[#06594A]">
            New Password
          </p>

          {/* Password Input */}
          <div className="flex flex-col">
            <div className="flex flex-col gap-2 relative">
              <label
                htmlFor="password"
                className="font-body text-[#344054] font-normal text-[14px] flex justify-between"
              >
                Enter new password
              </label>
              <input
                className="auth-input placeholder:text-[14px]"
                type={showPassword ? "text" : "password"}
                id="password"
                placeholder="Enter your password"
                {...register("password", {
                  required: "Password is required",
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
                {!showPassword ? (
                  <FaEyeSlash size={20} />
                ) : (
                  <IoEyeOutline size={20} />
                )}
              </span>
            </div>
            {errors.password && (
              <span className="text-red-500 text-[12px]">
                {errors.password.message}
              </span>
            )}
          </div>
          {/* Confirm password */}
          <div className="flex flex-col">
            <div className="flex flex-col gap-2 relative">
              <label
                htmlFor="Cpassword"
                className="font-body text-[#344054] font-normal text-[14px] flex justify-between"
              >
                Confirm Password
              </label>
              <input
                className="auth-input placeholder:text-[14px]"
                type={showCPassword ? "text" : "password"}
                id="Cpassword"
                placeholder="Enter your password"
                {...register("Cpassword", {
                  required: "Confirm Password is required",
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
                onClick={() => setShowCPassword(!showCPassword)}
                className="absolute right-3 top-9 cursor-pointer text-gray-500"
              >
                {!showCPassword ? (
                  <FaEyeSlash size={20} />
                ) : (
                  <IoEyeOutline size={20} />
                )}
              </span>
            </div>
            {errors.password && (
              <span className="text-red-500 text-[12px]">
                {errors.password.message}
              </span>
            )}
          </div>
          <button
            className="bg-customBg text-[#FCFCFD] text-[16px] font-semibold p-2 rounded disabled:opacity-50 disabled:cursor-not-allowed"
            type="submit"
            // disabled={LoginLoading}
          >
            {resetLoading ? "Logging In..." : "Log In"}
          </button>
        </form>
        <p className="text-[16px] font-normal">
          <span className="text-[#98A2B3] font-body">
            Don't have an account?
          </span>{" "}
          <a href="/register" className="text-[#44615D] font-body">
            Register
          </a>
        </p>
      </div>
    </div>
    </div>
  );
};

export default Newpassword;
