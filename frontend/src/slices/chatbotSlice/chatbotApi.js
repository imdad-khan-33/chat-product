import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { attachAuthHeaders } from "../../utils/prepareHeaders";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const chatbotApi = createApi({
  reducerPath: "chatbotApi",
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
    credentials: "include",
    prepareHeaders: attachAuthHeaders,
  }),
  endpoints: (builder) => ({
    getbotChatIds: builder.query({
      query: () => ({
        url: "/therapy/chat/sessionInfo",
        method: "GET",
      }),
    }),
    getbotChats: builder.query({
      query: (id) => ({
        url: `/therapy/chat/${id}`,
        method: "GET",
      }),
    }),
    createNewChat: builder.mutation({
      query: (data) => ({
        url: '/therapy/chat',
        method: "POST",
        body: { userPrompt: data.userPrompt }
      }),
    }),
    existingChat: builder.mutation({
      query: ({ userPrompt, id }) => ({
        url: `/therapy/chat/${id}`,
        method: "POST",
        body: { userPrompt: userPrompt }
      })
    })
  }),
});

export const { useLazyGetbotChatIdsQuery, useGetbotChatsQuery, useCreateNewChatMutation, useExistingChatMutation } = chatbotApi
