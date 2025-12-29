import { Request, Response } from "express";
import ParticipantServices from "@/services/participant.services.js";

export default class ParticipantControllers {
// create a participant
static createParticipant = async (req: Request, res: Response)=>{
    try{
     const {group_id, user_id, role, status, gift_value } = req.body
     if (!group_id || !user_id || !gift_value){
         res.status(400).json({
             success: false,
             message: "Group id, user id, and gift value are required",
             data: null
         })
         return ;
     }
 
     const participantObject = {
         user_id,
         group_id,
         gift_value,
         role: role,
         status: status
     }
 
     const {success, message, data} = await ParticipantServices.create(participantObject)
 
     if (!success){
         res.status(400).json({
             success, message, data
         })
         return;
     }
     res.status(200).json({
         success, message, data
     })
     return ;
 
    }catch(error){
      res.status(500).json({
         success: false,
         message: `Error creating a participant ${error}`,
         data: null,
      })
    }
 }

 
// get all participants
static getAllParticipants = async (req: Request, res: Response) => {
    try {
      const { success, data, message } = await ParticipantServices.findMany();
      if (!success) {
        res.status(400).json({ data: [], message: message, success: false });
        return;
      }
      res.status(200).json({ data: data, message: message, success: true });
      return;
    } catch (error) {
      console.error("Error getting all participants:", error);
      res
        .status(500)
        .json({
          data: [],
          message: `Error fetching participants: ${error}`,
          success: false,
        });
      return;
    }
  };

  
// get a participant by id
static getParticipantById = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      if (!id) {
        res
          .status(400)
          .json({
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
      res
        .status(500)
        .json({
          data: [],
          message: `Error fetching participant: ${error}`,
          success: false,
        });
      return;
    }
  };    
  

}