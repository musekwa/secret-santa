import { prisma } from "@/lib/prisma.js";

const generateParticipantCode = async (): Promise<{success: boolean, data: string, message: string}> => {
    let code: string = "";
    let isUnique = false;
    let attempts = 0;
    const maxAttempts = 100;
  
    while (!isUnique && attempts < maxAttempts) {
      // Generate random 8-digit code (10000000 to 99999999)
      code = Math.floor(10000000 + Math.random() * 90000000).toString();
  
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
        message: "Não foi possível gerar um código único de 8 dígitos após várias tentativas. Tente novamente."
        }
    }
    return {
        success: true,
        data: code!,
        message: "Código único de 8 dígitos gerado com sucesso"
    }
  };

  export { generateParticipantCode };