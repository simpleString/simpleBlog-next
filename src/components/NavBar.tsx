import { signIn, signOut } from "next-auth/react";
import Image from "next/image";
import NextLink from "next/link";
import { trpc } from "../utils/trpc";

const NavBar: React.FC = () => {
  const me = trpc.useQuery(["user.me"]);

  return (
    <div>
      <nav className="bg-yellow-200 z-50 sticky top-0">
        <div className="md:container mx-auto flex items-center lg:w-2/3 h-16 px-4">
          <NextLink href="/">
            <a className="font-semibold text-lg motion-safe:hover:scale-105 duration-100 text-center mr-2">
              SimpleBlog
            </a>
          </NextLink>
          <NextLink href="/create-post">
            <a className="font-semibold text-lg motion-safe:hover:scale-105 duration-100 text-center mr-2">
              Create post
            </a>
          </NextLink>
          <div className="ml-auto flex">
            {!me.isFetching && me.data?.image ? (
              <Image
                onClick={() => signOut()}
                className="rounded-full cursor-pointer"
                src={me.data.image || "/user-placeholder.jpg"}
                width="48"
                alt="Not image"
                height="48"
              />
            ) : (
              <button
                className="motion-safe:hover:scale-105 duration-100 text-center"
                onClick={() => signIn()}
              >
                Sign in
              </button>
            )}
          </div>
        </div>
      </nav>
    </div>
  );
};

export default NavBar;
