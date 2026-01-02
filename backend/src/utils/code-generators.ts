import { prisma } from "@/lib/prisma.js";

const generateCode = async (digits: number = 8): Promise<{success: boolean, data: string, message: string}> => {
    let code: string = "";
    let isUnique = false;
    let attempts = 0;
    const maxAttempts = 100;
  
    while (!isUnique && attempts < maxAttempts) {
      // Generate random digits code (10000000 to 99999999)
      code = Math.floor(10 ** (digits - 1) + Math.random() * 9 * 10 ** (digits - 1)).toString();
  
      // Check if code already exists in database
      const existing = await prisma.participant.findFirst({
        where: { code },
      });
  
      if (!existing) {
        isUnique = true;
      }
  
      attempts++;
    }
  
    if (!isUnique) {
     return {
        success: false,
        data: "",
        message: `Não foi possível gerar um código único de ${digits} dígitos após várias tentativas. Tente novamente.`
        }
    }
    return {
        success: true,
        data: code!,
        message: `Código único de ${digits} dígitos gerado com sucesso`
    }
  };



  export { generateCode };