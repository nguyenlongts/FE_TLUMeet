import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../baseQueryWithReauth";
import {setCredentials,logout} from "./authSlice"
// const baseQuery = fetchBaseQuery({
//   baseUrl: `http://localhost:8081/api/Auth`,
// });

const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Auth"],
  endpoints: (builders) => ({
    registerNewUser: builders.mutation({
      query: (newUser) => ({
        url: `/Auth/register`,
        method: "POST",
        body: newUser,
      }),
    }),
    loginUser: builders.mutation({
      query: (data) => ({
        url: `/Auth/login`,
        method: "POST",
        body: data,
      }),
    }),

    logoutUser: builders.mutation({
      query: () => ({
        url: `/Auth/logout`,
        method: "POST",
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
        } finally {
          dispatch(logout()); // Dù thành công hay lỗi vẫn clear state
        }
      },
    }),

    refreshToken: builders.mutation({
      query: (body) => ({
        url: "/refresh",
        method: "POST",
        body,
      }),
    }),

    forgotPassword: builders.mutation({
      query: (body) => ({
        url: "/forgot-password",
        method: "POST",
        body,
      }),
    }),

    resetPassword: builders.mutation({
      query: (body) => ({
        url: "/reset-password",
        method: "POST",
        body,
      }),
    }),

    changePassword: builders.mutation({
      query: (body) => ({
        url: "/change-password",
        method: "POST",
        body,
      }),
    }),
  }),
});

export const { useRegisterNewUserMutation, useLoginUserMutation, useLogoutUserMutation, useRefreshTokenMutation, useForgotPasswordMutation, useResetPasswordMutation, useChangePasswordMutation } = authApi;
export default authApi;
