const KEY = 'activeMeetingRoomCode';

export const getActiveMeeting = () => localStorage.getItem(KEY);
export const setActiveMeeting = (roomCode) => localStorage.setItem(KEY, roomCode);
export const clearActiveMeeting = () => localStorage.removeItem(KEY);
