import { queryOptions } from "@tanstack/react-query";
import axios from "axios";


// Query options for the user query
// This query is used to get the user data from the API
export const userQueryOptions = () =>
  queryOptions({
    queryKey: ["user"],
    queryFn: async () => {
      
      const stored = localStorage.getItem("secret_santa_participant");
      if (stored) {
        const participant = JSON.parse(stored);
        return participant;
      }
      return null;
    },
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
    gcTime: 0, // Immediately garbage collect
    enabled: !!localStorage.getItem("secret_santa_participant"), // Only fetch if the user is authenticated
    retryDelay: 1000,
  });
