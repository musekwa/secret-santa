import AuthServices from "@/services/auth.services.js";
import UserServices from "@/services/user.services.js";
import { comparePassword, hashPassword } from "@/utils/hashes.js";
import { generateJWTToken, generateRefreshJWTToken } from "@/utils/jwt.js";
import {Request, Response } from "express"


export default class AuthControllers {

    static login = async (req: Request, res: Response) => {
        try {
            const { email, password } = req.body
            if (!email || !password) {
                res.status(400).json({ message: "Email and password are required", success: false, data: null })
                return ;
            }

            // TODO:
            // 1. Check if the user exists
            const { success, data, message } = await UserServices.findByEmail(email);
            if (!success) {
                res.status(400).json({ message, success, data: null })
                return ;
            }
            if (!data) {
                res.status(400).json({ message: "Usuário não encontrado", success, data: null })
                return ;
            }

            // 2. Check if the password is correct
            const isPasswordCorrect = await comparePassword(password, data.password);
            if (!isPasswordCorrect) {
                res.status(400).json({ message: "Senha inválida", success, data: null })
                return ;
            }

            // 3. Generate access token
            const accessToken = await generateJWTToken(data.id);

            // 4. Generate refresh token
            const refreshToken = await generateRefreshJWTToken(data.id);

            // 5. Update the refresh token
            const { success: updateSuccess, data: updateData, message: updateMessage } = await AuthServices.updateByEmail(email, { refresh_token: refreshToken });
            if (!updateSuccess) {
                res.status(400).json({ updateMessage, updateSuccess, updateData: null })
                return ;
            }

            // 6. Add Cookie (tokens)

            res.cookie("accessToken", accessToken, { 
                httpOnly: true, 
                secure: process.env.NODE_ENV === "production", 
                maxAge: 1000 * 60 * 15, // 15 minutes
                sameSite: "strict",
             })

            res.cookie("refreshToken", refreshToken, { 
                httpOnly: true, 
                secure: process.env.NODE_ENV === "production", 
                maxAge: 1000 * 60 * 60 * 24, // 1 day
                sameSite: "strict",
             })

            // 6. Return the tokens
            res.status(200).json({ message, success, data: { accessToken, refreshToken } })
        }
        catch (error) {
            console.error("Erro ao fazer login:", error)
            res.status(500).json({ message: `Erro ao fazer login: ${error}`, success: false, data: null })
            return ;
        }
    }

    static register = async (req: Request, res: Response) => {
        try {
            const { name, email, password } = req.body
            if (!name || !email || !password) {
                res.status(400).json({ message: "Name, email and password are required", success: false, data: null })
                return ;
            }
            // check if user already exists
            const { success: checkSuccess, data: checkData, message: checkMessage } = await UserServices.findByEmail(email);
            if (checkSuccess) {
                res.status(400).json({ message: "Usuário já existe", success: false, data: null })
                return ;
            }
    
            // hash the password
            const hashedPassword = await hashPassword(password);
    
            const { success, data, message } = await AuthServices.register(name, email, hashedPassword)
            if (!success) {
                res.status(400).json({ message, success, data: null })
                return ;
            }

                // 3. Generate access token
                const accessToken = await generateJWTToken(data!.id);

                // 4. Generate refresh token
                const refreshToken = await generateRefreshJWTToken(data!.id!);

                // 5. Update the refresh token
                const { success: updateSuccess, data: updateData, message: updateMessage } = await AuthServices.updateByEmail(email, { refresh_token: refreshToken });

                if (!updateSuccess) {
                    res.status(400).json({ updateMessage, updateSuccess, updateData: null })
                    return ;
                }

                // return tokens
                res.cookie("accessToken", accessToken, { 
                    httpOnly: true, 
                    secure: process.env.NODE_ENV === "production", 
                    maxAge: 1000 * 60 * 15, // 15 minutes
                    sameSite: "strict",
                 })
                 res.cookie("refreshToken", refreshToken, { 
                    httpOnly: true, 
                    secure: process.env.NODE_ENV === "production", 
                    maxAge: 1000 * 60 * 60 * 24, // 1 day
                    sameSite: "strict",
                 })
                 res.status(200).json({ message, success, data: { accessToken, refreshToken } })
                 return ;
        }
        catch (error) {
            console.error("Erro ao criar usuário:", error)
            res.status(500).json({ message: `Erro ao criar usuário: ${error}`, success: false, data: null })
            return ;
        }
    }

}