import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    let errorMessage = res.statusText;
    try {
      const errorData = await res.json();
      errorMessage = errorData.message || errorData.error || res.statusText;
    } catch {
      // If JSON parsing fails, try text
      try {
        errorMessage = await res.text() || res.statusText;
      } catch {
        errorMessage = res.statusText;
      }
    }
    throw new Error(errorMessage);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const res = await fetch(url, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const res = await fetch(queryKey.join("/") as string, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: 30 * 1000, // Only 30 seconds cache - much faster updates
      gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes only
      retry: 2, // Reduced retries for faster failure
      retryDelay: attemptIndex => Math.min(500 * 2 ** attemptIndex, 3000), // Faster retries
    },
    mutations: {
      retry: 1, // Minimal retries for mutations
    },
  },
});

// Removed aggressive prefetching - keep it simple
export const prefetchLandingPageData = async () => {
  // Minimal prefetching - only most critical data
  try {
    await queryClient.prefetchQuery({
      queryKey: ["/api/stats"],
      staleTime: 60 * 1000, // 1 minute only
    });
  } catch (error) {
    console.warn('Failed to prefetch stats:', error);
  }
};
