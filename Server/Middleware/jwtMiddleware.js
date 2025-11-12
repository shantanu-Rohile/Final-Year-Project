import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

export function authenticationToken(req, res, next) {
  // Extract the token from the Authorization header
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Format: "Bearer <token>"

  // If no token found
  if (!token) {
    return res.status(401).json({ message: "Access denied. No token provided." });
  }

  // Verify token
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: "Invalid or expired token." });
    }

    // Store decoded user info in request
    req.user = user;
    next();
  });
}
