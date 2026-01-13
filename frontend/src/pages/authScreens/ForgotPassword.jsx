import { useForm } from "react-hook-form";
import image from "../../assets/images/auth-left.png";
import { useForgotPasswordMutation } from "../../slices/auth/authApi";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const ForgotPassword = () => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();
  const [forgotPassword, { isLoading: forgotLoading }] =
    useForgotPasswordMutation();
  const navigate = useNavigate();

  const onSubmit = async (values) => {
    try {
      await forgotPassword(values).unwrap();
      toast.success("Verification code sent to your email!");
      navigate("/forgot-otp", { state: { email: values.email } });
    } catch (error) {
      console.error("Forgot password failed:", error);
      if (error.data.message === "User not found with this email") {
        toast.error("User with this email does not exist.");
      } else {
        toast.error("Failed to send verification code.");
      }
    }
    reset();
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
            Forgot password
          </h1>
          <p className="font-normal font-body text-[14px] text-[#828282] p-0 m-0">
            Enter your email for the verification process, we will send 6 digits
            code to your email.
          </p>

     
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="w-full flex flex-col gap-3"
        >
          <div className="flex flex-col gap-0">
            <label
              htmlFor="email"
              className="font-body text-[#344054] font-normal text-[14px]"
            >
              Email:
            </label>
            <input
              className="auth-input w-[100%]"
              type="email"
              id="email"
              placeholder="Enter your email"
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
          <button
            type="submit"
            className="bg-customBg text-[#FFFFFF] text-body text-[16px] w-full font-semibold p-1 rounded text-center disabled:cursor-not-allowed"
            disabled={forgotLoading}
          >
            Continue
          </button>
        </form>
      </div>
    </div>
        </div>
  );
};

export default ForgotPassword;
