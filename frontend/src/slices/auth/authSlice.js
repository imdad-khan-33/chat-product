import { createSlice } from '@reduxjs/toolkit'

const storedAuth = localStorage.getItem('Therapy-user-token');
const initialUser = storedAuth ? storedAuth : null;

export const authSlice = createSlice({
  name: 'auth',
  initialState: { user: initialUser, userDetails: null },
  reducers: {
    setCredentials: (state, action) => {
      state.user = action.payload;
      localStorage.setItem('Therapy-user-token', action.payload);
    },
    setUserDetails: (state, action) => {
      state.userDetails = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.userDetails = null;
      localStorage.removeItem('Therapy-user-token');
    },
  },
})

export const { setCredentials, logout, setUserDetails } = authSlice.actions
export default authSlice.reducer