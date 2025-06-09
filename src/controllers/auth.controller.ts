import { IUser } from './../types/User';
import User from "../models/user.model";
import { Request, Response } from "express";
import {
  generateRegistrationOptions, verifyRegistrationResponse, generateAuthenticationOptions,
  verifyAuthenticationResponse
} from "@simplewebauthn/server";
import { hashPassword, comparePassword } from "../utils/helpers/auth"
//import generateRefID from '../utils/helpers/generateRefID'; // id generator


// In-memory user store for demo purposes

const users: IUser | any = User.find({});


//******************** Registration challenge ********************//
const registerUser = async (req: Request, res: Response): Promise<void> => {

  const DEFAULT_USER_IMAGE =
    "https://res.cloudinary.com/do52dpekr/image/upload/v1739627719/user-1_ml1nrp.jpg"

  try {

    const { name, email, username, password } = req.body;


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

    //*********** create user in db ***********//
    const user = await User.create({
      name, email, username,
      photoURL: DEFAULT_USER_IMAGE,
      password: hashedPassword, verified: false,
    });


    const options = generateRegistrationOptions({
      rpName: "My App",
      rpID: "localhost", // Replace with your domain in production
      userID: new TextEncoder().encode(user._id.toString()),// Use user ID as the unique identifier
      userName: username,
      attestationType: "none",
    });

    // Save challenge for verification
    users[username] = { id: user.id, challenge: options, credentials: [] };


    //*********** return response ***********//
    res.status(201).json({
      status: true, msg: "User Registered Successful",
      data: user, options
    });


  } catch (error: any) {
    console.error("ERROR : ", error)
    res.status(500).json({ status: false, msg: error.message, error: error })
  }
}

//********************  Registration verification ******************** //
const verifyRegistration = async (req: Request, res: Response): Promise<void> => {

  const { username, attestationResponse } = req.body;
  const expectedChallenge = users[username]?.challenge;

  try {
    const verification = await verifyRegistrationResponse({
      response: attestationResponse,
      expectedChallenge,
      expectedOrigin: "http://localhost:5173",
      expectedRPID: "localhost",
    });

    if (verification.verified) {
      // Save credential
      users[username].credentials.push(verification.registrationInfo);
      res.json({ success: true });
    } else {
      res.status(400).json({ error: "Verification failed" });
    }
  } catch (e: any) {
    res.status(400).json({ status: 400, error: e.message });
  }
};


//******************** Authentication challenge ********************//
const authenticateUser = async (req: Request, res: Response): Promise<void> => {
  const { username } = req.body;
  const user = users[username];

  if (!user) {
    res.status(404).json({ error: "User not found" });
    return; // Important! stop further execution
  }

  try {
    const options = await generateAuthenticationOptions({
      rpID: "localhost",
      allowCredentials: user.credentials.map((cred: any) => ({
        id: cred.credentialID,
        type: "public-key",
        transports: ["internal"],
      })),
      userVerification: "preferred",
    });

    // Save challenge
    user.challenge = options.challenge;
    res.json(options);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

//******************** Authentication verification ********************//
// const verifyAuthentication = async (req: Request, res: Response): Promise<void> => {
//   const { username, assertionResponse } = req.body;
//   const expectedChallenge = users[username]?.challenge;
//   const userCreds = users[username]?.credentials;

//   if (!userCreds || userCreds.length === 0) {
//     res.status(400).json({ error: "No credentials found for user" });
//     return;
//   }

//   const authenticator: Authenticator = {
//     credentialID: userCreds[0].credentialID,
//     credentialPublicKey: userCreds[0].credentialPublicKey,
//     counter: userCreds[0].counter,
//     transports: userCreds[0].transports,
//   };

//   try {
//     const verification = await verifyAuthenticationResponse({
//       response: assertionResponse,
//       expectedChallenge,
//       expectedOrigin: "http://localhost:5173",
//       expectedRPID: "localhost",
//       credential: {
//         id: authenticator.credentialID,
//         publicKey: authenticator.credentialPublicKey,
//         counter: authenticator.counter,
//         transports: authenticator.transports,
//       },
//     });

//     if (verification.verified) {
//       // Optionally update counter for replay protection
//       authenticator.counter = verification.authenticationInfo.newCounter;
//       res.json({ success: true });
//     } else {
//       res.status(400).json({ error: "Verification failed" });
//     }
//   } catch (e: any) {
//     res.status(400).json({ error: e.message });
//   }
// };