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

    googleLogin: builders.mutation({
      query: (body) => ({
        url: `/Auth/google`,
        method: "POST",
        body, // { idToken }
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
        url: "/Auth/refresh",
        method: "POST",
        body,
      }),
    }),

    forgotPassword: builders.mutation({
      query: (email) => ({
        url: "/Auth/forgot-password",
        method: "POST",
        body: { email },
      }),
    }),

    resetPassword: builders.mutation({
      query: ({ token, newPassword }) => ({
        url: "/Auth/reset-password",
        method: "POST",
        body: { token, newPassword },
      }),
    }),

    changePassword: builders.mutation({
      query: ({ currentPassword, newPassword }) => ({
        url: "/Auth/change-password",
        method: "POST",
        body: { currentPassword, newPassword },
      }),
    }),

    verifyEmail: builders.mutation({
      query: (token) => ({
        url: "/Auth/verify-email",
        method: "POST",
        body: { token },
      }),
    }),

    resendVerification: builders.mutation({
      query: (email) => ({
        url: "/Auth/resend-verification",
        method: "POST",
        body: { email },
      }),
    }),

    getUsers: builders.query({
      query: () => ({
        url: "/Auth/users",
        method: "GET",
      }),
    }),
  }),
});

export const {
  useRegisterNewUserMutation,
  useLoginUserMutation,
  useGoogleLoginMutation,
  useLogoutUserMutation,
  useRefreshTokenMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useChangePasswordMutation,
  useVerifyEmailMutation,
  useResendVerificationMutation,
  useGetUsersQuery,
} = authApi;
export default authApi;
