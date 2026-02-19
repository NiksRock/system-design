import { QueryClient } from "@tanstack/react-query";
import { dehydrate } from "@tanstack/react-query";

export async function getDehydratedState(
  prefetch: (queryClient: QueryClient) => Promise<void>,
) {
  const queryClient = new QueryClient();

  await prefetch(queryClient);

  return {
    dehydratedState: dehydrate(queryClient),
  };
}
