import { signIn, signOut } from "next-auth/react";
import Image from "next/image";
import NextLink from "next/link";
import { useEffect, useRef, useState } from "react";
import { useScrollState } from "../store";
import { trpc } from "../utils/trpc";

const NavBar: React.FC = () => {
  const me = trpc.useQuery(["user.me"]);
  const resetScroll = useScrollState((state) => state.reset);
  const [themeMenuOpened, setThemeMenuOpened] = useState(false);
  const themeMenu = useRef<HTMLDivElement>(null);
  const themeMenuButton = useRef(null);

  useEffect(() => {
    if (!themeMenuOpened) {
      // if (document.activeElement instanceof HTMLElement) {
      console.log("state work");
      document.activeElement.blur();
      // }
    } else if (
      themeMenuOpened &&
      !themeMenu.current?.contains(document.activeElement)
    ) {
      setThemeMenuOpened(false);
    }
  }, [themeMenuOpened]);

  return (
    <div className="navbar sticky top-0 z-10 bg-base-100 px-4">
      <div className="navbar-start">
        <label className="btn btn-square btn-ghost swap swap-rotate">
          <input type="checkbox" />
          <svg
            className="swap-off fill-current"
            xmlns="http://www.w3.org/2000/svg"
            width="32"
            height="32"
            viewBox="0 0 512 512"
          >
            <path d="M64,384H448V341.33H64Zm0-106.67H448V234.67H64ZM64,128v42.67H448V128Z" />
          </svg>

          <svg
            className="swap-on fill-current"
            xmlns="http://www.w3.org/2000/svg"
            width="32"
            height="32"
            viewBox="0 0 512 512"
          >
            <polygon points="400 145.49 366.51 112 256 222.51 145.49 112 112 145.49 222.51 256 112 366.51 145.49 400 256 289.49 366.51 400 400 366.51 289.49 256 400 145.49" />
          </svg>
        </label>
        <NextLink href="/">
          <a
            onClick={() => resetScroll()}
            className="btn btn-ghost normal-case text-xl"
          >
            SimpleBlog
          </a>
        </NextLink>
      </div>
      <div className="hidden md:flex md:navbar-center md:gap-10 ">
        <div className="form-control">
          <input
            type="text"
            placeholder="Search..."
            className="input input-bordered"
          />
        </div>
        <NextLink href="/create-post">
          <a className="btn btn-ghost normal-case text-xl">Create post</a>
        </NextLink>
      </div>
      <div className="navbar-end">
        <div className="flex md:hidden ">
          <a className="btn btn-ghost btn-square normal-case text-xl">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </a>
        </div>
        {me.data ? (
          <div ref={themeMenu} className="dropdown dropdown-end">
            <label
              ref={themeMenuButton}
              tabIndex={0}
              onBlur={(e) => {
                setThemeMenuOpened(false);
              }}
              onClick={(e) => {
                if (themeMenuOpened) {
                  setThemeMenuOpened(false);
                } else {
                  setThemeMenuOpened(true);
                }
              }}
              className="btn btn-ghost btn-circle avatar"
            >
              <div className="w-10 rounded-full">
                <Image
                  className="rounded-full cursor-pointer"
                  src={me.data?.image ? me.data.image : "/user-placeholder.jpg"}
                  width="48"
                  alt="Not image"
                  height="48"
                />
              </div>
            </label>
            <ul
              onBlur={(e) => {
                themeMenuButton.current.focus();
              }}
              onFocus={(e) => {
                setThemeMenuOpened(true);
              }}
              tabIndex={0}
              className="mt-3 p-2 shadow menu menu-compact dropdown-content bg-base-100 rounded-box w-52"
            >
              <li>
                <a
                  onClick={(e) => {
                    if (document.activeElement instanceof HTMLElement) {
                      console.log("i work        ");
                      setThemeMenuOpened(false);
                      // document.activeElement.blur();
                    }
                  }}
                >
                  Profile
                </a>
              </li>
              <li>
                <a
                  onClick={(e) => {
                    setThemeMenuOpened(false);
                    // if (document.activeElement instanceof HTMLElement)
                    //   document.activeElement.blur();
                  }}
                >
                  Drafts
                </a>
              </li>
              <li>
                <a
                  onClick={() => {
                    if (document.activeElement instanceof HTMLElement)
                      document.activeElement.blur();
                    signOut();
                  }}
                >
                  Logout
                </a>
              </li>
            </ul>
          </div>
        ) : (
          <a
            className="btn btn-ghost normal-case text-xl"
            onClick={() => signIn()}
          >
            Sign in
          </a>
        )}
      </div>
    </div>
  );
};

export default NavBar;
