import { queryOptions, type UseQueryOptions } from "@tanstack/react-query";
import GroupApi from "../api/group.api";

export function findManyGroupsQueryOptions(
    options?: Omit<UseQueryOptions<any[], Error, any[]>, "queryKey" | "queryFn">
) {
    return queryOptions({
        ...options,
        queryKey: ["groups"],
        queryFn: async () => await GroupApi.findMany(),
    });
}

export function findByIdGroupQueryOptions(id: string) {
    return queryOptions({
        queryKey: ["group", id],
        queryFn: async () => await GroupApi.findById(id),
    });
}