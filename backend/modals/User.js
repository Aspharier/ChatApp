import mongoose from "mongoose";
const { Schema } = mongoose;

const UserSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  avatar: {
    type: String,
    default: "",
  },
  created: {
    type: String,
    default: Date.now,
  },
});

export default mongoose.model("User", UserSchema);
