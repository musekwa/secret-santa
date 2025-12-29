import { Request, Response } from "express";
import { hashPassword } from "@/utils/hashes.js";
import UserServices from "@/services/user.services.js";

export default class UserControllers {
// get all users
static getAllUsers = async (req: Request, res: Response) => {
    try {
      const { success, data, message } = await UserServices.findMany();
      if (!success) {
        res.status(400).json({ data: [], message: message, success: false });
        return;
      }
      res.status(200).json({ data: data, message: message, success: true });
      return;
    } catch (error) {
      console.error("Error getting all users:", error);
      res
        .status(500)
        .json({
          data: [],
          message: `Error fetching users: ${error}`,
          success: false,
        });
      return;
    }
  };

  // get a user by id
static getUserById = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      if (!id) {
        res
          .status(400)
          .json({ data: [], message: "User id is required", success: false });
        return;
      }
      const { success, data, message } = await UserServices.findById(id);
      if (!success) {
        res.status(400).json({ data: [], message: message, success: false });
        return;
      }
      res.status(200).json({ data: data, message: message, success: true });
      return;
    } catch (error) {
      console.error("Error getting user by id:", error);
      res
        .status(500)
        .json({
          data: [],
          message: `Error fetching user: ${error}`,
          success: false,
        });
      return;
    }
  };

  
// update user
static updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, password, is_verified } = req.body;
    if (!id) {
        res.status(400).json({ message: "User id is required", success: false, data: null });
        return;
    }
    if (!name && !is_verified && !password) {
        res.status(400).json({ message: "Either name, is_verified or password are required", success: false, data: null });
        return;
    }
    const { success, data, message } = await UserServices.update(id, { name, is_verified, password });
    if (!success) {
        res.status(400).json({ message, success, data: null });
        return;
    }
    res.status(200).json({ message, success, data });
    return;
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ message: `Error updating user: ${error}`, success: false, data: null });
      return;
    }
}
  
}