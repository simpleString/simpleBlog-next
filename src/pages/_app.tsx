// src/pages/_app.tsx
import { withTRPC } from "@trpc/next";
import { SessionProvider } from "next-auth/react";
import type { AppType } from "next/dist/shared/lib/utils";
import superjson from "superjson";
import { Layout } from "../components/Layout";
import type { AppRouter } from "../server/router";
import "../styles/globals.css";

const MyApp: AppType = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  return (
    <SessionProvider session={session}>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </SessionProvider>
  );
};

export const getBaseUrl = () => {
  if (typeof window !== "undefined") return ""; // browser should use relative url
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`; // SSR should use vercel url
  return `http://localhost:${process.env.PORT ?? 3000}`; // dev SSR should use localhost
};

export default withTRPC<AppRouter>({
  config({}) {
    /**
     * If you want to use SSR, you need to use the server's full URL
     * @link https://trpc.io/docs/ssr
     */
    const url = `${getBaseUrl()}/api/trpc`;

    return {
      url,
      transformer: superjson,
      headers: {
        "x-ssr": "1",
      },
      /**
       * @link https://react-query.tanstack.com/reference/QueryClient
       */

      queryClientConfig: {
        defaultOptions: {
          queries: { staleTime: 1000 * 60 * 10, refetchOnWindowFocus: false },
        },
      },
    };
  },
  /**
   * @link https://trpc.io/docs/ssr
   */
  ssr: true,
})(MyApp);
