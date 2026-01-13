// src/slices/notificationSlice.js
import { createSlice } from "@reduxjs/toolkit";
import { notificationApi } from "./notificationApi";

export const notificationSlice = createSlice({
  name: "notificationSlice",
  initialState: {
    list: [],           // Full list from backend
    unreadCount: 0,     // Count of unread notifications
    realtimeQueue: [],  // New notifications from socket (not yet fetched)
  },
  reducers: {
    // Add a real-time notification from socket
    addRealtimeNotification: (state, action) => {
      console.log(" [NotificationSlice] Reducer: Adding real-time notification", action.payload);
      // Add to realtime queue and main list
      const notification = {
        ...action.payload,
        _id: action.payload._id || `temp-${Date.now()}`,
        isRead: false,
        createdAt: action.payload.time || new Date().toISOString(),
      };
      state.realtimeQueue.unshift(notification);
      state.list.unshift(notification);
      state.unreadCount += 1;
      console.log(` [NotificationSlice] New unread count: ${state.unreadCount}`);
    },
    // Set notifications from API fetch
    setNotifications: (state, action) => {
      state.list = action.payload;
      state.unreadCount = action.payload.filter(n => !n.isRead).length;
      state.realtimeQueue = []; // Clear queue after sync
    },
    // Mark a single notification as read locally
    markAsRead: (state, action) => {
      const notification = state.list.find(n => n._id === action.payload);
      if (notification && !notification.isRead) {
        notification.isRead = true;
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    },
    // Mark all notifications as read locally
    markAllAsRead: (state) => {
      state.list.forEach(n => { n.isRead = true; });
      state.unreadCount = 0;
    },
    // Remove a notification locally
    removeNotification: (state, action) => {
      const index = state.list.findIndex(n => n._id === action.payload);
      if (index !== -1) {
        if (!state.list[index].isRead) {
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
        state.list.splice(index, 1);
      }
    },
    // Clear all notifications locally
    clearNotifications: (state) => {
      state.list = [];
      state.unreadCount = 0;
      state.realtimeQueue = [];
    },
  },
  extraReducers: (builder) => {
    // Sync state when API fetches notifications
    builder.addMatcher(
      notificationApi.endpoints.getNotifications.matchFulfilled,
      (state, action) => {
        // Merge realtime notifications with fetched ones
        const fetchedIds = new Set(action.payload.map(n => n._id));
        const newRealtimeNotifs = state.realtimeQueue.filter(n => !fetchedIds.has(n._id));
        state.list = [...newRealtimeNotifs, ...action.payload];
        state.unreadCount = state.list.filter(n => !n.isRead).length;
        state.realtimeQueue = [];
      }
    );
  },
});

export const {
  addRealtimeNotification,
  setNotifications,
  markAsRead,
  markAllAsRead,
  removeNotification,
  clearNotifications,
} = notificationSlice.actions;

export default notificationSlice.reducer;
