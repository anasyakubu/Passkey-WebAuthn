
const generateAppID = async () => {
  let unique = false;
  let appID = "";

  while (!unique) {
    const namePart = "App";
    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    appID = `${namePart}-${randomDigits}`;

    // const existing = await App.findOne({ appID });
    // if (!existing) unique = true;
  }

  return appID;
};


export default generateAppID;