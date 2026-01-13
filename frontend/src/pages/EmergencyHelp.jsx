import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useTranslation } from "../i18n/i18nConfig";
import Card from "../components/commonComponents/Card";
import Button from "../components/commonComponents/Button";
import Alert from "../components/commonComponents/Alert";
import Modal from "../components/commonComponents/Modal";
import { FiPhone, FiMessageSquare, FiActivity, FiShield, FiExternalLink, FiHeart, FiWind } from "react-icons/fi";

const EmergencyHelp = () => {
  const navigate = useNavigate();
  const theme = useSelector((state) => state.ui?.theme);
  const language = localStorage.getItem("language") || "en";
  const { t } = useTranslation(language);

  const hotlines = [
    {
      name: "Mental Health Helpline",
      number: "1-800-273-8255",
      available: "24/7",
      country: "USA",
      icon: FiShield
    },
    {
      name: "Crisis Text Line",
      number: "Text HOME to 741741",
      available: "24/7",
      country: "USA",
      icon: FiMessageSquare
    },
    {
      name: "International Association",
      number: "1-250-494-3369",
      available: "24/7",
      country: "International",
      icon: FiActivity
    },
    {
      name: "SAMHSA National Helpline",
      number: "1-800-662-4357",
      available: "24/7",
      country: "USA",
      icon: FiHeart
    },
  ];

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div>
        <h1 className={`text-3xl lg:text-4xl font-black font-heading mb-2 ${theme === 'dark' ? 'text-white' : 'text-[#0B6A5A]'}`}>
          Safety Net
        </h1>
        <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} font-medium`}>Resources and support for when you need it most.</p>
      </div>

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { title: t("emergency.callHotline"), icon: FiPhone, color: "bg-[#0B6A5A]", lightColor: "bg-[#0B6A5A]", textColor: "text-[", label: "Call Now", action: () => { } },
          { title: t("emergency.chat24_7"), icon: FiMessageSquare, color: "bg-[#0B6A5A]", lightColor: "bg-[#0B6A5A]", textColor: "text-black", label: "Chat Now", action: () => navigate("/chat") },
          { title: t("emergency.emergencyServices"), icon: FiActivity, color: "bg-[#0B6A5A]", lightColor: "bg-[#0B6A5A]", textColor: "text-black", label: "Dial 911", action: () => { } }
        ].map((item, i) => (
          <div key={i} className={`${theme === 'dark' ? 'bg-slate-800 border-slate-700 hover:border-customText' : 'bg-white border-[#E0F2F1] hover:border-[#90D6CA]'} p-8 rounded-3xl border shadow-sm flex flex-col items-center text-center group transition-all`}>
            <div className={`${item.lightColor} ${item.textColor} w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
              <item.icon size={32} />
            </div>
            <h3 className={`text-xl font-extrabold mb-6 leading-tight h-12 flex items-center ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>{item.title}</h3>
            <button
              onClick={item.action}
              className={`w-full ${item.color} text-white py-4 rounded-xl font-black text-sm shadow-lg hover:shadow-xl transition-all active:scale-95`}
            >
              {item.label}
            </button>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Hotlines List */}
        <div className="lg:col-span-2 space-y-6">
          <div className={`${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-[#E0F2F1]'} rounded-3xl shadow-sm border p-8`}>
            <h2 className={`text-2xl font-bold font-heading mb-8 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>{t("emergency.hotlines")}</h2>
            <div className="grid grid-cols-1 gap-4">
              {hotlines.map((hotline, index) => (
                <div
                  key={index}
                  className="group flex flex-col sm:flex-row items-center justify-between p-6 bg-gray-50/50 rounded-2xl border border-transparent hover:border-[#90D6CA] hover:bg-white transition-all gap-4"
                >
                  <div className="flex items-center gap-5 text-center sm:text-left flex-col sm:flex-row">
                    <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-[#0B6A5A] border border-gray-100 group-hover:shadow-md">
                      <hotline.icon size={24} />
                    </div>
                    <div>
                      <p className="font-extrabold text-[#0B6A5A] text-lg leading-tight mb-1">{hotline.name}</p>
                      <p className="text-sm text-gray-400 font-bold uppercase tracking-widest leading-none mb-1">
                        {hotline.number}
                      </p>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest opacity-60">
                        {hotline.available} • {hotline.country}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => window.location.href = `tel:${hotline.number.replace(/\D/g, "")}`}
                    className="bg-white border-2 border-[#E0F2F1] text-[#0B6A5A] px-6 py-2.5 rounded-xl font-black text-sm hover:border-[#0B6A5A] hover:bg-[#F0FDFA] transition-all flex items-center gap-2 group-hover:shadow-sm"
                  >
                    <FiPhone /> Call
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Resources Sidebar */}
        <div className="space-y-6">
          <div className={`${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-[#E0F2F1]'} rounded-3xl shadow-sm border p-8 h-full`}>
            <h2 className={`text-2xl font-bold font-heading mb-8 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>Instant Relief</h2>
            <div className="space-y-6">
              {[
                { title: "Breathing Exercise", desc: "The 4-7-8 technique for immediate calm.", icon: FiWind, color: "bg-blue-50 text-blue-500", action: "Start" },
                { title: "Guided Meditation", desc: "Short 5-min session for grounding.", icon: FiHeart, color: "bg-green-50 text-green-500", action: "Listen" },
                { title: "Grounding 5-4-3-2-1", desc: "Visual and tactile reality check.", icon: FiActivity, color: "bg-purple-50 text-purple-500", action: "Learn" }
              ].map((res, i) => (
                <div key={i} className="group relative p-6 bg-gray-50/50 rounded-2xl border border-transparent hover:border-[#90D6CA] hover:bg-white transition-all cursor-pointer">
                  <div className="flex items-center gap-4 mb-3">
                    <div className={`${res.color} w-10 h-10 rounded-xl flex items-center justify-center`}>
                      <res.icon size={20} />
                    </div>
                    <h4 className="font-black text-[#0B6A5A]">{res.title}</h4>
                  </div>
                  <p className="text-sm text-gray-400 font-medium leading-relaxed mb-4">{res.desc}</p>
                  <button className="w-full py-2 bg-white rounded-lg font-bold text-xs uppercase tracking-widest text-gray-400 border border-gray-100 hover:text-[#0B6A5A] hover:border-[#90D6CA] transition-all">
                    {res.action} Now
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default EmergencyHelp;
