const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const { registerGameEvents } = require("./gamesockets");

const app = express();

const regMenu = require("./server/registerMenu");
const connection = require("./server/database");

const server = http.createServer(app);
const io = new Server(server);
const PORT = process.env.PORT || 3000;

app.use(express.static("public"));

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);
  registerGameEvents(io, socket);

  socket.on("message", (data) => {
      console.log("Message from client:", data);
      io.emit("message", data);  
  });


  socket.on("disconnect", () => {
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
