import authConfig from "@/config/auth.config.js";
import AuthServices from "@/services/auth.services.js";
import UserServices from "@/services/user.services.js";
import { comparePassword, hashPassword } from "@/utils/hashes.js";
import { generateJWTToken, generateRefreshJWTToken } from "@/utils/jwt.js";
import {Request, Response } from "express"
import jwt from "jsonwebtoken";


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
            const { success: updatedSuccess, data: updatedData, message: updatedMessage } = await AuthServices.updateByEmail(email, { refresh_token: refreshToken });
            if (!updatedSuccess) {
                res.status(400).json({ updatedMessage, updatedSuccess, updatedData: null })
                return ;
            }

            // 6. Add Cookie (tokens)

            res.cookie("access_token", accessToken, { 
                httpOnly: true, 
                secure: process.env.NODE_ENV === "production", 
                maxAge: 1000 * 60 * 15, // 15 minutes
                sameSite: "strict",
             })

            res.cookie("refresh_token", refreshToken, { 
                httpOnly: true, 
                secure: process.env.NODE_ENV === "production", 
                maxAge: 1000 * 60 * 60 * 24, // 1 day
                sameSite: "strict",
             })

            // 6. Return the tokens
            res.status(200).json({ message, success, data: updatedData })
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
                res.cookie("access_token", accessToken, { 
                    httpOnly: true, 
                    secure: process.env.NODE_ENV === "production", 
                    maxAge: 1000 * 60 * 15, // 15 minutes
                    sameSite: "strict",
                 })
                 res.cookie("refresh_token", refreshToken, { 
                    httpOnly: true, 
                    secure: process.env.NODE_ENV === "production", 
                    maxAge: 1000 * 60 * 60 * 24, // 1 day
                    sameSite: "strict",
                 })
                 res.status(200).json({ message, success, data: { access_token: accessToken, refresh_token: refreshToken } })
                 return ;
        }
        catch (error) {
            console.error("Erro ao criar usuário:", error)
            res.status(500).json({ message: `Erro ao criar usuário: ${error}`, success: false, data: null })
            return ;
        }
    }

    static signOut = async (req: Request, res: Response) => {
        try {
            const { user_id } = jwt.verify(req.cookies.refresh_token, authConfig.refresh_secret) as { user_id: string };
            if (!user_id) {
                res.status(400).json({ message: "ID do usuário é obrigatório", success: false, data: null })
                return ;
            }
            const { success, message } = await AuthServices.updateById(user_id, { refresh_token: null });
            if (!success) {
                res.status(400).json({ message, success, data: null })
                return ;
            }
            res.clearCookie("access_token");
            res.clearCookie("refresh_token");
            res.status(200).json({ message: "Logout realizado com sucesso", success: true, data: null })
            return ;
        } catch (error) {
            console.error("Erro ao fazer logout:", error)
            res.status(500).json({ message: `Erro ao fazer logout: ${error}`, success: false, data: null })
            return ;
        }
    }

    // find me
static findMe = async (req: Request, res: Response) => {
    try {
      const access_token = req.cookies.access_token;
      if (!access_token) {
        res.status(400).json({ data: [], message: "Access token is required", success: false });
        return;
      }
      const { user_id } = jwt.verify(access_token, authConfig.secret) as { user_id: string };
      if (!user_id) {
        res.status(400).json({ data: [], message: "Invalid access token", success: false });
        return;
      }
      const { success, data, message } = await UserServices.findById(user_id);
      if (!success) {
        res.status(400).json({ data: null, message: message, success: false });
        return;
      }
      res.status(200).json({ data: data, message: message, success: true });
      return;
    } catch (error) {
      console.error("Error getting user by id:", error);
      res.status(500).json({ message: `Error fetching user: ${error}`, success: false, data: null });
      return;
    }
  }

}