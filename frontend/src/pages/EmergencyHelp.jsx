import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useTranslation } from "../i18n/i18nConfig";
import toast from "react-hot-toast";
import {
  useGetEmergencyContactsQuery,
  useUpdateEmergencyContactsMutation,
  useTriggerSOSMutation
} from "../slices/emergency/emergencyApi";
import {
  FiPhone,
  FiMessageSquare,
  FiActivity,
  FiShield,
  FiHeart,
  FiWind,
  FiAlertTriangle,
  FiMapPin,
  FiPlus,
  FiTrash2,
  FiX,
  FiSave,
  FiLoader
} from "react-icons/fi";

const EmergencyHelp = () => {
  const navigate = useNavigate();
  const theme = useSelector((state) => state.ui?.theme);
  const language = localStorage.getItem("language") || "en";
  const { t } = useTranslation(language);

  // API Hooks
  const { data: contactsRes, isLoading: contactsLoading } = useGetEmergencyContactsQuery();
  const [updateContacts, { isLoading: updating }] = useUpdateEmergencyContactsMutation();
  const [triggerSOS, { isLoading: sosSending }] = useTriggerSOSMutation();

  const [emergencyContacts, setEmergencyContacts] = useState([]);
  const [showContactForm, setShowContactForm] = useState(false);
  const [newContact, setNewContact] = useState({ name: "", email: "", phone: "" });

  useEffect(() => {
    if (contactsRes?.data) {
      setEmergencyContacts(contactsRes.data);
    }
  }, [contactsRes]);

  const handleSOS = async () => {
    if (emergencyContacts.length === 0) {
      toast.error("Please add at least one emergency contact first!");
      setShowContactForm(true);
      return;
    }

    if (!window.confirm("🚨 This will send an immediate SOS alert with your location to all your emergency contacts. Proceed?")) return;

    // Get Geolocation
    if ("geolocation" in navigator) {
      toast.loading("Getting location and sending SOS...", { id: "sos" });
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            await triggerSOS({ latitude, longitude }).unwrap();
            toast.success("SOS Alert Sent Successfully!", { id: "sos" });
          } catch (err) {
            toast.error("Failed to send SOS: " + (err.data?.message || "Unknown error"), { id: "sos" });
          }
        },
        async (error) => {
          console.warn("Location permission denied, sending SOS without location.");
          try {
            await triggerSOS({ latitude: null, longitude: null }).unwrap();
            toast.success("SOS Sent (without location due to permission)", { id: "sos" });
          } catch (err) {
            toast.error("Failed to send SOS alert.", { id: "sos" });
          }
        }
      );
    } else {
      toast.error("Geolocation is not supported by your browser.");
    }
  };

  const handleAddContact = async (e) => {
    e.preventDefault();
    if (!newContact.name || !newContact.email) {
      toast.error("Name and Email are required!");
      return;
    }

    const updated = [...emergencyContacts, newContact];
    try {
      await updateContacts(updated).unwrap();
      setEmergencyContacts(updated);
      setNewContact({ name: "", email: "", phone: "" });
      setShowContactForm(false);
      toast.success("Contact added!");
    } catch (err) {
      toast.error("Failed to save contact.", err);
    }
  };

  const removeContact = async (index) => {
    const updated = emergencyContacts.filter((_, i) => i !== index);
    try {
      await updateContacts(updated).unwrap();
      setEmergencyContacts(updated);
      toast.success("Contact removed.");
    } catch (err) {
      toast.error("Failed to remove contact.");
    }
  };

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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className={`text-3xl lg:text-4xl font-black font-heading mb-2 ${theme === 'dark' ? 'text-white' : 'text-[#0B6A5A]'}`}>
            Safety Net
          </h1>
          <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} font-medium`}>Resources and support for when you need it most.</p>
        </div>

        {/* SOS BUTTON */}
        <button
          onClick={handleSOS}
          disabled={sosSending}
          className="relative group overflow-hidden bg-red-600 hover:bg-red-700 text-white px-10 py-5 rounded-[2rem] font-black text-xl shadow-2xl shadow-red-500/30 transition-all active:scale-95 flex items-center gap-4 animate-pulse hover:animate-none"
        >
          <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
          <FiAlertTriangle size={32} className="relative z-10" />
          <span className="relative z-10 flex flex-col items-start leading-none">
            <span className="text-xs uppercase tracking-[0.2em] font-bold opacity-80 mb-1">Emergency Service</span>
            TRIGGER SOS
          </span>
          {sosSending && <FiLoader className="animate-spin" />}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Hotlines & Contacts Section */}
        <div className="lg:col-span-2 space-y-8">

          {/* Personal Emergency Contacts */}
          <div className={`${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-[#E0F2F1]'} rounded-[2.5rem] shadow-sm border p-8`}>
            <div className="flex items-center justify-between mb-8">
              <h2 className={`text-2xl font-bold font-heading flex items-center gap-3 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                <FiMapPin className="text-[#0B6A5A]" />
                Personal Contacts
              </h2>
              <button
                onClick={() => setShowContactForm(!showContactForm)}
                className="bg-[#0B6A5A] text-white p-3 rounded-2xl hover:bg-[#084d41] transition-colors"
              >
                {showContactForm ? <FiX /> : <FiPlus />}
              </button>
            </div>

            {showContactForm && (
              <form onSubmit={handleAddContact} className={`mb-8 p-6 rounded-3xl space-y-4 border ${theme === 'dark' ? 'bg-slate-700/50 border-slate-600' : 'bg-slate-50/80 border-slate-100'}`}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Name (e.g., Mom)"
                    className={`w-full px-5 py-3 rounded-xl border-transparent focus:ring-2 focus:ring-[#0B6A5A]/30 transition-all outline-none ${theme === 'dark' ? 'bg-slate-900 text-white placeholder-slate-400' : 'bg-white text-gray-900 placeholder-gray-400'}`}
                    value={newContact.name}
                    onChange={e => setNewContact({ ...newContact, name: e.target.value })}
                  />
                  <input
                    type="email"
                    placeholder="Email Address"
                    className={`w-full px-5 py-3 rounded-xl border-transparent focus:ring-2 focus:ring-[#0B6A5A]/30 transition-all outline-none ${theme === 'dark' ? 'bg-slate-900 text-white placeholder-slate-400' : 'bg-white text-gray-900 placeholder-gray-400'}`}
                    value={newContact.email}
                    onChange={e => setNewContact({ ...newContact, email: e.target.value })}
                  />
                </div>
                <input
                  type="tel"
                  placeholder="Phone Number (Optional)"
                  className={`w-full px-5 py-3 rounded-xl border-transparent focus:ring-2 focus:ring-[#0B6A5A]/30 transition-all outline-none ${theme === 'dark' ? 'bg-slate-900 text-white placeholder-slate-400' : 'bg-white text-gray-900 placeholder-gray-400'}`}
                  value={newContact.phone}
                  onChange={e => setNewContact({ ...newContact, phone: e.target.value })}
                />
                <button
                  type="submit"
                  className="w-full bg-[#0B6A5A] text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2"
                  disabled={updating}
                >
                  {updating ? <FiLoader className="animate-spin" /> : <FiSave />}
                  Save Contact
                </button>
              </form>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {emergencyContacts.length === 0 ? (
                <div className="col-span-full py-8 text-center text-slate-400 italic">
                  No personal emergency contacts added yet.
                </div>
              ) : (
                emergencyContacts.map((contact, i) => (
                  <div key={i} className={`flex items-center justify-between p-5 rounded-3xl border group transition-all hover:shadow-md ${theme === 'dark' ? 'bg-slate-700/50 border-slate-600 hover:bg-slate-700' : 'bg-slate-50 border-slate-100 hover:bg-white'}`}>
                    <div className="flex items-center gap-4">
                      <div className="bg-[#E0F2F1] text-[#0B6A5A] p-3 rounded-2xl">
                        <FiPhone />
                      </div>
                      <div>
                        <p className={`font-bold leading-none mb-1 ${theme === 'dark' ? 'text-slate-200' : 'text-slate-700'}`}>{contact.name}</p>
                        <p className="text-xs text-slate-400 font-medium">{contact.email}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => removeContact(i)}
                      className="p-2 text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                      title="Remove Contact"
                    >
                      <FiTrash2 size={16} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick Actions Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { title: t("emergency.callHotline"), icon: FiPhone, color: "bg-[#0B6A5A]", lightColor: "bg-[#0B6A5A]", textColor: "text-[", label: "Call Now", action: () => { } },
              { title: t("emergency.chat24_7"), icon: FiMessageSquare, color: "bg-[#0B6A5A]", lightColor: "bg-[#0B6A5A]", textColor: "text-black", label: "Chat Now", action: () => navigate("/chat") },
              { title: t("emergency.emergencyServices"), icon: FiActivity, color: "bg-[#0B6A5A]", lightColor: "bg-[#0B6A5A]", textColor: "text-black", label: "Dial 911", action: () => { } }
            ].map((item, i) => (
              <div key={i} className={`${theme === 'dark' ? 'bg-slate-800 border-slate-700 hover:border-customText' : 'bg-white border-[#E0F2F1] hover:border-[#90D6CA]'} p-8 rounded-3xl border shadow-sm flex flex-col items-center text-center group transition-all`}>
                <div className={`${item.lightColor} ${item.textColor} w-16 h-16 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <item.icon size={32} />
                </div>
                <h3 className={`text-xl font-extrabold mb-6 leading-tight h-10 flex items-center ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>{item.title}</h3>
                <button
                  onClick={item.action}
                  className={`w-full ${item.color} text-white py-3 rounded-xl font-black text-sm shadow-lg hover:shadow-xl transition-all active:scale-95`}
                >
                  {item.label}
                </button>
              </div>
            ))}
          </div>

          <div className={`${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-[#E0F2F1]'} rounded-[2.5rem] shadow-sm border p-8`}>
            <h2 className={`text-2xl font-bold font-heading mb-8 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>{t("emergency.hotlines")}</h2>
            <div className="grid grid-cols-1 gap-4">
              {hotlines.map((hotline, index) => (
                <div
                  key={index}
                  className="group flex flex-col sm:flex-row items-center justify-between p-6 bg-gray-50/50 rounded-3xl border border-transparent hover:border-[#90D6CA] hover:bg-white transition-all gap-4"
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
      </div>
    </div>
  );
};

export default EmergencyHelp;
