import { withTRPC } from "@trpc/next";
import { SessionProvider } from "next-auth/react";
import "react-toastify/dist/ReactToastify.css";
import "remixicon/fonts/remixicon.css";
import superjson from "superjson";
import type { AppRouter } from "../server/router";
import "../styles/globals.css";

import type { NextPage } from "next";
import type { AppProps } from "next/app";
import { useEffect, type ReactElement, type ReactNode } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { usePreserveScroll } from "../hooks/usePreserveScroll";

import { TRPCClientError } from "@trpc/client";
import Modal from "react-modal";
import { toast } from "react-toastify";
import ServerErrorPage from "./500";
import { useThemeStore } from "../store";

export type NextPageWithLayout<P = Record<string, void>, IP = P> = NextPage<
  P,
  IP
> & {
  getLayout?: (page: ReactElement) => ReactNode;
};

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};

Modal.setAppElement("#__next");

const MyApp = ({
  Component,
  pageProps: { session, ...pageProps },
}: AppPropsWithLayout) => {
  const getLayout = Component.getLayout ?? ((page) => page);

  usePreserveScroll();

  const colorTheme = useThemeStore((store) => store.theme);

  useEffect(() => {
    const body = document.body;
    body.setAttribute("data-theme", colorTheme);
  }, [colorTheme]);

  return (
    <SessionProvider session={session}>
      <ErrorBoundary fallback={<ServerErrorPage />}>
        {getLayout(<Component {...pageProps} />)}
      </ErrorBoundary>
    </SessionProvider>
  );
};

export const getBaseUrl = () => {
  if (typeof window !== "undefined") return ""; // browser should use relative url
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`; // SSR should use vercel url
  return `http://localhost:${process.env.PORT ?? 3000}`; // dev SSR should use localhost
};

export default withTRPC<AppRouter>({
  config() {
    /**
     * If you want to use SSR, you need to use the server's full URL
     * @link https://trpc.io/docs/ssr
     */
    const url = `${getBaseUrl()}/api/trpc`;

    return {
      url,
      transformer: superjson,
      headers: {
        // "x-ssr": "1",
      },
      /**
       * @link https://react-query.tanstack.com/reference/QueryClient
       */

      queryClientConfig: {
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 3,
            refetchOnWindowFocus: false,
            useErrorBoundary(error) {
              if (error instanceof TRPCClientError) {
                if (error.data.httpStatus >= 500) return true;
                return false;
              }
              return true;
            },
            onError(error) {
              if (error instanceof TRPCClientError) {
                if (error.data.code === "NOT_FOUND") {
                  return (document.location = "/404");
                } else {
                  toast.error("Something went wrong");
                }
              }
            },
          },
          mutations: {
            useErrorBoundary(error) {
              if (error instanceof TRPCClientError) {
                if (error.data.httpStatus >= 500) return true;
                return false;
              }
              return true;
            },
            onError(error) {
              if (error instanceof TRPCClientError) {
                if (error.data.code === "NOT_FOUND") {
                  document.location = "/404";
                } else {
                  toast.error("Something went wrong");
                }
              }
            },
          },
        },
      },
    };
  },
  /**
   * @link https://trpc.io/docs/ssr
   */
  ssr: false,
})(MyApp);
