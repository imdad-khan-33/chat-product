import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "../i18n/i18nConfig";

const Splash = () => {
  const navigate = useNavigate();
  const { t } = useTranslation("en");

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/onboarding");
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="w-full h-screen bg-gradient-to-b from-customBg to-customText flex flex-col items-center justify-center">
      <div className="text-center">
        <h1 className="text-5xl lg:text-6xl font-bold text-white mb-4">
          {t("splash.title")}
        </h1>
        <p className="text-xl lg:text-2xl text-gray-100 mb-8">
          {t("splash.subtitle")}
        </p>
        <div className="flex justify-center gap-2">
          <div className="w-3 h-3 bg-white rounded-full animate-bounce"></div>
          <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
          <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></div>
        </div>
      </div>
    </div>
  );
};

export default Splash;
