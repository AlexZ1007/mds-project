const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cookieParser = require('cookie-parser');
const { registerGameEvents } = require("./gameSockets");

const app = express();

const regMenu = require("./server/registerMenu");
const connection = require("./server/database");

const server = http.createServer(app);
const io = new Server(server);
const PORT = process.env.PORT || 3000;

app.use(cookieParser());
app.use(express.static("public"));

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


// $query = "select * from Account"
// connection.query($query, function(err, rows, fields){
//     if (err){
//         console.log(err);
//         return;
//     }

//     console.log("Querry succesful");
// })

// connection.end(function(){
//     console.log("Connection ended");
// })

regMenu(app); 
