import express from "express";
import userRoutes from "./user.routes";

const router = express.Router();

//********************** Routes Setup **********************//
router.use("/", userRoutes);


export default router;