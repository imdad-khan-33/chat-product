import { FcGoogle } from "react-icons/fc";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

// CustomGoogleButton.jsx
const CustomGoogleButton = ({ mode = "login" }) => {
  const handleGoogleLogin = () => {
    // Redirect to backend Google OAuth URL
    window.location.href = `${BASE_URL}/users/google`;
  };

  return (
    <div className="flex justify-between gap-5">
      <button
        onClick={handleGoogleLogin}
        className="px-5 m-auto bg-[#A3D2CA] flex items-center justify-center gap-2 font-body font-semibold text-[16px] rounded-lg py-2"
      >
        <FcGoogle className="text-3xl flex" size={20} />
        <span className="text-[#333333]">
          {mode === "signup" ? "Sign Up with Google" : "Login with Google"}
        </span>
      </button>
    </div>
  );
};

export default CustomGoogleButton;
