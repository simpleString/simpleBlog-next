import { signIn, signOut } from "next-auth/react";
import Image from "next/image";
import NextLink from "next/link";
import { useRouter } from "next/router";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import { useScrollState, useSidebarState } from "../store";
import { trpc } from "../utils/trpc";
import Dropdown from "./Dropdown";
import { CloseIcon, MenuIcon, SearchIcon } from "./Svg";

const NavBar: React.FC = () => {
  const me = trpc.useQuery(["user.me"]);

  const router = useRouter();

  const [searchValue, setSearchValue] = useState("");

  const resetScroll = useScrollState((state) => state.reset);

  const [searchMenuOpened, setSearchMenuOpened] = useState(false);

  const toggleSidebar = useSidebarState((state) => state.toggle);

  const isSidebarOpen = useSidebarState((state) => state.sidebarOpen);

  const onChagneSearchValue = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
  };

  const delayedCloseMenu = () =>
    setTimeout(() => setSearchMenuOpened(false), 100);

  return (
    <nav className="relative">
      <div className="navbar fixed top-0 z-10 bg-base-100 px-4 text-base-content backdrop-blur shadow">
        <div className="navbar-start">
          <label
            className={` "btn btn-square btn-ghost swap swap-rotate" + ${
              isSidebarOpen ? " swap-active" : ""
            }
            `}
          >
            <button
              onClick={() => {
                toggleSidebar();
              }}
            />
            <MenuIcon className="swap-off fill-current" />

            <CloseIcon className="swap-on fill-current" />
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
        <div className="hidden md:flex md:navbar-center md:gap-10 max-w-lg w-full">
          <div
            className="w-full relative"
            onFocus={() => setSearchMenuOpened(true)}
            onBlur={() => delayedCloseMenu()}
          >
            <form
              onSubmit={(e) => {
                console.log("form submit");
                e.preventDefault();
                setSearchMenuOpened(false);
                router.push(`/post/search/${searchValue}`);
              }}
            >
              <input
                type="text"
                placeholder="Search..."
                className=" input input-bordered input-primary w-full "
                value={searchValue}
                onChange={onChagneSearchValue}
                onClick={() => setSearchMenuOpened(true)}
              />

              <ul
                style={{ display: searchMenuOpened ? "block" : "none" }}
                className="none md:block absolute mt-3 p-2 shadow menu dropdown-content bg-base-100 w-full"
              >
                <li>
                  <NextLink href={`/post/search/${searchValue}`}>
                    <a
                      onClick={() => {
                        console.log("Click to search");
                        setSearchMenuOpened(false);
                      }}
                    >
                      <SearchIcon />
                      Go to result
                    </a>
                  </NextLink>
                </li>
              </ul>
            </form>
          </div>
          <NextLink href="/create-post">
            <a className="btn btn-ghost normal-case text-xl">Create post</a>
          </NextLink>
        </div>
        <div className="navbar-end">
          <div className="flex md:hidden ">
            <a
              onClick={() => {
                setSearchMenuOpened(!searchMenuOpened);
              }}
              className="btn btn-ghost btn-square normal-case text-xl"
            >
              <SearchIcon />
            </a>
          </div>
          {me.data ? (
            <Dropdown
              buttonComponentClasses="btn btn-ghost btn-circle avatar"
              childrenClasses="mt-3 p-2 shadow menu menu-compact dropdown-content bg-base-100 rounded-box w-52"
              buttonComponent={
                <div className="w-10 rounded-full">
                  <Image
                    className="rounded-full cursor-pointer"
                    src={me.data?.image ?? "/user-placeholder.jpg"}
                    width="48"
                    alt="Not image"
                    height="48"
                  />
                </div>
              }
            >
              <li>
                <NextLink href="/profile">
                  <a>Profile</a>
                </NextLink>
              </li>
              <li>
                <a>Drafts</a>
              </li>
              <li>
                <a onClick={() => signOut()}>Logout</a>
              </li>
            </Dropdown>
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
      {searchMenuOpened && (
        <div className="md:hidden w-full p-2 fixed bg-base-100 z-50">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setSearchMenuOpened(false);
              router.push(`/post/search/${searchValue}`);
            }}
            className="form-control"
          >
            <input
              type="text"
              placeholder="Search..."
              className="input input-bordered"
              onChange={onChagneSearchValue}
            />
          </form>
        </div>
      )}
    </nav>
  );
};

export default NavBar;
