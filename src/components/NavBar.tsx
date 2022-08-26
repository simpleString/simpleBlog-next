import { signOut } from "next-auth/react";
import Image from "next/image";
import NextLink from "next/link";
import { trpc } from "../utils/trpc";

export const NavBar: React.FC = () => {
  const me = trpc.useQuery(["user.me"]);

  return (
    <nav className="bg-yellow-200 z-50 sticky top-0">
      <div className="md:container mx-auto flex items-center lg:w-2/3 h-16">
        <NextLink href="/">
          <a className="font-semibold text-lg motion-safe:hover:scale-105 duration-100 text-center">
            SimpleBlog
          </a>
        </NextLink>
        <div className="mx-auto">
          <NextLink href="/create-post">
            <a>Create post</a>
          </NextLink>
        </div>
        <div className="ml-auto flex">
          {me.data && typeof me.data !== "undefined" ? (
            <Image
              onClick={() => signOut()}
              className="rounded-full cursor-pointer"
              src={me.data.image || "/user-placeholder.jpg"}
              width="48"
              alt="Not image"
              height="48"
            />
          ) : (
            <NextLink
              className="motion-safe:hover:scale-105 duration-100 text-center"
              href="/login"
            >
              <a>SignUp</a>
            </NextLink>
          )}
        </div>
      </div>
    </nav>
  );
};
