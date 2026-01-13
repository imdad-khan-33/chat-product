import React, { useState, useRef, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { FiBell, FiX, FiCheck, FiCheckCircle, FiTrash2, FiClock } from "react-icons/fi";
import {
  useGetNotificationsQuery,
  useMarkNotificationReadMutation,
  useMarkAllNotificationsReadMutation,
  useDeleteNotificationMutation,
  useClearAllNotificationsMutation,
} from "../slices/NotificationSlice/notificationApi";
import { markAsRead, markAllAsRead, removeNotification, clearNotifications } from "../slices/NotificationSlice/NotificationSlice";

const NotificationDropdown = () => {
  const dispatch = useDispatch();
  const theme = useSelector((state) => state.ui.theme);
  const notifications = useSelector((state) => state.notificationSlice.list);
  const unreadCount = useSelector((state) => state.notificationSlice.unreadCount);

  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // RTK Query hooks
  const { refetch } = useGetNotificationsQuery(undefined, {
    pollingInterval: 60000, // Refetch every minute
  });
  const [markRead] = useMarkNotificationReadMutation();
  const [markAllRead] = useMarkAllNotificationsReadMutation();
  const [deleteNotif] = useDeleteNotificationMutation();
  const [clearAll] = useClearAllNotificationsMutation();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMarkAsRead = async (notificationId) => {
    try {
      dispatch(markAsRead(notificationId));
      await markRead(notificationId).unwrap();
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
      refetch(); // Refetch to sync state
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      dispatch(markAllAsRead());
      await markAllRead().unwrap();
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
      refetch();
    }
  };

  const handleDelete = async (notificationId) => {
    try {
      dispatch(removeNotification(notificationId));
      await deleteNotif(notificationId).unwrap();
    } catch (error) {
      console.error("Failed to delete notification:", error);
      refetch();
    }
  };

  const handleClearAll = async () => {
    if (notifications.length === 0) return;
    if (!window.confirm("Are you sure you want to clear all notifications?")) return;

    try {
      dispatch(clearNotifications());
      await clearAll().unwrap();
    } catch (error) {
      console.error("Failed to clear all notifications:", error);
      refetch();
    }
  };

  const formatTime = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Notification Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative text-white/80 hover:text-white transition-colors p-2"
        aria-label="Notifications"
      >
        <FiBell size={24} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 bg-red-500 w-5 h-5 flex items-center justify-center rounded-full border-2 border-[#0B6A5A] text-[10px] font-bold text-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div
          className={`absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl shadow-2xl border overflow-hidden z-50 ${theme === "dark"
              ? "bg-slate-800 border-slate-700"
              : "bg-white border-gray-200"
            }`}
        >
          {/* Header */}
          <div
            className={`px-4 py-3 flex items-center justify-between border-b ${theme === "dark" ? "border-slate-700 bg-slate-900" : "border-gray-100 bg-gray-50"
              }`}
          >
            <h3 className={`font-bold text-lg ${theme === "dark" ? "text-white" : "text-gray-800"}`}>
              Notifications
            </h3>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className={`text-xs font-semibold px-2 py-1 rounded-lg transition-colors ${theme === "dark"
                      ? "text-emerald-400 hover:bg-slate-700"
                      : "text-emerald-600 hover:bg-emerald-50"
                    }`}
                  title="Mark all as read"
                >
                  <FiCheckCircle size={16} />
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  onClick={handleClearAll}
                  className={`text-xs font-semibold px-2 py-1 rounded-lg transition-colors ${theme === "dark"
                      ? "text-red-400 hover:bg-slate-700"
                      : "text-red-500 hover:bg-red-50"
                    }`}
                  title="Clear all"
                >
                  <FiTrash2 size={16} />
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className={`p-1 rounded-lg transition-colors ${theme === "dark" ? "hover:bg-slate-700 text-gray-400" : "hover:bg-gray-200 text-gray-500"
                  }`}
              >
                <FiX size={18} />
              </button>
            </div>
          </div>

          {/* Notification List */}
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className={`py-12 text-center ${theme === "dark" ? "text-gray-500" : "text-gray-400"}`}>
                <FiBell size={40} className="mx-auto mb-3 opacity-30" />
                <p className="font-medium">No notifications yet</p>
                <p className="text-sm">You're all caught up!</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification._id}
                  className={`px-4 py-3 border-b last:border-b-0 transition-colors cursor-pointer group ${theme === "dark"
                      ? `border-slate-700 ${notification.isRead ? "bg-slate-800" : "bg-slate-700/50"} hover:bg-slate-700`
                      : `border-gray-100 ${notification.isRead ? "bg-white" : "bg-emerald-50/50"} hover:bg-gray-50`
                    }`}
                  onClick={() => !notification.isRead && handleMarkAsRead(notification._id)}
                >
                  <div className="flex items-start gap-3">
                    {/* Unread indicator */}
                    <div className="pt-1.5">
                      {!notification.isRead ? (
                        <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full" />
                      ) : (
                        <div className={`w-2.5 h-2.5 rounded-full ${theme === "dark" ? "bg-slate-600" : "bg-gray-300"}`} />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p className={`font-semibold text-sm leading-tight ${theme === "dark" ? "text-white" : "text-gray-800"}`}>
                        {notification.title}
                      </p>
                      <p className={`text-sm mt-1 line-clamp-2 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                        {notification.message}
                      </p>
                      <div className={`flex items-center gap-1 mt-2 text-xs ${theme === "dark" ? "text-gray-500" : "text-gray-400"}`}>
                        <FiClock size={12} />
                        <span>{formatTime(notification.createdAt)}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 transition-opacity lg:opacity-0 lg:group-hover:opacity-100">
                      {!notification.isRead && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMarkAsRead(notification._id);
                          }}
                          className={`p-1.5 rounded-lg transition-colors ${theme === "dark"
                              ? "hover:bg-slate-600 text-emerald-400"
                              : "hover:bg-emerald-100 text-emerald-600"
                            }`}
                          title="Mark as read"
                        >
                          <FiCheck size={14} />
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(notification._id);
                        }}
                        className={`p-1.5 rounded-lg transition-colors ${theme === "dark"
                            ? "hover:bg-slate-600 text-red-400"
                            : "hover:bg-red-100 text-red-500"
                          }`}
                        title="Delete notification"
                      >
                        <FiTrash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div
              className={`px-4 py-2 text-center border-t ${theme === "dark" ? "border-slate-700 bg-slate-900" : "border-gray-100 bg-gray-50"
                }`}
            >
              <span className={`text-xs font-medium ${theme === "dark" ? "text-gray-500" : "text-gray-400"}`}>
                {notifications.length} notification{notifications.length !== 1 ? "s" : ""}
                {unreadCount > 0 && ` • ${unreadCount} unread`}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
