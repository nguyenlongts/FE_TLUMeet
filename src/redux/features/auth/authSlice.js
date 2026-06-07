import { createSlice } from "@reduxjs/toolkit";
const initialState={
    user:null,
    accessToken:null,
    refreshToken:localStorage.getItem("refreshToken")??null,
    isRestoring:!!localStorage.getItem("refreshToken"),
}
const authSlice = createSlice({
  name: "auth",
  initialState: initialState,
  reducers: {
    setCredentials: (state, action) => {
      const { user, accessToken, refreshToken } = action.payload;
      state.user = user;
      state.accessToken = accessToken;
      state.isRestoring=false
      if (refreshToken) {
        state.refreshToken = refreshToken;
        localStorage.setItem("refreshToken", refreshToken);
      }
    },
    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.isRestoring=false;
      localStorage.removeItem("refreshToken");
    },
  },
});
export const {setCredentials,logout}=authSlice.actions
export const selectCurrentUser = (state) => state.auth.user;
export const selectAccessToken = (state) => state.auth.accessToken;
export const selectRefreshToken = (state) => state.auth.refreshToken;
export const selectIsRestoring=(state)=>state.auth.isRestoring;
export default authSlice.reducer