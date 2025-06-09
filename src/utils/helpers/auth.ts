import bcrypt from "bcrypt";

const hashPassword = (password: string) => {
  return new Promise((resolve, reject) => {
    bcrypt.genSalt(12, (err: any, salt: any) => {
      if (err) { reject(err); }
      bcrypt.hash(password, salt, (err: any, hash: any) => {
        if (err) { reject(err); }
        resolve(hash);
      });
    });
  });
};

const comparePassword = (password: string, hashed: string) => {
  return bcrypt.compare(password, hashed);
};

export { hashPassword, comparePassword, };