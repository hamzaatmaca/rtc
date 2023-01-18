const http = require("http");
const express = require("express");
const app = express();
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");

//PORT
const PORT = process.env.PORT || 3030;

//CREATE SERVER
const server = http.createServer(app);

//SOCKET SERVER
const { Server } = require("socket.io");

const io = new Server(server, {
  cors: {
    origins: "*",
    methods: ["GET", "POST"],
  },
});

//USE ENV FILE
require("dotenv").config();

//CORS OPTIONS
app.use(cors());

//CLIENT COUNT

//GENERATE UNIQ ROOM
io.engine.generateId = (req) => {
  return uuidv4();
};

io.on("connection", (socket) => {
  socket.on("room", (data) => {
    console.log("room-ID", data);
    socket.join(data);
  });

  const count = io.engine.clientsCount;

  socket.on("chatMessage", (data) => {
    socket.to(data.room).emit("chatMessageReturn", data);
  });

  socket.on("webRTC-signaling", (data) => {
    socket.to(data.room).emit("webRTC-signaling", data);
  });

//   if (count > 2) {
//     socket.emit("error", { message: "reach the limit of connections" });
//     socket.disconnect();
//     console.log("Disconnected...");
//   }

  socket.on("disconnect", () => {
    console.log(`User disconnnect`);
    socket.broadcast.emit("callEnded");
  });
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
