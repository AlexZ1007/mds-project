const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cookieParser = require('cookie-parser');
const cookie = require('cookie');
const jwt = require('jsonwebtoken');
const { registerGameEvents } = require("./gameSockets");
const { spawn } = require('child_process');

const app = express();
const regMenu = require("./server/registerMenu");
const connection = require("./server/database");
const userService = require("./services/userService");

const server = http.createServer(app);
const io = new Server(server);
const PORT = process.env.PORT || 3000;

const user_service = new userService();


app.use(cookieParser());
app.use(express.static("public"));

// Socket.IO Auth Middleware
io.use((socket, next) => {
  try {
    const cookies = cookie.parse(socket.handshake.headers.cookie || '');
    const token = cookies.token;

    if (!token) {
      return next(new Error('Authentication error: Token missing'));
    }

    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    socket.user = { userId: decoded.userId };
    next();
  } catch (err) {
    console.error("Socket auth error:", err.message);
    return next(new Error('Authentication error: Invalid token'));
  }
});

// // 🚀 Start Python ML API
// const pythonApi = spawn('python', ['services/ml/price_api.py'], {
//   stdio: 'inherit',
// });

// pythonApi.on('close', (code) => {
//   console.log(`Python ML API exited with code ${code}`);
// });

const match_queue = [];
const lobbies = {};

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id, "userId:", socket.user?.userId);
  registerGameEvents(io, socket, match_queue, lobbies);

  socket.on("disconnect", () => {
    // Remove from match queue if waiting
    const index = match_queue.findIndex((item) => item.id === socket.id);
    if (index !== -1) {
      match_queue.splice(index, 1);
    }

    console.log("User disconnected:", socket.id);
    
    // Check if user was in a lobby
    for (const [lobbyId, lobby] of Object.entries(lobbies)) {
      const playerIndex = lobby.playerSockets.findIndex(s => s.id === socket.id);
      if (playerIndex !== -1) {
        const opponentSocket = lobby.playerSockets.find(s => s.id !== socket.id);
        const player = lobby.players[socket.id];
        const opponent = lobby.players[opponentSocket?.id];

        // If opponent exists, treat as a win/loss
        if (opponentSocket && opponent) {
          const winnerReward = { status: 'win', coins: 120, trophies: 30 };
          const loserReward = { status: 'lose', coins: 40, trophies: -30 };

          opponentSocket.emit('game_over', winnerReward);
          user_service.updateUserAfterGame(opponentSocket.user.userId, winnerReward);

          socket.emit?.('game_over', loserReward); // If still connected
          user_service.updateUserAfterGame(socket.user.userId, loserReward);
        }

        // Clean up the lobby
        delete lobbies[lobbyId];
        break; // Player found, no need to continue loop
      }
    }

    console.log("queue", match_queue);
  });
});


server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

// Register Express routes
regMenu(app);
