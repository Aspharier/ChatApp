import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";

const connectDB = async() => {
    try {
        await mongoose.connect(process.env.MONGO_URI)
        console.log("Database connected");
    } catch (error) {
        console.error("Error connecting to database:", error);
        throw error;
    }
}

export default connectDB;