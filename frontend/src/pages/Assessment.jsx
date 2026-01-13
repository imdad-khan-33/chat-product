import { useSelector, useDispatch } from "react-redux";
import { useEffect, useState } from "react";
import * as motion from "motion/react-client";
import {
  fetchAssessmentsSuccess,
  setQuestionaries,
} from "../slices/assessment/assessmentSlice";
import {
  useCreateAssessmentMutation,
  useGetAssessmentsQuery,
} from "../slices/assessment/assessmentApi";
import CustomLoader from "../components/commonComponents/CustomLoader";
import bg from "../assets/images/auth-left.png";
import notifyToast from "../utils/utilityFunctions";
import SubmitLoader from "../components/SubmitLoader";
import { useNavigate } from "react-router-dom";
import FullScreenLoader from "../components/FullScreenLoader";

const Questionnaire = () => {
  const dispatch = useDispatch();
  const { data, isLoading, error } = useGetAssessmentsQuery();
  const [createAssessment, { isLoading: isCreating }, isError] =
    useCreateAssessmentMutation();
  const questions = useSelector((state) => state.assessment.questionaries);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [responses, setResponses] = useState([]);
  const [selectedOption, setSelectedOption] = useState("");

  const navigate = useNavigate();

  const currentQuestion =
    Array.isArray(questions) && questions.length > currentIndex
      ? questions[currentIndex]
      : null;

  // When data is fetched, set questionaries
  useEffect(() => {
    if (data) {
      dispatch(setQuestionaries(data.data));
    }
  }, [data, dispatch]);

  // When index changes, set selectedOption from existing response
  useEffect(() => {
    const savedAnswer = responses[currentIndex]?.responseItem?.answer || "";
    setSelectedOption(savedAnswer);
  }, [currentIndex, responses]);

  const handleNext = async () => {
    if (!selectedOption) return;

    const responseItem = {
      questionId: currentQuestion._id,
      question: currentQuestion.questionNo,
      answer: selectedOption,
    };

    const qaItem = {
      question: currentQuestion.text,
      answer: selectedOption,
    };

    const updatedResponses = [...responses];
    updatedResponses[currentIndex] = { responseItem, qaItem };

    setResponses(updatedResponses);

    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(currentIndex + 1);
    } else {
      const finalData = {
        response: updatedResponses.map((r) => r.responseItem),
        questionsAndAnswers: updatedResponses.map((r) => r.qaItem),
      };
      try {
        const response = await createAssessment(finalData).unwrap();
        notifyToast(
          "Your initial assessment has been submitted successfully.",
          "success"
        );
        if (response.statusCode === 201) {
          dispatch(fetchAssessmentsSuccess(response.data));
          // Navigate to dashboard instead of assessment result
          setTimeout(() => navigate("/dashboard", { replace: true }), 500);
        }
      } catch (error) {
        if (error.data.message === "User Already answer the questions") {
          notifyToast(
            "You have already completed this questionnaire.",
            "error"
          );
        } else {
          notifyToast(
            "An error occurred while submitting your responses. Please try again.",
            "error"
          );
        }
      }
    }
  };

  if (isLoading)
    return (
      <div>
        <CustomLoader />
      </div>
    );
  if (error) {
    console.error("Assessment loading error:", error);
    return (
      <div className="text-center p-6">
        <p className="text-red-600 font-semibold mb-2">Error loading questions</p>
        <p className="text-gray-600 text-sm mb-4">{error?.data?.message || error?.message || "Unknown error"}</p>
        <button
          className="bg-customBg text-white px-4 py-2 rounded"
          onClick={() => window.location.reload()}
        >
          Try Again
        </button>
      </div>
    );
  }

  // When no questions are available
  if (!questions || questions.length === 0 || currentQuestion === null) {
    return (
      <div className="w-full h-screen">
        <div className="flex flex-col gap-3 items-center justify-center min-h-screen relative">
          <img
            src={bg}
            className="fixed inset-y-0 inset-x-0 -z-10 h-screen md:w-2/3 w-full"
            alt=""
          />
          <p className="text-black font-heading md:text-[35px] text-lg font-semibold mb-3">
            No questions available. Please try again later.
          </p>
          <button
            className="bg-customBg text-[#FCFCFD] font-semibold text-2xl px-6 py-2 rounded-md disabled:cursor-not-allowed"
            onClick={() => window.location.reload()}
          >
            Reload
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {isCreating && <FullScreenLoader />}
      <div className="w-full h-screen">
        <div className="flex flex-col gap-3 items-center justify-center min-h-screen relative">
          <img
            src={bg}
            className="fixed inset-y-0 inset-x-0 -z-10 h-screen md:w-2/3 w-full"
            alt=""
          />
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              duration: 1,
              scale: { type: "spring", visualDuration: 0.4, bounce: 0.5 },
            }}
            className="z-10 bg-white py-[40px] px-[20px] rounded-[20px]  md:mx-0 mx-6 gap-3 shadow-custom flex justify-center items-center flex-col m-auto"
          >
            <h1 className="font-body font-semibold md:text-[35px] text-[20px] text-[#000000]">
              Mental Health Questionnaire
            </h1>
            <p className="font-normal font-heading md:text-[22px] w-[80%] mx-auto text-[18px] text-[#000000]">
              {currentIndex + 1}. {currentQuestion?.text}
            </p>
            <div className="flex flex-col gap-2 w-full md:px-16 px-6">
              {currentQuestion?.options.map((option, index) => (
                <label
                  key={index}
                  className={`border p-3 rounded-[17px] cursor-pointer flex items-center gap-3 leading-5 transition-all duration-200 ${selectedOption === option
                    ? "border-customBg"
                    : "border-gray-300"
                    }`}
                >
                  <input
                    type="radio"
                    name="answer"
                    value={option}
                    checked={selectedOption === option}
                    onChange={() => setSelectedOption(option)}
                    className="hidden"
                  />
                  {/* Custom circle */}
                  <div
                    className={`w-7 h-7 rounded-full border-4 flex items-center justify-center transition-all duration-200 ${selectedOption === option
                      ? "border-customBg"
                      : "border-gray-400"
                      }`}
                  >
                    {/* {selectedOption === option && (
                      <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
                    )} */}
                  </div>
                  {option}
                </label>
              ))}
            </div>

            <div className="flex gap-[30px] w-full mt-6 md:px-16 px-6">
              <button
                disabled={currentIndex === 0}
                onClick={() => setCurrentIndex(currentIndex - 1)}
                className="bg-[#CBCBCB] text-[#FCFCFD] text-2xl font-semibold font-body px-6 py-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed w-1/2"
              >
                Back
              </button>
              <button
                onClick={handleNext}
                className="bg-customBg text-[#FCFCFD] font-semibold text-2xl px-6 py-2 rounded-md disabled:cursor-not-allowed w-1/2"
                disabled={!selectedOption}
              >
                {currentIndex === questions.length - 1 ? (
                  isCreating ? (
                    <SubmitLoader />
                  ) : (
                    "Finish"
                  )
                ) : (
                  "Next"
                )}
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default Questionnaire;
