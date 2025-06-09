import mongoose from "mongoose";


export interface IUser extends Document {
  uid: string;
  name: string;
  username: string;
  phone: string;
  resetToken: string;
  resetTokenExpiry: string;
  address: string;
  photoURL: string;
  verified: boolean;
  walletBalance: number;
  walletRefBalance: number;
  refID: string;
  referredBy: string;
  referrals: mongoose.Types.ObjectId[];
  referralRewardsClaimed: boolean;
  createdAt?: Date; updatedAt?: Date;
}