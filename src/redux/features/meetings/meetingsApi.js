import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { endMeeting } from "../../../api/meetingApi";
const baseQuery = fetchBaseQuery({
  baseUrl: `http://localhost:5555/api/meeting`,
  prepareHeaders: (headers, { getState }) => {
    const token = getState().auth.accessToken;
    console.log(token)
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    return headers;
  },
});

const meetingsApi = createApi({
  reducerPath: "meetingsApi",
  baseQuery: baseQuery,
  tagTypes: ["Meetings"],
  endpoints: (builders) => ({
    getAllMeetingByEmail: builders.query({
      query: (email) => ({
        url: `/host/${email}`,
        method: "GET",
      }),
      providesTags: ["Meetings"],
    }),
    getInvitedMeetings: builders.query({
      query: () => ({
        url: `/invited`,
        method: "GET",
      }),
      providesTags: ["Meetings"],
    }),
    scheduleMeeting: builders.mutation({
      query: (data) => ({
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Meetings"],
    }),
    checkRoomCode: builders.query({
      query: (roomCode) => ({
        url: `/check/${roomCode}`,
        method: "GET",
      }),
    }),
    getStatusMeeting: builders.query({
      query: (roomCode) => ({
        url: `/${roomCode}/status`,
        method: "GET",
      }),
    }),
    startMeeting: builders.mutation({
      query: (roomCode) => ({
        url: `/${roomCode}/start`,
        method: "POST",
      }),
    }),
    endMeeting: builders.mutation({
      query: (roomCode) => ({
        url: `/${roomCode}/end`,
        method: "POST",
      }),
    }),
    joinMeeting: builders.mutation({
      query: (data) => ({
        url: `/${data.roomCode}/join`,
        method: "POST",
        body: {
          userEmail: data.userEmail || null,
          guestName: data.guestName,
        },
      }),
    }),
    deleteMeetingApi: builders.mutation({
      query: (id) => ({
        url: `/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Meetings"],
    }),
    updateMeetingApi: builders.mutation({
      query: (body) => ({
        method: "PUT",
        body: body,
      }),
      invalidatesTags: ["Meetings"],
    }),
    getMeetingInvited: builders.query({
      query: () => ({
        url: `/invited`,
        method: "GET",
      }),
    }),
  }),
});

export const { useScheduleMeetingMutation,useGetAllMeetingByEmailQuery,
  useGetInvitedMeetingsQuery,
  useCheckRoomCodeQuery,useGetStatusMeetingQuery,useEndMeetingMutation,
  useJoinMeetingMutation,useStartMeetingMutation,
  useLazyCheckRoomCodeQuery,
  useLazyGetStatusMeetingQuery,
  useDeleteMeetingApiMutation,
  useUpdateMeetingApiMutation,
  useGetMeetingInvitedQuery
} = meetingsApi;
export default meetingsApi;
