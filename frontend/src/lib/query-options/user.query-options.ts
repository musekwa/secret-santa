import { queryOptions, type UseQueryOptions } from "@tanstack/react-query";
import UserApi from "../api/user.api";

export function findByIdUserQueryOptions(id: string, options?: Omit<UseQueryOptions<any, Error, any>, "queryKey" | "queryFn">) {
    return queryOptions({
        ...options,
        queryKey: ["user", id],
        queryFn: async () => await UserApi.findById(id),
    });
}