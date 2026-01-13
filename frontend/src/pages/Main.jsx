import { useState } from "react";
import robotHelloBg from "../assets/images/robot-hello.png";
import { useNavigate } from "react-router-dom";

const Main = () => {
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();

  const handleGetStarted = () => {
    console.log("Get Started clicked");
    // Add navigation logic here
    navigate('/login')
  };

  return (
    <div className="w-full h-screen">
      <div className="flex flex-col lg:flex-row h-full w-full">
           {/* Left Side */}
<div className="w-full lg:w-1/2 bg-[#90D6CA] flex items-center justify-center px-6 py-10">
  <div className="max-w-sm w-full text-center lg:text-left flex flex-col items-center lg:items-start justify-center h-full space-y-10">
    <h1 className="text-[32px] md:text-3xl font-heading text-[#014237] font-semibold">
      Meet Your Virtual Therapist
    </h1>
    <p className="text-[25px] md:text-xl text-[#014237] font-body">
      It’s a pleasure to meet you! How can I assist you today?
    </p>
    <button
      onClick={handleGetStarted}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`w-[360px] h-[44px] rounded-md text-white text-lg font-semibold transition-transform duration-300 font-body mx-auto ${
        isHovered ? "scale-105 shadow-lg" : "scale-100"
      }`}
      style={{ backgroundColor: "#014237" }}
    >
      Get Started
    </button>
  </div>
</div>


        {/* Right Side */}
        <div className="w-full lg:w-1/2 bg-white flex items-center justify-center px-6 py-10">
          <img
            src={robotHelloBg}
            alt="Robot waving hello"
            className="w-full max-w-sm animate-float object-contain"
          />
        </div>
      </div>

      {/* Styles */}
      <style jsx="true">{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        .font-heading {
          font-family: 'Inter', sans-serif;
        }
        .font-body {
          font-family: 'Poppins', sans-serif;
        }
      `}</style>
    </div>
  );
};

export default Main;
