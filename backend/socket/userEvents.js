import { Server } from "socket.io";
import User from "../modals/User.js";
import { generateToken } from "../utils/token.js";

export function registerUserEvents(io, socket) {
  // Test event
  socket.on("testSocket", (data) => {
    socket.emit("testSocket", { msg: "Real Time Update" });
  });

  // Update profile
  socket.on("updateProfile", async (data) => {
    console.log("updateProfile event: ", data);

    const userId = socket.data.userId;
    if (!userId) {
      return socket.emit("updateProfile", {
        success: false,
        msg: "Unauthorized",
      });
    }

    try {
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { name: data.name, avatar: data.avatar },
        { new: true }
      );

      if (!updatedUser) {
        return socket.emit("updateProfile", {
          success: false,
          msg: "User not found",
        });
      }

      const newToken = generateToken(updatedUser);

      socket.emit("updateProfile", {
        success: true,
        data: { token: newToken },
        msg: "Profile updated successfully",
      });
    } catch (error) {
      console.log("Error updating profile: ", error);
      socket.emit("updateProfile", {
        success: false,
        msg: "Error updating profile",
      });
    }
  });

  // Get contacts
  socket.on("getContacts", async () => {
    try {
      const currentUserId = socket.data.userId;

      if (!currentUserId) {
        return socket.emit("getContacts", {
          success: false,
          msg: "Unauthorized",
        });
      }

      const users = await User.find(
        { _id: { $ne: currentUserId } },
        { password: 0 }
      ).lean();

      const contacts = users.map((user) => ({
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        avatar: user.avatar || "",
      }));

      socket.emit("getContacts", {
        success: true,
        data: contacts,
      });
    } catch (error) {
      console.log("getContacts error: ", error);
      socket.emit("getContacts", {
        success: false,
        msg: "Failed to fetch contacts",
      });
    }
  });
}
