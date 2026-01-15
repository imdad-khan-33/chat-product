import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { attachAuthHeaders } from "../../utils/prepareHeaders";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const journalApi = createApi({
    reducerPath: "journalApi",
    baseQuery: fetchBaseQuery({
        baseUrl: BASE_URL,
        credentials: "include",
        prepareHeaders: attachAuthHeaders,
    }),
    tagTypes: ["Journal"],
    endpoints: (builder) => ({
        getJournalEntries: builder.query({
            query: () => "/journal/all",
            providesTags: ["Journal"],
        }),
        addJournalEntry: builder.mutation({
            query: (data) => ({
                url: "/journal/add",
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["Journal"],
        }),
        getJournalSummary: builder.query({
            query: () => "/journal/summary",
            providesTags: ["Journal"],
        }),
        updateJournalEntry: builder.mutation({
            query: ({ id, data }) => ({
                url: `/journal/${id}`,
                method: "PUT",
                body: data,
            }),
            invalidatesTags: ["Journal"],
        }),
        deleteJournalEntry: builder.mutation({
            query: (id) => ({
                url: `/journal/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["Journal"],
        }),
    }),
});

export const {
    useGetJournalEntriesQuery,
    useAddJournalEntryMutation,
    useGetJournalSummaryQuery,
    useUpdateJournalEntryMutation,
    useDeleteJournalEntryMutation,
} = journalApi;
