import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

//*********** database connection ***********//
const connection = mongoose.connect(process.env.MONGODB_URL || "", { dbName: "daily-auth-db", })
  .then(() => console.log("Database Connected ✅✅"))
  .catch((err) => console.log("Database not connected ❌❌", err));

export default connection; // export it to use in other files