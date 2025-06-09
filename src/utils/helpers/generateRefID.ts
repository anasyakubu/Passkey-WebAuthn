import User from "../../models/user.model";

const generateRefID = async (name: string) => {
  let unique = false;
  let refID = "";

  while (!unique) {
    const namePart = name.toLowerCase().replace(/\s+/g, '').slice(0, 5);
    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    refID = `${namePart}${randomDigits}`;

    const existing = await User.findOne({ refID });
    if (!existing) unique = true;
  }

  return refID;
};


export default generateRefID;