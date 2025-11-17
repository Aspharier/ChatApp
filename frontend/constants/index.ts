import { Platform } from "react-native";

// export const API_URL = Platform.OS === "android" ? "http://10.0.2.2:3000" : "http://localhost:3000";

export const API_URL = Platform.OS === "android"? "http://10.54.31.4:3000" : "http://localhost:3000";
export const CLOUDINARY_CLOUD_NAME = "dij8r1uk4";
export const CLOUDINARY_UPLOAD_PRESET = "images";