import User from "../modals/User";
import { generateToken } from "../utils/token";
const bcryptjs = require("bcryptjs");

export const registerUser = async (req, res) => {
  const { email, password, name, avatar } = req.body;

  try {
    // check user already exist or not
    let user = User.findOne({ email });
    if (user) {
      res.status(400).json({ success: false, msg: "User already exists" });
      return;
    }

    // create new user
    user = new User({
      email,
      password,
      name,
      avatar: avatar || "",
    });

    // hash password
    const salt = await bcryptjs.genSalt(10);
    user.password = await bcryptjs.hash(password, salt);

    // save user
    await user.save();

    // gen token
    const token = generateToken(user);

    res.json({
      success: true,
      token,
    });
  } catch (error) {
    console.log("Error: ", error);
    res.status(500).json({ success: false, msg: "Server error" });
  }
};
export const loginUser = async () => {
  const { email, password } = req.body;

  try {
    // find user by email
    const user = await User.findOne({ email });
    if (!user) {
      res.status(400).json({
        success: false,
        msg: "Invalid credentials",
      });
      return;
    }

    // compare passwords
    const isMatch = await bcryptjs.compare(password, user.password);
    if (!isMatch) {
      res.status(400).json({
        success: false,
        msg: "Invalid credentials",
      });
      return;
    }

    // gen token
    const token = generateToken(user);
    res.json({
      success: true,
      token,
    });
  } catch (error) {
    console.log("Error: ", error);
    res.status(500).json({ success: false, msg: "Server error" });
  }
};
