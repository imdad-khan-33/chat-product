import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { attachAuthHeaders } from "../../utils/prepareHeaders";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const moodApi = createApi({
    reducerPath: "moodApi",
    baseQuery: fetchBaseQuery({
        baseUrl: BASE_URL,
        credentials: "include",
        prepareHeaders: attachAuthHeaders,
    }),
    tagTypes: ["Mood"],
    endpoints: (builder) => ({
        getMoodHistory: builder.query({
            query: (limit = 30) => ({
                url: `/mood?limit=${limit}`,
                method: "GET",
            }),
            providesTags: ["Mood"],
        }),
        logMood: builder.mutation({
            query: (data) => ({
                url: "/mood",
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["Mood"],
        }),
        getMoodAnalysis: builder.query({
            query: () => ({
                url: "/mood/analysis",
                method: "GET",
            }),
            providesTags: ["Mood"],
        }),
    }),
});

export const { useGetMoodHistoryQuery, useLogMoodMutation, useGetMoodAnalysisQuery } = moodApi;
