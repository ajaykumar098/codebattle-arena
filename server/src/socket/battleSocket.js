const jwt = require('jsonwebtoken');
const { createRoom, getRoom, joinRoom, recordSubmission, deleteRoom } = require('../utils/roomManager');
const Problem = require('../models/Problem');

function determineWinner(room) {
  const { submissions, hostId, guestId, hostUsername, guestUsername } = room;
  const host = submissions[hostId];
  const guest = submissions[guestId];

  if (!host && !guest) return { winner: null, reason: 'No submissions' };
  if (!host) return { winner: guestId, winnerUsername: guestUsername, reason: 'Opponent did not submit' };
  if (!guest) return { winner: hostId, winnerUsername: hostUsername, reason: 'Opponent did not submit' };

  // Both passed every test case — declare a tie, don't use speed as a tiebreaker
  if (host.allPassed && guest.allPassed) {
    return { winner: null, winnerUsername: null, reason: 'Both solved it perfectly — tied!' };
  }

  if (host.passedTests !== guest.passedTests) {
    const winner = host.passedTests > guest.passedTests ? hostId : guestId;
    const winnerUsername = winner === hostId ? hostUsername : guestUsername;
    return { winner, winnerUsername, reason: 'More test cases passed' };
  }

  // Same partial score, neither fully passed — fall back to speed
  const winner = host.submittedAt < guest.submittedAt ? hostId : guestId;
  const winnerUsername = winner === hostId ? hostUsername : guestUsername;
  return { winner, winnerUsername, reason: 'Faster submission time' };
}

module.exports = function initBattleSocket(io) {
  // Middleware: authenticate socket connections via JWT
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error('Not authenticated'));
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      socket.username = decoded.username;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.username} (${socket.userId})`);

    // HOST: create a room
    socket.on('create_room', async ({ language, timerMinutes }, callback) => {
      try {
        // Pick a random problem (Easy for now — can make difficulty selectable later)
        const count = await Problem.countDocuments({ difficulty: 'Easy' });
        const skip = Math.floor(Math.random() * count);
        const problem = await Problem.findOne({ difficulty: 'Easy' }).skip(skip);

        if (!problem) return callback({ error: 'No problems available' });

        const room = createRoom({
          hostId: socket.userId,
          hostUsername: socket.username,
          language,
          timerMinutes: Math.max(5, timerMinutes), // enforce minimum 5 min
          problem: {
            _id: problem._id,
            title: problem.title,
            slug: problem.slug,
            description: problem.description,
            examples: problem.examples,
            starterCode: problem.starterCode,
            functionName: problem.functionName,
            testCases: problem.testCases,
          },
        });

        socket.join(room.code);
        socket.roomCode = room.code;
        callback({ room: { ...room, problem: { ...room.problem, testCases: undefined } } });
      } catch (err) {
        callback({ error: err.message });
      }
    });

    // GUEST: join a room
    socket.on('join_room', (roomCode, callback) => {
      const result = joinRoom(roomCode.toUpperCase(), {
        guestId: socket.userId,
        guestUsername: socket.username,
      });

      if (result.error) return callback({ error: result.error });

      socket.join(roomCode.toUpperCase());
      socket.roomCode = roomCode.toUpperCase();

      // Notify host that guest joined
      io.to(roomCode.toUpperCase()).emit('guest_joined', {
        guestUsername: socket.username,
        room: { ...result.room, problem: { ...result.room.problem, testCases: undefined } },
      });

      callback({ room: { ...result.room, problem: { ...result.room.problem, testCases: undefined } } });
    });

    // HOST: start the countdown (both players ready)
    socket.on('start_battle', (callback) => {
      const room = getRoom(socket.roomCode);
      if (!room) return callback?.({ error: 'Room not found' });
      if (!room.guestId) return callback?.({ error: 'Waiting for opponent' });
      if (room.hostId !== socket.userId) return callback?.({ error: 'Only host can start' });

      room.status = 'countdown';

      // 3-2-1 countdown then start
      let count = 3;
      io.to(socket.roomCode).emit('countdown', { count });

      const interval = setInterval(() => {
        count--;
        if (count > 0) {
          io.to(socket.roomCode).emit('countdown', { count });
        } else {
          clearInterval(interval);
          room.status = 'active';
          room.startedAt = Date.now();

          io.to(socket.roomCode).emit('battle_start', {
            problem: { ...room.problem, testCases: undefined },
            timerMinutes: room.timerMinutes,
            language: room.language,
            startedAt: room.startedAt,
          });

          // Auto-end when timer expires
          setTimeout(() => {
            const currentRoom = getRoom(socket.roomCode);
            if (currentRoom && currentRoom.status === 'active') {
              currentRoom.status = 'finished';
              const result = determineWinner(currentRoom);
              io.to(socket.roomCode).emit('battle_end', {
                ...result,
                submissions: currentRoom.submissions,
              });
              setTimeout(() => deleteRoom(socket.roomCode), 60000);
            }
          }, room.timerMinutes * 60 * 1000);
        }
      }, 1000);

      callback?.({ ok: true });
    });

    // PLAYER: submit code during battle
    socket.on('battle_submit', async ({ passedTests, totalTests, allPassed }, callback) => {
      const room = getRoom(socket.roomCode);
      if (!room) return callback?.({ error: 'Room not found' });
      if (room.status !== 'active') return callback?.({ error: 'Battle not active' });

      // Use client-provided results (graded locally with Pyodide)
      recordSubmission(socket.roomCode, socket.userId, { passedTests, totalTests, allPassed });

      // Tell the submitter their result
      callback?.({ passedTests, totalTests, allPassed });

      // Tell everyone in the room someone submitted (no code/details leaked)
      io.to(socket.roomCode).emit('opponent_submitted', {
        username: socket.username,
        passedTests,
        totalTests,
      });

      // If both players submitted, end early
      const updatedRoom = getRoom(socket.roomCode);
      const bothSubmitted =
        updatedRoom.submissions[updatedRoom.hostId] &&
        updatedRoom.submissions[updatedRoom.guestId];

      if (bothSubmitted && updatedRoom.status === 'active') {
        updatedRoom.status = 'finished';
        const result = determineWinner(updatedRoom);
        io.to(socket.roomCode).emit('battle_end', {
          ...result,
          submissions: updatedRoom.submissions,
        });
        setTimeout(() => deleteRoom(socket.roomCode), 60000);
      }
    });

    // Cleanup on disconnect
    socket.on('disconnect', () => {
      if (socket.roomCode) {
        const room = getRoom(socket.roomCode);
        if (room && room.status !== 'finished') {
          io.to(socket.roomCode).emit('opponent_disconnected', {
            username: socket.username,
          });
        }
      }
      console.log(`Socket disconnected: ${socket.username}`);
    });
  });
};
