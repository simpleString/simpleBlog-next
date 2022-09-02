import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { getBaseUrl } from "../../pages/_app";

export const useIsAuth = (callbackUrl: string): (() => void) => {
  const router = useRouter();
  const session = useSession();

  // "/post/" +
  // post?.id

  const checkAuth = () => {
    if (session.status !== "authenticated") {
      router.push(
        "/api/auth/signin?error=SessionRequired&callbackUrl=" +
          getBaseUrl() +
          callbackUrl
      );
    }
  };

  return checkAuth;
};
