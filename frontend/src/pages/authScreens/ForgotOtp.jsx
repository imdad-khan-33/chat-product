import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import image from "../../assets/images/auth-left.png";
import { useVerifyOtpMutation } from "../../slices/auth/authApi";
import notifyToast from "../../utils/utilityFunctions";
import { useLocation, useNavigate } from "react-router-dom";

const ForgotOtp = ({ initialTime = 60 }) => {
  const [otp, setOtp] = useState(Array(6).fill(""));
  const inputRefs = useRef([]);
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const [isActive, setIsActive] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const [submitOpt, { isLoading: submitLoading }] = useVerifyOtpMutation();


  const {
    handleSubmit,
    register,
    setValue,
    getValues,
    reset,
    formState: { errors },
  } = useForm();

  // Countdown timer
  useEffect(() => {
    let interval;
    if (timeLeft > 0 && isActive) {
      interval = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      setIsActive(false);
    }
    return () => clearTimeout(interval);
  }, [timeLeft, isActive]);

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds
      .toString()
      .padStart(2, '0')}`;
  };

  // Submit OTP
  const onSubmit = async () => {
    const otpValue = getValues(['otp0', 'otp1', 'otp2', 'otp3', 'otp4', 'otp5']).join('');
    try { 
      await submitOpt({ otp: otpValue }).unwrap();
      notifyToast("OTP submitted successfully!", "success");
      reset();
      navigate("/create-new-password", { state: { email: location.state?.email } });
    } catch (error) {
      console.error("OTP submission failed:", error);
      notifyToast("OTP submission failed. Please try again.", "error");
    }
    reset();
  };

  // Handle OTP input change
  const handleInput = (e, index) => {
    const { value } = e.target;
    if (!/^[0-9]{0,1}$/.test(value)) return;

    setOtp((prevOtp) => {
      const updated = [...prevOtp];
      updated[index] = value;
      return updated;
    });

    setValue(`otp${index}`, value);

    if (value && index < otp.length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Handle key events (like backspace navigation)
  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !e.target.value && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleFocus = (e) => e.target.select();

  const handlePaste = (e) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text");
    if (!new RegExp(`^[0-9]{${otp.length}}$`).test(text)) return;
    const digits = text.split("");
    setOtp(digits);
    digits.forEach((digit, index) => {
      setValue(`otp${index}`, digit);
    });
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
          <h1 className="font-semibold text-[28px] text-[#06594A]">
            Verification
          </h1>
          <p className="font-normal font-body text-[14px] text-[#828282] p-0 m-0">
            Enter your 6 digits code that you received on your email.
          </p>
    
    

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
          <div id="otp-form" className="flex gap-2">
            {otp.map((digit, index) => (
              <input
                key={index}
                type="text"
                maxLength={1}
                value={digit}
                {...register(`otp${index}`)}
                onChange={(e) => handleInput(e, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                onFocus={handleFocus}
                onPaste={handlePaste}
                ref={(el) => (inputRefs.current[index] = el)}
                className="text-[#153060] font-heading flex w-[59.78px] h-[54.77px] items-center justify-center rounded-lg border border-[#9BADCA] border-stroke bg-white p-2 text-center text-2xl font-normal outline-none"
              />
            ))}
          </div>

          <span className="text-red-500 text-[12px] text-center">
            {formatTime(timeLeft)}
          </span>

          <button
            type="submit"
            disabled={!isActive || otp.some((digit) => digit === "")}
            className="bg-customBg text-[#FFFFFF] text-body text-[16px] w-full font-semibold p-1 rounded text-center disabled:cursor-not-allowed"
          >
            Verify
          </button>

          <p className="font-body font-normal text-[#828282] text-[12px] text-center">
            If you didn’t receive a code!{" "}
            <span className="text-[#d62c2c] cursor-pointer">Resend</span>
          </p>
        </form>
      </div>
    </div>
    </div>
  );
};

export default ForgotOtp;
