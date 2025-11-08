const jwt = require("jsonwebtoken");
export const generateToken = () => {
  const payload = {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
    },
  };

  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};
