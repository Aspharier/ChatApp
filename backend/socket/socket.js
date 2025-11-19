import dotenv from "dotenv";
dotenv.config();
import jwt from "jsonwebtoken";
import { Server } from "socket.io";
import { registerUser } from "../controllers/auth.controller.js";
import { registerUserEvents } from "./userEvents.js";
import { registerChatEvents } from "./chatEvents.js";
import Conversation from "../modals/Conversation.js";

export function initializeSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: "*", // allow all origins
    },
  }); // socket io server instance

  // Auth middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error("Authentication error: no token provided"));
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        return next(new Error("Authentication error: invalid token"));
      }

      // attach user data to socket
      let userData = decoded.user;
      socket.data = userData;
      socket.data.userId = userData.id;
      next();
    });
  });

  // when socket connects, register
  io.on("connection", async (socket) => {
    const userId = socket.data.userId;
    console.log(`User ${userId} connected, User Name ${socket.data.name}`);

    // register events
    registerUserEvents(io, socket);
    registerChatEvents(io, socket);

    // join all the conversations the user is part of
    try {
      const conversations = await Conversation.find({
        participants: userId,
      }).select("_id");

      conversations.forEach((conversation) => {
        socket.join(conversation._id.toString());
      });
    } catch (error) {
      console.log("Error joining conversations: ", error);
    }

    socket.on("disconnect", () => {
      // user logs out
      console.log(`User ${userId} disconnected`);
    });
  });
  return io;
}
