import bcrypt from "bcryptjs";

const salt = bcrypt.genSaltSync(10);

const hashPassword = async (password: string) => {
  return await bcrypt.hash(password, salt);
};

const comparePassword = async (password: string, hashedPassword: string) => {
  return await bcrypt.compare(password, hashedPassword);
};


export { hashPassword, comparePassword };
