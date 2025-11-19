import { Socket, Server as SocketIOServer } from "socket.io";
import Conversation from "../modals/Conversation.js";
export function registerChatEvents(io: SocketIOServer, socket: Socket) {
  socket.on("getConversations", async () => {
    console.log("GetConversations event");
    try {
      const userId = socket.data.userId;
      if (!userId) {
        return socket.emit("getConversations", {
          success: false,
          msg: "Unauthorized",
        });
        return;
      }

      // find all the conversations where user is a participant
      const conversations = await Conversation.find({
        participants: userId,
      })
        .sort({ updatedAt: -1 })
        .populate({
          path: "lastMessage",
          select: "content senderId attachement createdAt",
        })
        .populate({
          path: "participants",
          select: "name avatar email",
        })
        .lean();

      socket.emit("getConversations", { success: true, data: conversations });
    } catch (error) {
      console.log("getConversations Error: ", error);
      socket.emit("getConversations", {
        success: false,
        msg: "Failed to fetch conversations.",
      });
    }
  });
  socket.on("newConversation", async (data) => {
    console.log("newConverstaion Event: ", data);
    try {
      if (data.type === "direct") {
        // check if already exists
        const existingConversation = await Conversation.findOne({
          type: "direct",
          participants: { $all: data.participants, $size: 2 },
        })
          .populate({
            path: "participants",
            select: "name avatar email",
          })
          .lean();

        if (existingConversation) {
          socket.emit("newConversation", {
            success: true,
            data: { ...existingConversation, isNew: false },
          });
          return;
        }
      }

      // create new conversation
      const conversation = await Conversation.create({
        type: data.type,
        participants: data.participants,
        name: data.name || "", // can be empty if direct conversation
        avatar: data.avatar || "",
        createdBy: socket.data.userId,
      });

      // get all the connected sockets
      const connectedSockets = Array.from(io.sockets.sockets.values()).filter(
        (s) => data.participants.includes(s.data.userId)
      );

      // join the conversation by all online participants
      connectedSockets.forEach((participantSocket) => {
        participantSocket.join(conversation._id.toString());
      });

      // send conversation data back (populated)
      const populatedConversation = await Conversation.findById(
        conversation._id
      )
        .populate({
          path: "participants",
          select: "name avatar email",
        })
        .lean();

      if (!populatedConversation) {
        throw new Error("Failed to populate conversation");
      }

      // emit conversation to all the participants
      io.to(conversation._id.toString()).emit("newConversation", {
        success: true,
        data: { ...populatedConversation, isNew: true },
      });
    } catch (error: any) {
      console.log("newConversation Error: ", error);
      socket.emit("newConversation", {
        success: false,
        msg: "Failed to create conversation.",
      });
    }
  });
}
