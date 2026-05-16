import jwt from "jsonwebtoken";
import User from "../models/User.js";

/**
 * Protect middleware to secure routes.
 * It expects an Authorization header in the format: "Bearer <token>"
 */
export const protect = async (req, res, next) => {
  let token;

  // 1. Check if Authorization header exists and starts with 'Bearer'
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // 2. Extract token from the string "Bearer <token>"
      token = req.headers.authorization.split(" ")[1];

      // 3. Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // 4. Get user from the database and attach to request
      req.user = await User.findById(decoded.id).select("-password");

      if (!req.user) {
        return res.status(401).json({ message: "User not found with this token" });
      }

      next();
    } catch (err) {
      console.error("Auth Middleware Error:", err);
      return res.status(401).json({ message: "Not authorized, token failed" });
    }
  }

  // 5. Handle case where no token is provided
  if (!token) {
    return res.status(401).json({ message: "Not authorized, no token provided" });
  }
};