import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
const baseQuery = fetchBaseQuery({
  baseUrl: `http://localhost:5555/api/admin`,
  prepareHeaders: (headers, { getState }) => {
    const token = getState().auth.accessToken;
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    return headers;
  },
});

const adminApi = createApi({
  reducerPath: "adminApi",
  baseQuery: baseQuery,
  tagTypes: ["Admin"],
  endpoints: (builders) => ({
    getStats: builders.query({
      query: () => ({
        url: `/stats`,
        method: "GET",
      }),
      invalidatesTags: ["Stats"],
    }),
    getUsers: builders.query({
      query: (page, limit) => ({
        url: `/users?page=${page}&limit=${limit}`,
        method: "GET",
      }),
      providesTags: ["UsersAdmin"],
    }),
    deleteUser: builders.mutation({
      query: (id) => ({
        url: `/users/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["UsersAdmin","Stats"],
    }),
    getMeetings: builders.query({
      query: () => ({
        url: `/meetings`,
        method: "GET",
      }),
      invalidatesTags: ["MeetingsAdmin"],
    }),
  }),
});

export const {
  useGetStatsQuery,
  useGetMeetingsQuery,
  useGetUsersQuery,
  useDeleteUserMutation
} = adminApi;
export default adminApi;
