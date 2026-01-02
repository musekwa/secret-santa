import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import authConfig from "@/config/auth.config.js";
import { generateJWTToken, generateRefreshJWTToken } from "@/utils/jwt.js";

const refreshJWTToken = async (req: Request, res: Response, next: NextFunction)=>{

    const { refresh_token } = req.cookies;
    if (!refresh_token) {
        res.status(401).json({ message: "Refresh token não encontrado", success: false, data: null });
        return ;
    }

    const { user_id } = jwt.verify(refresh_token, authConfig.refresh_secret) as { user_id: string };
    if (!user_id) {
        res.status(401).json({ message: "Refresh token inválido", success: false, data: null });
        return ;
    }
    const accessToken = await generateJWTToken(user_id);
    const newRefreshToken = await generateRefreshJWTToken(user_id);

    res.cookie("access_token", accessToken, { 
        httpOnly: true, 
        secure: process.env.NODE_ENV === "production", 
        maxAge: 1000 * 60 * 15, // 15 minutes
        sameSite: "strict",
     })
     res.cookie("refresh_token", newRefreshToken, { 
        httpOnly: true, 
        secure: process.env.NODE_ENV === "production", 
        maxAge: 1000 * 60 * 60 * 24, // 1 day
        sameSite: "strict",
     })
    //  Go to the next request handler
    next();
}
export default refreshJWTToken;