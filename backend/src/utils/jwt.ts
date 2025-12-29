import jwt, { SignOptions } from "jsonwebtoken";
import authConfig from "@/config/auth.config.js";

const generateJWTToken = async (user_id: string) => {
  const options: SignOptions = { expiresIn: authConfig.expiresIn as any };
  const token = jwt.sign({ user_id }, authConfig.secret, options);
  return token;
};

const generateRefreshJWTToken = async (user_id: string) => {
  const options: SignOptions = {
    expiresIn: authConfig.refresh_expiresIn as any,
  };
  const token = jwt.sign({ user_id }, authConfig.refresh_secret, options);
  return token;
};

export { generateJWTToken, generateRefreshJWTToken };
