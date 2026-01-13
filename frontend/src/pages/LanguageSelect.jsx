import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "../i18n/i18nConfig";
import Button from "../components/commonComponents/Button";
import Card from "../components/commonComponents/Card";

const LanguageSelect = () => {
  const navigate = useNavigate();
  const { t: tEn } = useTranslation("en");
  const [selectedLanguage, setSelectedLanguage] = useState("en");

  const languages = [
    { code: "en", name: "English", flag: "🇬🇧" },
    { code: "ur", name: "اردو", flag: "🇵🇰" },
    { code: "ps", name: "پشتو", flag: "🇦🇫" },
  ];

  const handleContinue = () => {
    localStorage.setItem("language", selectedLanguage);
    navigate("/login");
  };

  return (
    <div className="w-full h-screen bg-gradient-to-b from-customBg to-customText flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            {tEn("languageSelect.title")}
          </h1>
          <p className="text-gray-100 text-lg">
            {tEn("languageSelect.subtitle")}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 mb-8">
          {languages.map((lang) => (
            <Card
              key={lang.code}
              onClick={() => setSelectedLanguage(lang.code)}
              className={`cursor-pointer transition-all transform hover:scale-105 ${
                selectedLanguage === lang.code
                  ? "border-4 border-customText bg-white"
                  : "border-2 border-transparent"
              }`}
            >
              <div className="flex items-center gap-4">
                <span className="text-4xl">{lang.flag}</span>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-800">
                    {lang.name}
                  </h3>
                </div>
                {selectedLanguage === lang.code && (
                  <div className="w-6 h-6 bg-customText rounded-full"></div>
                )}
              </div>
            </Card>
          ))}
        </div>

        <Button
          variant="primary"
          size="lg"
          onClick={handleContinue}
          className="w-full"
        >
          {tEn("common.continue")}
        </Button>
      </div>
    </div>
  );
};

export default LanguageSelect;
