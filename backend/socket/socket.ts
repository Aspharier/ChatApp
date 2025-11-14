import dotenv from "dotenv";
dotenv.config();
import jwt from "jsonwebtoken";
import { Socket, Server as SocketIOServer } from "socket.io";
import { registerUser } from "../controllers/auth.controller.js";
import { registerUserEvents } from "./userEvents.ts";

export function initializeSocket(server: any): SocketIOServer {
  const io = new SocketIOServer(server, {
    cors: {
      origin: "*", // allow all origins
    },
  }); // socket io server instance

  // Auth middleware
  io.use((socket: Socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error("Authentication error: no token provided"));
    }

    jwt.verify(
      token,
      process.env.JWT_SECRET as string,
      (err: any, decoded: any) => {
        if (err) {
          return next(new Error("Authentication error: invalid token"));
        }

        // attach user data to socket
        let userData = decoded.user;
        socket.data = userData;
        socket.data.userId = userData.id;
        next();
      }
    );
  });

  // when socket connects, register
  io.on("connection", async (socket: Socket) => {
    const userId = socket.data.userId;
    console.log(`User ${userId} connected, User Name ${socket.data.name}`);

    // register events
    registerUserEvents(io, socket);

    socket.on("disconnect", () => {
      // user logs out
      console.log(`User ${userId} disconnected`);
    });
  });
  return io;
}
