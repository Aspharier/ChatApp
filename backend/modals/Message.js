import mongoose, { mongo } from "mongoose";
const { Schema } = mongoose;

const MessageSchema = new Schema(
  {
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: String,
    attachement: String,
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Message", MessageSchema);
