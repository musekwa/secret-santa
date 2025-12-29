import { prisma } from "@/lib/prisma.js"

export default class AuthServices {

    static updateByEmail = async (email: string, data: Record<string, any>) => {
        try {
            const user = await prisma.user.update({
                where: { email },
                data: data
            })
            if (!user) {
                return { success: false, data: null, message: "Usuário não encontrado" };
            }
            return { success: true, data: user, message: "Usuário atualizado com sucesso" };
        }
        catch (error) {
            return { success: false, data: null, message: `Erro ao atualizar o usuário: ${error}` };
        }
    }

            // new user
            static async register (name: string, email: string, password: string) {
                try {
                    const user = await prisma.user.create({
                        data: {
                            name,
                            email,
                            password
                        }
                    })
                    return {
                        success: true,
                        data: user,
                        message: "Usuário criado com sucesso"
                    }
                } catch (error) {
                    return {
                        success: false,
                        data: null,
                        message: `Erro ao criar o usuário: ${error}`
                    }
                }
            }

}