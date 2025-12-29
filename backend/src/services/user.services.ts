import { prisma } from "@/lib/prisma.js"

export default class UserServices {


        static async findMany() {
            try {
                const users = await prisma.user.findMany();
                if (!users) {
                    return { success: false, data: [], message: "Nenhum usuário encontrado" };
                }
                return { success: true, data: users, message: "Usuários encontrados com sucesso" };
            } catch (error) {
                return { success: false, data: [], message: `Erro ao buscar os usuários: ${error}` };
            }
    
        }
    
        static async findById(id: string) {
            try {
                const user = await prisma.user.findUnique({
                    where: { id }
                });
                if (!user) {
                    return { success: false, data: [], message: "Usuário não encontrado" };
                }
                return { success: true, data: user, message: "Usuário encontrado com sucesso" };
            } catch (error) {
                return { success: false, data: [], message: `Erro ao buscar o usuário: ${error}` };
            }
        }

        static async update(
            id: string,
            data: { name?: string; password?: string; is_verified?: boolean }
          ) {
            try {
              const user = await prisma.user.update({
                where: { id },
                data: data,
              });
              if (!user) {
                return { success: false, data: null, message: "Usuário não encontrado" };
              }
              return {
                success: true,
                data: user,
                message: "Usuário atualizado com sucesso",
              };
            } catch (error) {
              return {
                success: false,
                data: null,
                message: `Erro ao atualizar o usuário: ${error}`,
              };
            }
          }
        
        static async findByEmail(email: string) {
            try {
                const user = await prisma.user.findUnique({
                    where: { email }
                });
                if (!user) {
                    return { success: false, data: null, message: "Usuário não encontrado" };
                }
                return { success: true, data: user, message: "Usuário encontrado com sucesso" };
            } catch (error) {
                return { success: false, data: null, message: `Erro ao buscar o usuário: ${error}` };
            }
        }
}