import type { User } from "@/types/auth.types";
import AuthApi from "../api/auth.api";
import { queryOptions, type UseQueryOptions } from "@tanstack/react-query";

// // register query options
// export function registerQueryOptions(
//     params: { name: string, email: string, password: string },
//     options?: Omit<UseQueryOptions<User, Error, User>, "queryKey" | "queryFn">
// ) {
//     return queryOptions({
//         ...options,
//         queryKey: ["user", params],
//         queryFn: async () =>  await AuthApi.register(params.name, params.email, params.password),
//     });
// }

// login query options
// export function loginMutation(
//     params: { email: string, password: string },
//     options?: Omit<UseQueryOptions<User, Error, User>, "queryKey" | "queryFn">
// ) {
//     return queryOptions({
//         ...options,
//         queryKey: ["user", params],
//         queryFn: async () =>  await AuthApi.login(params.email, params.password),
//     });
// }

// find me query options
export function findMeQueryOptions(
    options?: Omit<UseQueryOptions<User, Error, User>, "queryKey" | "queryFn">
) {
    return queryOptions({
        ...options,
        queryKey: ["user"],
        queryFn: async () =>  await AuthApi.findMe(),
    });
}

// // sign out query options
// export function signOutQueryOptions(
//     options?: UseQueryOptions<{ success: boolean; message: string }, Error, { success: boolean; message: string }>
// ) {
//     return queryOptions({
//         ...options,
//         queryKey: ["user"],
//         queryFn: async () =>  await AuthApi.signOut(),
//     });
// }