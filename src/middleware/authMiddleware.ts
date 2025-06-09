import jwt from "jsonwebtoken";
import { Request, Response, NextFunction, RequestHandler } from "express";
import dotenv from "dotenv";
dotenv.config();

interface DecodedToken {
  _id: string;
  userID: string;
  role?: string;
}

declare module "express-serve-static-core" {
  interface Request {
    user?: DecodedToken;
  }
}

// Using RequestHandler type to ensure proper typing
const requireAuth: RequestHandler = async (req, res, next) => {
  try {
    const authHeader = req.get("Authorization");

    if (!authHeader) {
      res.status(401).json({ error: "Authentication token missing!" });
      return;
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      res.status(401).json({ error: "Token missing or malformed!" });
      return;
    }

    const decodedToken = jwt.verify(token, process.env.JWT_SECRET!) as DecodedToken;

    if (!decodedToken) {
      res.status(403).json({ status: 403, error: "Invalid or expired token!" });
      return;
    }

    req.user = decodedToken;

    // console.log("Decoded token:", decodedToken); for debuging

    next();
  } catch (error) {
    console.error("Authentication error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const requireAdmin: RequestHandler = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(403).json({ error: "Admin access required!" });
  }
};

export { requireAuth, requireAdmin };