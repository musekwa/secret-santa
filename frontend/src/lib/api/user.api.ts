import api, { apiRoutes } from ".";
import AuthApi from "./auth.api";

export default class UserApi {
  // find by id
  static findById = async (id: string) => {
    const response = await api.get<{
      success: boolean;
      data: any;
      message: string;
    }>(`${apiRoutes.users.findById.replace(":id", id)}`);
    if (response.data.success) {
      return response.data.data;
    }
    return { success: false, data: null, message: response.data.message };
  };

  // find many users
  static findMany = async () => {
    const response = await api.get<{
      success: boolean;
      data: any[];
      message: string;
    }>(apiRoutes.users.findMany);
    if (response.data.success) {
      return response.data.data;
    }
    return { success: false, data: [], message: response.data.message };
  };

  // find user by email (searches through all users)
  static findByEmail = async (email: string) => {
    const users = await this.findMany();
    if (!Array.isArray(users)) {
      return null;
    }
    return (
      users.find((u: any) => u.email?.toLowerCase() === email.toLowerCase()) ||
      null
    );
  };

  // // create user with auto-generated password
  // static create = async (name: string, email: string) => {
  //   // Generate a random secure password
  //   const autoPassword = this.generateRandomPassword();

  //   // AuthApi.register returns user data on success or error object on failure
  //   if (result && typeof result === "object" && "success" in result) {
  //     if (!result.success) {
  //       return {
  //         success: false,
  //         data: null,
  //         message: result.message || "Erro ao criar usuário",
  //       };
  //     }
  //   }

  //   // If successful, result is the user data
  //   return {
  //     success: true,
  //     data: result,
  //     message: "Usuário criado com sucesso",
  //   };
  // };

  // // Generate a random secure password
  // private static generateRandomPassword = (): string => {
  //   const length = 8;
  //   const charset =
  //     "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
  //   let password = "";
  //   for (let i = 0; i < length; i++) {
  //     password += charset.charAt(Math.floor(Math.random() * charset.length));
  //   }
  //   return password;
  // };
}
