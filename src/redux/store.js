import { configureStore } from "@reduxjs/toolkit";
import authApi from "./features/auth/authApi";;
import authReducer from "./features/auth/authSlice"
import userApi from "./features/user/userApi";
import meetingsApi from "./features/meetings/meetingsApi";
import jassApi from "./features/jass/jaasApi";
import adminApi from "./features/admin/adminApi"
export const store = configureStore({
  reducer: {
    auth: authReducer,
    [authApi.reducerPath]: authApi.reducer,
    [userApi.reducerPath]:userApi.reducer,
    [meetingsApi.reducerPath]:meetingsApi.reducer,
    [jassApi.reducerPath]:jassApi.reducer,
    [adminApi.reducerPath]:adminApi.reducer,
  },

  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      authApi.middleware,
      userApi.middleware,
      meetingsApi.middleware,
      jassApi.middleware,
      adminApi.middleware,
    ),
});
