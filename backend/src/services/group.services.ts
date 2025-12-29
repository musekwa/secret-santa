import { prisma } from "@/lib/prisma.js"
import { Role, Status } from "generated/prisma/enums.js"
import ParticipantServices from "./participant.services.js"

export default class GroupServices {

        // new group and add owner as the first participant
        static async create (name: string, owner_id: string){
            try {
            const group = await prisma.group.create({
                data: {
                    name,
                    owner_id
                }
            })
            if (!group) {
                return {
                    success: false,
                    data: null,
                    message: "Não foi possível criar o grupo"
                }
            }

            // add owner as the first participant
            const {success: successParticipant, data: participant, message: messageParticipant} = await ParticipantServices.create({
              user_id: owner_id,
              group_id: group.id,
              gift_value: 0,
              role: Role.ADMIN,
              status: Status.ACCEPTED
            })

            if (!successParticipant) {
                return {
                    success: false,
                    data: null,
                    message: messageParticipant
                }
            }

            const messageGroup = "Grupo criado com sucesso e o dono foi adicionado como o primeiro participante"
            
            return {
                success: true,
                data: {group, owner: participant},
                message: messageGroup
            }
            } catch (error) {
                return {
                    success: false,
                    data: null,
                    message: `Erro ao criar o grupo: ${error}`
                }
            }
        }

        static async findMany() {
            try {
                const groups = await prisma.group.findMany();
                if (!groups) {
                    return { success: false, data: [], message: "Nenhum grupo encontrado" };
                }
                return { success: true, data: groups, message: "Grupos encontrados com sucesso" };
            } catch (error) {
                return { success: false, data: [], message: `Erro ao buscar os grupos: ${error}` };
            }
        }
    
        static async findById(id: string) {
            try {
                const group = await prisma.group.findUnique({
                    where: { id }
                });
                if (!group) {
                    return { success: false, data: [], message: "Grupo não encontrado" };
                }
                return { success: true, data: group, message: "Grupo encontrado com sucesso" };
            } catch (error) {
                return { success: false, data: [], message: `Erro ao buscar o grupo: ${error}` };
            }
        }

        static async update(id: string, data: { name?: string; owner_id?: string }) {
            try {
              const group = await prisma.group.update({
                where: { id },
                data: data,
              });
              if (!group) {
                return { success: false, data: null, message: "Grupo não encontrado" };
              }
              // update owner_id if it is provided
              if (data.owner_id && data.owner_id !== group.owner_id) {
                const previousOwner = await prisma.participant.findFirst({
                  where: { group_id: group.id, user_id: group.owner_id, role: Role.ADMIN },
                });
                if (previousOwner) {
                  await prisma.participant.update({
                    where: { id: previousOwner.id },
                    data: { role: Role.USER },
                  });
                }
        
                // update new owner
                const newOwner = await prisma.participant.findFirst({
                  where: { group_id: group.id, user_id: data.owner_id},
                });
                if (newOwner) {
                  await prisma.participant.update({
                    where: { id: newOwner.id },
                    data: { role: Role.ADMIN },
                  });
                }
        
              }
              return {
                success: true,
                data: group,
                message: "Grupo atualizado com sucesso",
              };
            } catch (error) {
              return {
                success: false,
                data: null,
                message: `Erro ao atualizar o grupo: ${error}`,
              };
            }
          }
    
}