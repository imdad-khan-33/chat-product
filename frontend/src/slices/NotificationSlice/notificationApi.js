import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { attachAuthHeaders } from "../../utils/prepareHeaders";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/v1";

export const notificationApi = createApi({
  reducerPath: "notificationApi",
  tagTypes: ["Notifications"],
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
    credentials: "include",
    prepareHeaders: attachAuthHeaders,
  }),
  endpoints: (builder) => ({
    // GET all notifications for current user
    getNotifications: builder.query({
      query: () => ({
        url: "/notification",
        method: "GET",
      }),
      providesTags: ["Notifications"],
      transformResponse: (response) => {
        if (!response?.success || !response?.data) {
          return [];
        }
        return response.data;
      },
    }),

    // PATCH mark single notification as read
    markNotificationRead: builder.mutation({
      query: (notificationId) => ({
        url: `/notification/read/${notificationId}`,
        method: "PATCH",
      }),
      invalidatesTags: ["Notifications"],
    }),

    // PATCH mark all notifications as read
    markAllNotificationsRead: builder.mutation({
      query: () => ({
        url: "/notification/read-all",
        method: "PATCH",
      }),
      invalidatesTags: ["Notifications"],
    }),

    // DELETE a single notification
    deleteNotification: builder.mutation({
      query: (notificationId) => ({
        url: `/notification/${notificationId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Notifications"],
    }),

    // DELETE all notifications
    clearAllNotifications: builder.mutation({
      query: () => ({
        url: "/notification/clear-all",
        method: "DELETE",
      }),
      invalidatesTags: ["Notifications"],
    }),
  }),
});

export const {
  useGetNotificationsQuery,
  useMarkNotificationReadMutation,
  useMarkAllNotificationsReadMutation,
  useDeleteNotificationMutation,
  useClearAllNotificationsMutation,
} = notificationApi;
