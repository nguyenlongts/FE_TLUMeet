import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
const baseQuery = fetchBaseQuery({
  baseUrl: `http://localhost:5555/api/users`,
  prepareHeaders: (headers, { getState }) => {
    const token = getState().auth.accessToken;
    console.log(token);
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    return headers;
  },
});

const userApi = createApi({
  reducerPath: "userApi",
  baseQuery: baseQuery,
  tagTypes: ["User"],
  endpoints: (builders) => ({
    getProfile: builders.query({
      query: (id) => ({
        url: `/${id}`,
        method: "GET",
      }),
      providesTags: ["User"],
    }),
    // loginUser: builders.mutation({
    //   query: (data) => ({
    //     url: `/login`,
    //     method: "POST",
    //     body: data,
    //   }),
    // }),
    updateUser: builders.mutation({
      query: (formData) => ({
        url: `/update/${formData.userId}`,
        method: "PATCH",
        body: formData,
      }),
      invalidatesTags: ["User"],
    }),
    uploadAvatar: builders.mutation({
      query: (formData) => ({
        url: `/upload-avatar`,
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["User"],
    }),
  }),
});

export const {
    useGetProfileQuery,
    useUploadAvatarMutation,
    useUpdateUserMutation
} = userApi;
export default userApi;
