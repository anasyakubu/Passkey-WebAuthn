import { IUser } from './../types/User';
import User from "../models/user.model";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { hashPassword, comparePassword } from "../utils/helpers/auth"
import generateRefID from "../utils/helpers/generateRefID";
import crypto from "crypto";



// ******************** LIST ALL USERS  ********************//
const listAllUsers = async (req: Request, res: Response): Promise<void> => {
  try {

    const users = await User.find({});

    if (!users || users.length === 0) {
      res.status(400).json({ status: false, msg: "Users not found", data: users })
    } else {
      res.status(200).json({ status: true, msg: "Users get successful", data: users })
    }

  } catch (error: any) {
    console.error("ERROR : ", error)
    res.status(500).json({ status: false, msg: error.message, error: error })
  }
}

// ******************** GET USERS BY ID  ********************//
const getUsersByID = async (req: Request, res: Response): Promise<void> => {
  try {

    const id: string = req.params.id;

    const users = await User.find({ _id: id });

    if (!users || users.length === 0) {
      res.status(400).json({ status: false, msg: "Users not found", data: users })
    } else {
      res.status(200).json({ status: true, msg: "Users get successful", data: users })
    }

  } catch (error: any) {
    console.error("ERROR : ", error)
    res.status(500).json({ status: false, msg: error.message, error: error })
  }
}

// ******************** REGISTER USER  ********************//
const registerUser = async (req: Request, res: Response): Promise<void> => {

  const DEFAULT_USER_IMAGE =
    "https://res.cloudinary.com/do52dpekr/image/upload/v1739627719/user-1_ml1nrp.jpg"

  try {

    const { name, email, username, password, referredBy } = req.body;


    //*********** check for missing fields ***********//
    const checkMissingFields = (fields: any) => {
      for (const [key, value] of Object.entries(fields)) {
        if (!value) { return key; }
      }
      return null; // All fields are valid
    };

    const fieldsToCheck = { name, email, username, password };
    const missingField = checkMissingFields(fieldsToCheck);

    if (missingField) { res.status(400).json({ status: false, msg: `${missingField} is required` }); }


    //*********** check if password is good ***********//
    if (!password || password.length < 4) {
      res.status(400).json({
        status: false, msg:
          "Password is required and it should be 4 characters long",
      });
    }

    //*********** check email exist ***********//
    const exist = await User.findOne({ email });
    if (exist) { res.status(400).json({ status: false, msg: "Email already taken", }); }

    //*********** hased password ***********//
    const hashedPassword = await hashPassword(password);

    //*************** Generate RefID ****************//
    const refID = await generateRefID(name);

    //*********** create user in db ***********//
    const user = await User.create({
      uid: "", name, email, username,
      photoURL: DEFAULT_USER_IMAGE,
      password: hashedPassword, verified: false,
      isPremium: false, refID: refID, referredBy,
    });


    if (referredBy) {
      const referrer = await User.findOne({ refID: referredBy });
      if (referrer) { referrer.referrals.push(user._id); await referrer.save(); }
    }

    //*********** return response ***********//
    res.status(201).json({ status: true, msg: "User Registered Successful", data: user });


  } catch (error: any) {
    console.error("ERROR : ", error)
    res.status(500).json({ status: false, msg: error.message, error: error })
  }
}


//********************** Forget password functionality **********************//
const forgetPassword = async (req: Request, res: Response): Promise<void> => {
  const { email } = req.body;
  try {
    //************ check for user exist ************//
    const user = await User.findOne({ email: email });
    if (!user) { res.status(404).json({ status: 404, message: 'User not found' }); }

    //************  Generate reset token ************ //

    const resetToken = crypto.randomBytes(32).toString('hex');
    await User.findOneAndUpdate(
      { email },
      { resetToken, resetTokenExpiry: Date.now() + 3600000 },
      { new: true } // Returns the updated document
    );

    //************ Send email ************//
    // await sendResetToken(resetToken, email);

    res.status(200).json({ statu: true, msg: 'Password reset email sent' });
  } catch (error) {
    console.error("Forget Pass:", error);
    res.status(500).json({ status: false, msg: "Internal Server Error", error });
  }
}

//********************** Reset password functionality **********************//
const resetPassword = async (req: Request, res: Response): Promise<void> => {
  const { token } = req.params;
  const { password } = req.body;
  try {

    //************ check for valid token ************//
    const user: IUser | any = await User.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: Date.now() } // ✅ Mongoose uses `$gt`
    });

    if (!user) { res.status(400).send({ status: false, msg: 'Invalid or expired token' }); }

    //************ hashed password to db ************//
    const hashedPassword = await hashPassword(password);
    user.password = hashedPassword;
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;

    // ************ Update User Password ************//
    await user.save();

    res.status(200).json({ status: true, message: 'Password reset successful' });

  } catch (error: any) {
    console.log("ERROR", error);
    res.status(500).json({ status: false, msg: "Internal Server Error", error });
  }
}


// ******************** DEACTIVITATE USER  ********************//
const deactiviateUser = async (req: Request, res: Response): Promise<void> => { }

export {
  listAllUsers, getUsersByID, registerUser, forgetPassword, resetPassword,
  deactiviateUser
}