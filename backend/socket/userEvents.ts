import { Socket, Server as SocketIOServer } from "socket.io";
import User from "../modals/User.js";
import { generateToken } from "../utils/token.js";
export function registerUserEvents(io: SocketIOServer, socket: Socket) {
  socket.on("testSocket", (data) => {
    socket.emit("testSocket", { msg: "Real Time Update" });
  });

  socket.on(
    "updateProfile",
    async (data: { name?: string; avatar?: string }) => {
      console.log("updateProfile event: ", data);

      const userId = socket.data.userId;
      if (!userId) {
        return socket.emit("updateProfile", {
          success: false,
          msg: "Unauthorized",
        });
      }
      try {
        const updateUser = await User.findByIdAndUpdate(
          userId,
          { name: data.name, avatar: data.avatar },
          { new: true } // will return the user with the updated values
        );
        if (!updateUser) {
          return socket.emit("updateProfile", {
            success: false,
            msg: "User not found",
          });
        }

        // gen token with updated values
        const newToken = generateToken(updateUser);
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
    }
  );
}
