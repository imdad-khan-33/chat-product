import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { attachAuthHeaders } from "../../utils/prepareHeaders";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const assessmentApi = createApi({
  reducerPath: "assessmentApi",
  tagTypes: ["Assessment"],
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
    credentials: "include",
    prepareHeaders: attachAuthHeaders,
  }),
  endpoints: (builder) => ({
    //  GET Assessment Questions
    getAssessments: builder.query({
      query: () => ({
        url: "/assessment_question/question",
        method: "GET",
      }),
    }),

    // POST Assessment Answers
    createAssessment: builder.mutation({
      query: (data) => ({
        url: "/assessment_answer/answer",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Assessment"],
    }),

    // Mark Session Complete
    markSessionComplete: builder.mutation({
      query: (sessionId) => ({
        url: "/session/complete",
        method: "POST",
        body: { sessionId },
      }),
      invalidatesTags: ["Assessment"],
    }),

    //  GET Assessment Results 
    getAssessmentResults: builder.query({
      query: () => ({
        url: "/assessment_answer/answer", // 
        method: "GET",
      }),
      providesTags: ["Assessment"],
      transformResponse: (response) => {
        if (!response?.success || !response?.data?.initialAssessment) {
          return null;
        }

        const { initialAssessment, assessmentDate, session } = response.data;

        const sections = [];

        // Self-care activity
        if (initialAssessment.selfCareActivity) {
          const sca = initialAssessment.selfCareActivity;
          sections.push({
            title: "Self-care Activity",
            cardTitle: sca.description || "Untitled",
            label: "Description",
            content: (sca.details || []).join("\n\n") || "No details provided",
          });
          sections.push({
            title: "Clinical Rationale",
            cardTitle: sca.description || "Untitled",
            label: "Why This Works",
            content: sca.clinicalRationale || "Not provided",
          });
        }

        // Session recommendation
        if (initialAssessment.sessionRecommendation) {
          const sr = initialAssessment.sessionRecommendation;
          sections.push({
            title: "Session Plan",
            cardTitle: "Recommended Sessions",
            label: "Plan Details",
            content: `Frequency: ${sr.frequency || "N/A"}\n\nSchedule: ${sr.schedule || "N/A"}\n\nReason: ${sr.reason || "N/A"}`,
          });
        }

        // Therapist fullText
        if (initialAssessment.fullText) {
          sections.push({
            title: "Personalized Guidance",
            cardTitle: "Your Growth Journey",
            label: "Therapist's Note",
            content: initialAssessment.fullText || "No guidance available.",
          });
        }

        return {
          userName: initialAssessment.userName || "User",
          assessmentDate: assessmentDate
            ? new Date(assessmentDate).toLocaleDateString()
            : "Unknown date",
          nextSession: session?.nextSessionDate
            ? new Date(session.nextSessionDate).toLocaleDateString()
            : null,
          sections,
          session, // ✅ Preserve raw session data
          initialAssessment, // ✅ Preserve raw AI data
        };
      },
    }),
  }),
});

export const {
  useGetAssessmentsQuery,
  useCreateAssessmentMutation,
  useGetAssessmentResultsQuery,
  useMarkSessionCompleteMutation,
} = assessmentApi;


