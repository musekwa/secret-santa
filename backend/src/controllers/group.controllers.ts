import GroupServices from "@/services/group.services.js";
import { Request, Response } from "express";


export default class GroupControllers {

    // create a group
static createGroup = async (req: Request, res: Response) => {

    try {
        const { name, owner_id } = req.body
        if (!name || !owner_id) {
            res.status(400).json({ 
                message: "Name and owner_id are required", 
                success: false, 
                data: null 
            });
            return ;
        }
        const { success, data, message } = await GroupServices.create(name, owner_id)
        if (!success) {
            res.status(400).json({ message, success, data: null })
            return ;
        }
        res.status(200).json({ message, success, data })
    }
    catch (error) {
        console.error("Error creating group:", error)
        res.status(500).json({ message: `Error creating group: ${error}`, success: false, data: null })
    }
}

// get all groups
static getAllGoups = async (req: Request, res: Response) => {
    try {
      const { success, data, message } = await GroupServices.findMany();
      if (!success) {
        res.status(400).json({ data: [], message: message, success: false });
        return;
      }
      res.status(200).json({ data: data, message: message, success: true });
      return;
    } catch (error) {
      console.error("Error getting all groups:", error);
      res
        .status(500)
        .json({
          data: [],
          message: `Error fetching groups: ${error}`,
          success: false,
        });
      return;
    }
  };

// get a group by id
static getGroupById = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      if (!id) {
        res
          .status(400)
          .json({ data: [], message: "Group id is required", success: false });
        return;
      }
      const { success, data, message } = await GroupServices.findById(id);
      if (!success) {
        res.status(400).json({ data: [], message: message, success: false });
        return;
      }
      res.status(200).json({ data: data, message: message, success: true });
      return;
    } catch (error) {
      console.error("Error getting group by id:", error);
      res
        .status(500)
        .json({
          data: [],
          message: `Error fetching group: ${error}`,
          success: false,
        });
      return;
    }
  }
}