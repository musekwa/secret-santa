import { Request, Response } from "express";
import ParticipantServices from "@/services/participant.services.js";
import UserServices from "@/services/user.services.js";
import { Role, Status } from "generated/prisma/client.js";

export default class ParticipantControllers {
  // create a participant
  static create = async (req: Request, res: Response) => {
    try {
      const { group_id, email, name } = req.body;
      if (!group_id || !email || !name) {
        res.status(400).json({
          success: false,
          message: "Group id, email and name are required",
          data: null,
        });
        return;
      }

      let user_id: string | undefined;
      let role: Role = Role.USER;
      let status: Status = Status.PENDING;

      //  first find the user by email
      const {
        success: userSuccess,
        data: user,
        message: userMessage,
      } = await UserServices.findByEmail(email);
      if (userSuccess && user) {
        user_id = user?.id;
      } else {
        const {
          success: userSuccess,
          data: user,
          message: userMessage,
        } = await UserServices.create(name, email);
        if (userSuccess && user) {
          user_id = user.id;
        }
      }

      if (user_id) {
        const participantObject = {
          user_id,
          group_id,
          gift_value: 0,
          role: role,
          status: status,
        };
        const {
          success: participantSuccess,
          data: participant,
          message: participantMessage,
        } = await ParticipantServices.create(participantObject);
        if (participantSuccess) {
          res.status(200).json({
            success: true,
            message: participantMessage,
            data: participant,
          });
          return;
        } else {
          res.status(400).json({
            success: false,
            message: participantMessage,
            data: null,
          });
          return;
        }
      } else {
        res.status(400).json({
          success: false,
          message: "Usuário não encontrado ou não foi possível criar",
          data: null,
        });
        return;
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: `Error creating a participant ${error}`,
        data: null,
      });
    }
  };

  // get all participants
  static findMany = async (req: Request, res: Response) => {
    const { group_id } = req.query;
    try {
      const { success, data, message } = await ParticipantServices.findMany(
        group_id as string
      );
      if (!success) {
        res.status(400).json({ data: [], message: message, success: false });
        return;
      }
      res.status(200).json({ data: data, message: message, success: true });
      return;
    } catch (error) {
      console.error("Error getting all participants:", error);
      res.status(500).json({
        data: [],
        message: `Error fetching participants: ${error}`,
        success: false,
      });
      return;
    }
  };

  // get a participant by id
  static findById = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      if (!id) {
        res.status(400).json({
          data: [],
          message: "Participant id is required",
          success: false,
        });
        return;
      }
      const { success, data, message } = await ParticipantServices.findById(id);
      if (!success) {
        res.status(400).json({ data: [], message: message, success: false });
        return;
      }
      res.status(200).json({ data: data, message: message, success: true });
    } catch (error) {
      console.error("Error getting participant by id:", error);
      res.status(500).json({
        data: [],
        message: `Error fetching participant: ${error}`,
        success: false,
      });
      return;
    }
  };
}
