import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import authConfig from "@/config/auth.config.js";
import { generateJWTToken, generateRefreshJWTToken } from "@/utils/jwt.js";

const refreshJWTToken = async (req: Request, res: Response, next: NextFunction)=>{

    const { refreshToken } = req.cookies;
    if (!refreshToken) {
        res.status(401).json({ message: "Refresh token não encontrado", success: false, data: null });
        return ;
    }

    const { user_id } = jwt.verify(refreshToken, authConfig.refresh_secret) as { user_id: string };
    if (!user_id) {
        res.status(401).json({ message: "Refresh token inválido", success: false, data: null });
        return ;
    }
    const accessToken = await generateJWTToken(user_id);
    const newRefreshToken = await generateRefreshJWTToken(user_id);

    res.cookie("accessToken", accessToken, { 
        httpOnly: true, 
        secure: process.env.NODE_ENV === "production", 
        maxAge: 1000 * 60 * 15, // 15 minutes
        sameSite: "strict",
     })
     res.cookie("refreshToken", newRefreshToken, { 
        httpOnly: true, 
        secure: process.env.NODE_ENV === "production", 
        maxAge: 1000 * 60 * 60 * 24, // 1 day
        sameSite: "strict",
     })
     res.status(200).json({ message: "Refresh token atualizado com sucesso", success: true, data: { accessToken, refreshToken: newRefreshToken } });

    //  Go to the next request handler
    return next();
}
export default refreshJWTToken;