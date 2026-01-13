import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { authSlice } from "../slices/auth/authSlice"
import { authApi } from "../slices/auth/authApi"
import { assessmentApi } from "../slices/assessment/assessmentApi";
import { assessmentSlice } from "../slices/assessment/assessmentSlice";
import uiReducer from "../slices/uiSlice";
import { chatbotApi } from "../slices/chatbotSlice/chatbotApi";
import { chatbotSlice } from "../slices/chatbotSlice/chatbotSlice";
import { sseApi } from "../slices/chatbotSlice/sseApiSlice";
import { notificationSlice } from "../slices/NotificationSlice/NotificationSlice";
import { notificationApi } from "../slices/NotificationSlice/notificationApi";
import { moodApi } from "../slices/mood/moodApi";


const appReducer = combineReducers({
    [authSlice.name]: authSlice.reducer,
    [authApi.reducerPath]: authApi.reducer,
    [assessmentSlice.name]: assessmentSlice.reducer,
    [assessmentApi.reducerPath]: assessmentApi.reducer,
    [chatbotSlice.name]: chatbotSlice.reducer,
    [chatbotApi.reducerPath]: chatbotApi.reducer,
    [sseApi.reducerPath]: sseApi.reducer,
    [notificationSlice.name]: notificationSlice.reducer,
    [notificationApi.reducerPath]: notificationApi.reducer,
    [moodApi.reducerPath]: moodApi.reducer,
    ui: uiReducer
});

const rootReducer = (state, action) => {
    if (action.type === 'auth/logout') {
        state = undefined;
    }
    return appReducer(state, action);
}

const store = configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
        }).concat(authApi.middleware, assessmentApi.middleware, chatbotApi.middleware, sseApi.middleware, moodApi.middleware, notificationApi.middleware),
})


export default store;