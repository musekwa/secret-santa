// import { queryOptions } from "@tanstack/react-query";
// import axios from "axios";
// import { getCookie } from "../cookies";

// // Query options for the user query
// // This query is used to get the user data from the API
// export const userQueryOptions = () =>
//   queryOptions({
//     queryKey: ["user"],
//     queryFn: async () => {
//      const response = await axios.get(`http://localhost:3000/users/me`, {
//       headers: {
//         "Content-Type": "application/json",
//         "Cookie": `access_token=${getCookie("access_token")}`,
//       },
//     })
//     console.log("user data", response.data)
//     return response.data
//     },
//     // staleTime: 1000 * 60 * 60 * 24, // 24 hours
//     staleTime: 0,
//     gcTime: 0, // Immediately garbage collect
//     enabled: !!getCookie("access_token"), // Only fetch if the user is authenticated
//     retryDelay: 1000,
//   });

import api, { apiRoutes } from ".";

export default class AuthApi {
  // sign out
  static signOut = async () => {
    const response = await api.post(apiRoutes.auth.signOut);
    if (response.data.success) {
      return { success: true, message: response.data.message };
    }
    return { success: false, data: null, message: response.data.message };
  };

  // find me
  static findMe = async () => {
    console.log("calling findMe");
    const response = await api.get(apiRoutes.auth.me);
    if (response.data.success) {
      return response.data.data;
    }
    return { success: false, data: null, message: response.data.message };
  };

  // login
  static login = async (email: string, password: string) => {
    const response = await api.post(apiRoutes.auth.login, {
      email,
      password,
    });
    if (response.data.success) {
      return response.data.data;
    }
    return { success: false, data: null, message: response.data.message };
  };

  // register
  static register = async (name: string, email: string, password: string) => {
    const response = await api.post(apiRoutes.auth.register, {
      name,
      email,
      password,
    });
    if (response.data.success) {
      return response.data.data;
    }
    return { success: false, data: null, message: response.data.message };
  };
}
