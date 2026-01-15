import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { attachAuthHeaders } from "../../utils/prepareHeaders";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const emergencyApi = createApi({
    reducerPath: "emergencyApi",
    baseQuery: fetchBaseQuery({
        baseUrl: BASE_URL,
        credentials: "include",
        prepareHeaders: attachAuthHeaders,
    }),
    tagTypes: ["Emergency"],
    endpoints: (builder) => ({
        getEmergencyContacts: builder.query({
            query: () => "/emergency/contacts",
            providesTags: ["Emergency"],
        }),
        updateEmergencyContacts: builder.mutation({
            query: (contacts) => ({
                url: "/emergency/contacts",
                method: "POST",
                body: { contacts },
            }),
            invalidatesTags: ["Emergency"],
        }),
        triggerSOS: builder.mutation({
            query: (location) => ({
                url: "/emergency/sos",
                method: "POST",
                body: location,
            }),
        }),
    }),
});

export const {
    useGetEmergencyContactsQuery,
    useUpdateEmergencyContactsMutation,
    useTriggerSOSMutation,
} = emergencyApi;
