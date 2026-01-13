// src/slices/ui/uiSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  isSidebarOpen: window.innerWidth >= 768,
  theme: localStorage.getItem("theme") || "light",
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.isSidebarOpen = !state.isSidebarOpen;
    },
    openSidebar: (state) => {
      state.isSidebarOpen = true;
    },
    closeSidebar: (state) => {
      state.isSidebarOpen = false;
    },
    setSidebar: (state, action) => {
      state.isSidebarOpen = action.payload;
    },
    toggleTheme: (state) => {
      state.theme = state.theme === "light" ? "dark" : "light";
      localStorage.setItem("theme", state.theme);
    },
    setTheme: (state, action) => {
      state.theme = action.payload;
      localStorage.setItem("theme", state.theme);
    },
  },
});

export const { toggleSidebar, openSidebar, closeSidebar, setSidebar, toggleTheme, setTheme } = uiSlice.actions;
export default uiSlice.reducer;
