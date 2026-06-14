import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { endMeeting } from "../../../api/meetingApi";
import { baseQueryWithReauth } from "../baseQueryWithReauth";
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
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Meetings"],
  endpoints: (builders) => ({
    getAllMeetingByEmail: builders.query({
      query: (email) => ({
        url: `/meeting/host/${email}`,
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
        url: `/meeting`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Meetings"],
    }),
    checkRoomCode: builders.query({
      query: (roomCode) => ({
        url: `/meeting/check/${roomCode}`,
        method: "GET",
      }),
    }),
    getStatusMeeting: builders.query({
      query: (roomCode) => ({
        url: `/meeting/${roomCode}/status`,
        method: "GET",
      }),
    }),
    startMeeting: builders.mutation({
      query: (roomCode) => ({
        url: `/meeting/${roomCode}/start`,
        method: "POST",
      }),
      invalidatesTags: ["Meetings"],
    }),
    endMeeting: builders.mutation({
      query: (roomCode) => ({
        url: `/meeting/${roomCode}/end`,
        method: "POST",
      }),
      invalidatesTags: ["Meetings"],
    }),
    joinMeeting: builders.mutation({
      query: (data) => ({
        url: `/meeting/${data.roomCode}/join`,
        method: "POST",
        body: {
          userEmail: data.userEmail || null,
          guestName: data.guestName,
        },
      }),
    }),
    leaveMeeting: builders.mutation({
      query: (joinToken) => ({
        url: `/meeting/leave`,
        method: "POST",
        body: { joinToken },
      }),
    }),
    deleteMeetingApi: builders.mutation({
      query: (id) => ({
        url: `/meeting/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Meetings"],
    }),
    updateMeetingApi: builders.mutation({
      query: (body) => ({
        url: `/meeting`,
        method: "PUT",
        body: body,
      }),
      invalidatesTags: ["Meetings"],
    }),
    getMeetingInvited: builders.query({
      query: () => ({
        url: `/meeting/invited`,
        method: "GET",
      }),
      providesTags: ["Meetings"],
    }),
  }),
});

export const { useScheduleMeetingMutation,useGetAllMeetingByEmailQuery,
  useGetInvitedMeetingsQuery,
  useCheckRoomCodeQuery,useGetStatusMeetingQuery,useEndMeetingMutation,
  useJoinMeetingMutation,useLeaveMeetingMutation,useStartMeetingMutation,
  useLazyCheckRoomCodeQuery,
  useLazyGetStatusMeetingQuery,
  useDeleteMeetingApiMutation,
  useUpdateMeetingApiMutation,
  useGetMeetingInvitedQuery
} = meetingsApi;
export default meetingsApi;
