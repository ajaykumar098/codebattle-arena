const rooms = new Map();

function generateRoomCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

function createRoom({ hostId, hostUsername, language, timerMinutes, problem }) {
  let code;
  do {
    code = generateRoomCode();
  } while (rooms.has(code));

  const room = {
    code,
    hostId,
    hostUsername,
    guestId: null,
    guestUsername: null,
    language,
    timerMinutes,
    problem,
    status: 'waiting', // waiting | countdown | active | finished
    startedAt: null,
    submissions: {},
  };

  rooms.set(code, room);
  return room;
}

function getRoom(code) {
  return rooms.get(code) || null;
}

function joinRoom(code, { guestId, guestUsername }) {
  const room = rooms.get(code);
  if (!room) return { error: 'Room not found' };
  if (room.status !== 'waiting') return { error: 'Room already started' };
  if (room.guestId) return { error: 'Room is full' };
  if (room.hostId === guestId) return { error: 'Cannot join your own room' };

  room.guestId = guestId;
  room.guestUsername = guestUsername;
  return { room };
}

function recordSubmission(code, userId, result) {
  const room = rooms.get(code);
  if (!room) return null;
  room.submissions[userId] = {
    passedTests: result.passedTests,
    totalTests: result.totalTests,
    allPassed: result.allPassed,
    submittedAt: Date.now(),
  };
  return room;
}

function deleteRoom(code) {
  rooms.delete(code);
}

module.exports = { createRoom, getRoom, joinRoom, recordSubmission, deleteRoom };
