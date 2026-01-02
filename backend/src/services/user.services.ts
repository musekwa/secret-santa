import { prisma } from "@/lib/prisma.js"
import { generateCode } from "@/utils/code-generators.js";

export default class UserServices {

        static async create(name: string, email: string) {
            try {
                const {data: password} = await generateCode(6);
                const user = await prisma.user.create({
                    data: { name, email, password },
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        is_verified: true,
                        created_at: true,
                        updated_at: true,
                    },
                });
                if (!user) {
                    return { success: false, data: null, message: "Não foi possível criar o usuário" };
                }
                return { success: true, data: user, message: "Usuário criado com sucesso" };
            } catch (error) {
                return { success: false, data: null, message: `Erro ao criar o usuário: ${error}` };
            }
        }

        static async findMany() {
            try {
                const users = await prisma.user.findMany({
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        is_verified: true
                    },
                    orderBy: {
                        created_at: "desc",
                    }
                });
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
                    where: { id },
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        is_verified: true,
                        created_at: true,
                        updated_at: true,
                    },
                });
                if (!user) {
                    return { success: false, data: null, message: "Usuário não encontrado" };
                }
                return { success: true, data: user, message: "Usuário encontrado com sucesso" };
            } catch (error) {
                return { success: false, data: null, message: `Erro ao buscar o usuário: ${error}` };
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
                select: {
                    id: true,
                    name: true,
                    email: true,
                    is_verified: true,
                    updated_at: true,
                },
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
                    where: { email },
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        password: true,
                    },
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