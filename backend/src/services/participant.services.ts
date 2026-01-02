import { prisma } from "@/lib/prisma.js";
import { generateCode } from "@/utils/code-generators.js";
import { Role, Status } from "generated/prisma/enums.js";
type Participant = {
  user_id: string;
  group_id: string;
  gift_value: number;
  role?: Role;
  status?: Status;
};

export default class ParticipantServices {
  // new participant
  static async create({
    user_id,
    group_id,
    gift_value,
    role,
    status,
  }: Participant) {
    try {
      // check if the user is already a participant of the group
      const existingParticipant = await prisma.participant.findFirst({
        where: { user_id, group_id },
      });
      if (existingParticipant) {
        return {
          success: false,
          data: null,
          message: "Usuário já é um participante do grupo",
        };
      }

      const newRole = role ?? Role.USER;
      const newStatus = status ?? Status.PENDING;

      // generate a unique code for the group owner as the first participant
      const { success, data: code, message } = await generateCode();
      if (!success) {
        return {
          success: false,
          data: null,
          message: message,
        };
      }

      // add owner as the first participant
      const participantObject = {
        user_id,
        group_id,
        gift_value,
        role: newRole,
        status: newStatus,
        code: code,
      };
      const participant = await prisma.participant.create({
        data: {
          ...participantObject,
        },
      });
      if (!participant) {
        return {
          success: false,
          data: null,
          message:
            "Não foi possível adicionar o dono como o primeiro participante",
        };
      }

      return {
        success: true,
        data: participant,
        message: "Participante criado com sucesso",
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: `Erro ao criar o participante: ${error}`,
      };
    }
  }

  static async findMany(id?: string) {
    try {
      const participants = await prisma.participant.findMany({
        where: id
          ? {
              group_id: id,
            }
          : {},
        select: {
          user_id: true,
          gift_value: true,
          role: true,
          status: true,
          code: true,
          ...(id
            ? {}
            : {
                group: {
                  select: {
                    name: true,
                    id: true,
                  },
                },
              }),
        },
      });
      if (!participants) {
        return {
          success: false,
          data: [],
          message: "Nenhum participante encontrado",
        };
      }
      return {
        success: true,
        data: participants,
        message: "Participantes encontrados com sucesso",
      };
    } catch (error) {
      return {
        success: false,
        data: [],
        message: `Erro ao buscar os participantes: ${error}`,
      };
    }
  }

  static async findById(id: string) {
    try {
      const participant = await prisma.participant.findUnique({
        where: { id },
        select: {
          code: true,
          gift_value: true,
          role: true,
          status: true,
          user_id: true,
          group: {
            select: {
              name: true,
              id: true,
              owner_id: true,
            },
          },
        }
      });
      if (!participant) {
        return {
          success: false,
          data: [],
          message: "Participante não encontrado",
        };
      }
      return {
        success: true,
        data: participant,
        message: "Participante encontrado com sucesso",
      };
    } catch (error) {
      return {
        success: false,
        data: [],
        message: `Erro ao buscar o participante: ${error}`,
      };
    }
  }

  static async update(
    id: string,
    data: {
      user_id?: string;
      group_id?: string;
      gift_value?: number;
      role?: Role;
      status?: Status;
    }
  ) {
    try {
      const participant = await prisma.participant.update({
        where: { id },
        data: data,
      });
      if (!participant) {
        return {
          success: false,
          data: null,
          message: "Participante não encontrado",
        };
      }
      return {
        success: true,
        data: participant,
        message: "Participante atualizado com sucesso",
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: `Erro ao atualizar o participante: ${error}`,
      };
    }
  }

  // update participant by group_id and user_id
  static async updateByGroupIdAndUserId(
    group_id: string,
    user_id: string,
    data: {
      gift_value?: number;
      role?: Role;
      status?: Status;
    }
  ) {
    try {
      const participant = await prisma.participant.findFirst({
        where: { group_id, user_id },
      });
      if (!participant) {
        return {
          success: false,
          data: null,
          message: "Participante não encontrado",
        };
      }
      const updatedParticipant = await prisma.participant.update({
        where: { id: participant.id },
        data: data,
      });
      if (!updatedParticipant) {
        return {
          success: false,
          data: null,
          message: "Não foi possível atualizar o participante",
        };
      }
      return {
        success: true,
        data: updatedParticipant,
        message: "Participante atualizado com sucesso",
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: `Erro ao atualizar o participante: ${error}`,
      };
    }
  }
}
