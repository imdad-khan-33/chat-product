import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

import frameImg from "../assets/images/Frame.png";
import compGif from "../assets/images/Comp.gif";

const Onboarding = () => {
  const [isHovered, setIsHovered] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const swiperRef = useRef(null);
  const navigate = useNavigate();

  const slides = [
    {
      img: frameImg,
      title: "Your Mental Wellness, Just a Chat Away",
      desc: "Welcome to your personal therapy companion available 24/7. ChatBot Therapy offers a safe, private space where you can express yourself freely. Whether you're feeling stressed, anxious, lonely, or overwhelmed, our AI-powered chatbot is always ready to listen, understand, and guide you gently",
    },
    {
      img: compGif,
      title: "Talk Freely. Feel Better",
      desc: "This app doesn't just listen — it grows with you. From tracking your moods to offering daily reflections, relaxation exercises, and coping strategies, ChatBot Therapy is designed to adapt to your emotional needs. Every conversation helps you gain clarity, calmness, and confidence in your mental well-being journey.",
    },
  ];

  const handleSkip = () => navigate("/main");
  const handleNext = () =>
    currentSlide < slides.length - 1
      ? swiperRef.current.slideNext()
      : navigate("/main");

  return (
    <div className="w-full h-screen">
      <Swiper
        modules={[Pagination]}
        pagination={false}
        onSwiper={(swiper) => (swiperRef.current = swiper)}
        onSlideChange={(swiper) => setCurrentSlide(swiper.activeIndex)}
        className="w-full h-full"
      >
        {slides.map((slide, index) => (
          <SwiperSlide key={index}>
            <div className="flex flex-col lg:flex-row h-full ">
              {/* Left Content */}
              <div className="w-full lg:w-1/2 bg-[#90D6CA] flex items-center justify-center p-6">
                <div className="max-w-md w-full flex flex-col items-center text-center">
                  <h1 className="text-[22px] md:text-[24px] font-bold text-[#06594A] mb-6 font-heading leading-snug">
                    {slide.title}
                  </h1>
                  <p className="text-[14px] font-body text-[#06594A] leading-relaxed mb-8">
                    {slide.desc}
                  </p>

                  {/* Pagination dots */}
                  <div className="flex justify-center gap-2 mb-10">
                    {slides.map((_, i) => (
                      <span
                        key={i}
                        className={`w-2 h-2 rounded-full transition-all duration-300 ${
                          currentSlide === i ? "bg-[#1D3B37]" : "bg-white"
                        }`}
                      />
                    ))}
                  </div>

                  {/* Buttons */}
                  <div className="flex gap-4 justify-center">
                    <button
                      onClick={handleSkip}
                      className="w-[120px] border border-[#1D3B37] text-[#1D3B37] text-[14px] font-semibold py-2 rounded-md font-body transition-all"
                    >
                      Skip
                    </button>
                    <button
                      onClick={() => swiperRef.current.slidePrev()}
                      disabled={currentSlide === 0}
                      className={`w-[100px] border text-[14px] font-semibold py-2 rounded-md font-body transition-all ${
                        currentSlide === 0
                          ? "border-gray-400 text-gray-400 cursor-not-allowed"
                          : "border-[#1D3B37] text-[#1D3B37]"
                      }`}
                    >
                      Back
                    </button>
                    <button
                      onClick={handleNext}
                      onMouseEnter={() => setIsHovered(true)}
                      onMouseLeave={() => setIsHovered(false)}
                      className={`w-[135px] bg-[#1D3B37] text-white text-[14px] font-semibold py-2 rounded-md font-body transition-all duration-300 transform ${
                        isHovered ? "scale-105 shadow-md" : "scale-100"
                      }`}
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Image */}
              <div className="w-full lg:w-1/2 md:p-32 bg-white flex items-center justify-center p-6">
                <img
                  src={slide.img}
                  alt={`Slide ${index}`}
                  className="object-contain animate-float"
                />
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      <style jsx="true">{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        .animate-float {
          animation: float 3s ease-in-out infinite;
        }

        .font-heading {
          font-family: "Inter", sans-serif;
        }

        .font-body {
          font-family: "Poppins", sans-serif;
        }
      `}</style>
    </div>
  );
};

export default Onboarding;
