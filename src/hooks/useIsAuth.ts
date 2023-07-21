import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { getBaseUrl } from "../pages/_app";

export const useIsAuthCheck = (callbackUrl: string) => {
  const router = useRouter();
  const session = useSession();

  const checkAuth = () => {
    if (session.status !== "authenticated") {
      router.push(
        "/api/auth/signin?error=SessionRequired&callbackUrl=" +
          getBaseUrl() +
          callbackUrl
      );
      return false;
    }
    return true;
  };

  return checkAuth;
};
