import express from "express";
const router = express.Router();
import { requireAuth } from "../middleware/authMiddleware";

import {
  listAllUsers, getUsersByID, registerUser, forgetPassword, resetPassword,
  deactiviateUser,
} from "../controllers/user.controller";


//*********** Login, register & verification ***********//
router.post("/register", registerUser);
router.get("/auth/user/get/:id", requireAuth, getUsersByID);
router.get("/auth/users", listAllUsers);
router.post("/auth/forget-password", forgetPassword);
router.post("/auth/reset-password/:token", resetPassword);


//*********** New Routes for Social Media Authentication ***********//


export default router;