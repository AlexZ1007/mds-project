const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cookieParser = require('cookie-parser');
const { registerGameEvents } = require("./gameSockets");
const { spawn } = require('child_process')

const app = express();

const regMenu = require("./server/registerMenu");
const connection = require("./server/database");

const server = http.createServer(app);
const io = new Server(server);
const PORT = process.env.PORT || 3000;

app.use(cookieParser());
app.use(express.static("public"));

// starts the Python ML API
const pythonApi = spawn('python', ['services/ml/price_api.py'], {
  stdio: 'inherit', // this will pipe the Python output to the Node console
});

// handles Python process exit
pythonApi.on('close', (code) => {
  console.log(`Python ML API exited with code ${code}`);
});

const match_queue = [];
const lobbies = {};


io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);
  registerGameEvents(io, socket, match_queue, lobbies);


  socket.on("disconnect", () => {
    const index = match_queue.findIndex((item) => item.id === socket.id);
    if (index !== -1) {
      match_queue.splice(index, 1);
    }

    console.log("queue", match_queue);
    console.log("User disconnected:", socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});


regMenu(app); 
