import { Server } from "socket.io";
import Conversation from "../modals/Conversation.js";
import Message from "../modals/Message.js";

export function registerChatEvents(io, socket) {
  socket.on("getConversations", async () => {
    console.log("getConversations event");

    try {
      const userId = socket.data.userId;

      if (!userId) {
        return socket.emit("getConversations", {
          success: false,
          msg: "Unauthorized",
        });
      }

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

      socket.emit("getConversations", {
        success: true,
        data: conversations,
      });
    } catch (error) {
      console.log("getConversations Error:", error);
      socket.emit("getConversations", {
        success: false,
        msg: "Failed to fetch conversations.",
      });
    }
  });
  socket.on("newConversation", async (data) => {
    console.log("newConversation event:", data);

    try {
      // If direct conversation, check if it already exists
      if (data.type === "direct") {
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

      // Create new conversation
      const conversation = await Conversation.create({
        type: data.type,
        participants: data.participants,
        name: data.name || "",
        avatar: data.avatar || "",
        createdBy: socket.data.userId,
      });

      // Get all online sockets for given participants
      const connectedSockets = Array.from(io.sockets.sockets.values()).filter(
        (s) => data.participants.includes(s.data.userId)
      );

      // Have all online users join this new room
      connectedSockets.forEach((participantSocket) => {
        participantSocket.join(conversation._id.toString());
      });

      // Populate conversation data
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

      // Emit to all participants in the room
      io.to(conversation._id.toString()).emit("newConversation", {
        success: true,
        data: { ...populatedConversation, isNew: true },
      });
    } catch (error) {
      console.log("newConversation Error:", error);
      socket.emit("newConversation", {
        success: false,
        msg: "Failed to create conversation.",
      });
    }
  });
  socket.on("newMessage", async (data) => {
    console.log("newMessage event:", data);

    try {
      const message = await Message.create({
        conversationId: data.conversationId,
        senderId: data.sender.id,
        content: data.content,
        attachement: data.attachement,
      });

      const payload = {
        id: message._id,
        content: data.content,
        sender: {
          id: data.sender.id,
          name: data.sender.name,
          avatar: data.sender.avatar,
        },
        attachement: data.attachement,
        createdAt: new Date().toISOString(),
        conversationId: data.conversationId,
      };

      // emit to all clients in room
      io.to(data.conversationId).emit("newMessage", {
        success: true,
        data: payload,
      });

      // update last message
      await Conversation.findByIdAndUpdate(data.conversationId, {
        lastMessage: message._id,
      });
    } catch (error) {
      console.log("newMessage Error:", error);
      socket.emit("newMessage", {
        success: false,
        msg: "Failed to send message.",
      });
    }
  });
  socket.on("getMessages", async (data) => {
    console.log("getMessages event:", data);

    try {
      const messages = await Message.find({
        conversationId: data.conversationId,
      })
        .sort({ createdAt: -1 })
        .populate({
          path: "senderId",
          select: "name avatar",
        })
        .lean();

      const messageWithSender = messages.map((msg) => ({
        ...msg,
        id: msg._id,
        sender: {
          id: msg.senderId._id,
          name: msg.senderId.name,
          avatar: msg.senderId.avatar,
        },
      }));

      socket.emit("getMessages", {
        success: true,
        data: messageWithSender,
      });
    } catch (error) {
      console.log("getMessages Error:", error);
      socket.emit("getMessages", {
        success: false,
        msg: "Failed to get messages.",
      });
    }
  });
}
