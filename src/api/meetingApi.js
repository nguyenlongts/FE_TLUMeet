const API_BASE = "http://localhost:5555/api/meeting";

export const getMeetingsByHost = (email, token) =>
  fetch(`${API_BASE}/host/${email}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const getInvitedMeetings = (token) =>
  fetch(`${API_BASE}/invited`, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const deleteMeeting = (id, token) =>
  fetch(`${API_BASE}/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });

export const checkRoomCode = (code) => fetch(`${API_BASE}/check/${code}`);

export const createMeeting = (payload, token) =>
  fetch(API_BASE, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

export const joinMeeting = (roomCode, payload) =>
  fetch(`${API_BASE}/${roomCode}/join`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

export const getParticipants = (roomCode) =>
  fetch(`${API_BASE}/${roomCode}/participants`);

export const startMeeting = (roomCode, token) =>
  fetch(`${API_BASE}/${roomCode}/start`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });

export const endMeeting = (roomCode, token) =>
  fetch(`${API_BASE}/${roomCode}/end`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });

  //1
export const sendInvites = (roomCode, emails, token) =>
  fetch(`${API_BASE}/${roomCode}/invite`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ inviteeEmails: emails }),
  });


  //2
export const acceptInvite = (inviteId, token) =>
  fetch(`${API_BASE}/invite/${inviteId}/respond`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ status: "Accepted" }),
  });

  //2
export const rejectInvite = (inviteId, token) =>
  fetch(`${API_BASE}/invite/${inviteId}/respond`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ status: "Declined" }),
  });
