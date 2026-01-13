import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  chatsMessages: [],
  chatsIds: [],
  LoadingIds: true,
  isCreatingNewChat: false,
  isExistingChat: false,
};

export const chatbotSlice = createSlice({
  name: "chatbotSlice",
  initialState,
  reducers: {
    setChatbotIds(state, action) {
      state.chatsIds = action.payload;
    },
    setUpdateBotIds(state,action){
      const {sessionId, title} = action.payload.data.data;
      const newChat = {
        sessionId: sessionId,
        title: title
      };
      state.chatsIds.unshift(newChat);
    },
    setLoadingIds(state, action) {
      state.LoadingIds = action.payload;
    },
    setChatMessages(state, action) {
      const messages = action.payload;
      state.chatsMessages = messages?.data?.messages;
    },
    setAddUserMessages(state, action){
        const userPrompt = action.payload
        state.chatsMessages.push(userPrompt)
    },
    setAddAssistantMessage(state, action){
        const assistant_Response = action.payload;
        const {assistantResponse, timestamp} = assistant_Response?.data;
        const AI_response = {
            role:"assistant",
            content: assistantResponse,
            timestamp: timestamp
        };
        state.chatsMessages.push(AI_response);
    },
     setCreatingNewChatLoading: (state, action) => {
      state.isCreatingNewChat = action.payload;
    },
    setSubmittingChatLoading: (state, action) => {
      state.isExistingChat = action.payload;
    },
  },
});

export const { setChatbotIds, setLoadingIds, setChatMessages, setAddUserMessages, setAddAssistantMessage, setUpdateBotIds, setCreatingNewChatLoading, setSubmittingChatLoading } =
  chatbotSlice.actions;

export default chatbotSlice.reducer;
