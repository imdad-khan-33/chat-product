import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { FaChevronDown } from "react-icons/fa";
import Sidebar from "../components/Sidebar";
import { useGetAssessmentResultsQuery } from "../slices/assessment/assessmentApi";
import { useSelector } from "react-redux";

// ExpandableCard 
const ExpandableCard = ({ title, label, content, theme }) => {
  const [expanded, setExpanded] = useState(false);

  //  bullet points
  let processedContent;
  if (typeof content === "string") {
    processedContent = content
      .split(/(?=Fixed element:|Variable element:|Optional:)/g) // split 
      .map((item) => item.trim())
      .filter((item) => item.length > 0);
  } else {
    processedContent = Array.isArray(content) ? content : [content];
  }

  
  const formatBullet = (text) => {
    return text.replace(
      /(Fixed element:|Variable element:|Optional:)/g,
      "<strong>$1</strong>"
    );
  };

  return (
    <div className={`${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'} border rounded-custom shadow p-4`}>
      <div className={`${theme === 'dark' ? 'bg-customText text-slate-900' : 'bg-[#54C9B4]'} rounded text-center py-2 font-semibold text-[20px] mb-3`}>
        {title}
      </div>
      <div className="px-2">
        <p className={`font-bold text-[20px] mb-1 ${theme === 'dark' ? 'text-white' : ''}`}>{label}:</p>

        <ul className={`list-disc list-inside text-[14px] ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} space-y-1 pl-4`}>
          {processedContent.map((item, index) => (
            <li
              key={index}
              dangerouslySetInnerHTML={{ __html: formatBullet(item) }}
            />
          ))}
        </ul>

        {typeof content === "string" && content.length > 150 && (
          <div className="mt-2 flex justify-end">
            <button
              className={`text-[15px] font-semibold ${theme === 'dark' ? 'text-gray-300' : 'text-gray-800'} hover:underline`}
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? "Show less" : "Read more"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// DropdownSection Component
const DropdownSection = ({ sections, theme }) => {
  const [openSections, setOpenSections] = useState(
    Array.from({ length: sections.length }, () => false)
  );

  const toggleSection = (index) => {
    setOpenSections((prev) =>
      prev.map((open, i) => (i === index ? !open : open))
    );
  };

  return (
    <div className="flex flex-col gap-4">
      {sections.map((section, index) => (
        <div key={index} className="mb-4">
          <button
            onClick={() => toggleSection(index)}
            className={`w-full flex justify-between items-center px-4 py-3 ${theme === 'dark' ? 'bg-customText text-slate-900' : 'bg-[#0B6A5A] text-white'} rounded-md font-semibold text-left text-base focus:outline-none`}
          >
            {section.title}
            <FaChevronDown
              className={`transition-transform duration-300 ${
                openSections[index] ? "rotate-180" : ""
              }`}
            />
          </button>

          {openSections[index] && (
            <div className="mt-3 px-1">
              <ExpandableCard
                title={section.cardTitle}
                label={section.label}
                content={section.content}
                theme={theme}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

// Main Component
const AssessmentResult = () => {
  const navigate = useNavigate();
  const theme = useSelector((state) => state.ui.theme);
  const { data, error, isLoading } = useGetAssessmentResultsQuery();

  if (isLoading) {
    return (
      <div className={`flex h-screen overflow-hidden ${theme === 'dark' ? 'bg-slate-900' : ''}`}>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className={`animate-spin rounded-full h-32 w-32 border-b-2 ${theme === 'dark' ? 'border-customText' : 'border-[#0B6A5A]'}`}></div>
            <p className={`mt-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Loading your assessment results...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className={`flex h-screen overflow-hidden ${theme === 'dark' ? 'bg-slate-900' : ''}`}>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-600 font-bold">Error loading assessment results</p>
            <p className={`text-sm mt-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              {error?.data?.message || error?.error || "Unknown error occurred."}
            </p>
            <button
              onClick={() => navigate("/assessment")}
              className={`mt-4 px-4 py-2 ${theme === 'dark' ? 'bg-customText text-slate-900' : 'bg-[#0B6A5A] text-white'} rounded-md`}
            >
              Take Assessment
            </button>
          </div>
        </div>
      </div>
    );
  }

  const { userName, sections, assessmentDate, nextSession } = data;

  return (
    <div className={`flex h-screen overflow-hidden ${theme === 'dark' ? 'bg-slate-900' : ''}`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex-1 flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="px-4 md:px-6 lg:px-10 xl:px-12 py-6 flex-shrink-0">
          <header className="flex flex-col">
            <div className="flex justify-between items-center">
              <h1 className={`font-heading ${theme === 'dark' ? 'text-customText' : 'text-[#0B6A5A]'} font-extrabold md:text-[36px] text-[28px]`}>
                Hi {userName}!
              </h1>
              {nextSession && (
                <div className="text-right">
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-[#5A5A5A]'}`}>Next Session:</p>
                  <p className={`font-semibold ${theme === 'dark' ? 'text-customText' : 'text-[#0B6A5A]'}`}>{nextSession}</p>
                </div>
              )}
            </div>
            <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-[#5A5A5A]'}`}>
              Your personalized assessment results - Assessment completed on {assessmentDate}
            </p>
          </header>
        </div>

        {/* Content */}
        <main className="flex-1 overflow-y-auto px-4 md:px-6 lg:px-10 xl:px-12 pb-8">
          <DropdownSection sections={sections} theme={theme} />
          
          {/* Go to Dashboard Button */}
          <div className="mt-8 flex justify-center">
            <button
              onClick={() => navigate("/user-dashboard")}
              className={`px-8 py-3 ${theme === 'dark' ? 'bg-customText text-slate-900 hover:bg-[#15a898]' : 'bg-[#0B6A5A] text-white hover:bg-[#085347]'} font-semibold text-lg rounded-md transition-colors`}
            >
              Go to Dashboard
            </button>
          </div>
        </main>
      </motion.div>
    </div>
  );
};

export default AssessmentResult;




