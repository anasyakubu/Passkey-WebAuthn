import mongoose, { Schema } from "mongoose";
import { IUser } from "../types/User"


const userSchema: Schema = new Schema(
  {
    name: { type: String, require: true },
    username: { type: String },
    email: { type: String, require: true, unique: true },
    phone: { type: String },
    password: { type: String, require: true },
    address: { type: String, },
    photoURL: { type: String },
    verified: { type: Boolean }, isPremium: { type: Boolean },
  },
  { timestamps: true }
);

// Create the model
const User = mongoose.model<IUser>("Users", userSchema);

export default User;