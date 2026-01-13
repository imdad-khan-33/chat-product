import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  questionaries: [],
  assessments: [],
  loading: false,
  error: null,
};

export const assessmentSlice = createSlice({
  name: "assessment",
  initialState,
  reducers: {
    setQuestionaries(state, action) {
      state.questionaries = action.payload;
    },
    fetchAssessmentsSuccess(state, action) {
      state.assessments = action.payload;
    },
    fetchAssessmentsFailure(state, action) {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const {
  setQuestionaries,
  fetchAssessmentsSuccess,
  fetchAssessmentsFailure,
} = assessmentSlice.actions;

export default assessmentSlice.reducer;
