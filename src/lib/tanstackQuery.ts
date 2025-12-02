// src/lib/react-query.ts
import { QueryClient } from "@tanstack/react-query";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1, // retry once if a query fails
      refetchOnWindowFocus: false, // don’t refetch every time user switches tabs
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
    mutations: {
      retry: 0, // don’t retry failed mutations
    },
  },
});

export default queryClient;
