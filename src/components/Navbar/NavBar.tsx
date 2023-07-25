import { signIn } from "next-auth/react";
import NextLink from "next/link";
import { useState } from "react";
import { trpc } from "../../utils/trpc";
import ColorModeSwitcher from "./ColorModeSwitcher";
import IconMenu from "./IconMenu";
import Logo from "./Logo";
import MobileNavBarSearch from "./MobileNavBarSearch";
import NavBarSearch from "./NavBarSearch";

const NavBar: React.FC = () => {
  const { data: userData } = trpc.useQuery(["user.me"]);

  const [searchMenuOpened, setSearchMenuOpened] = useState(false);

  return (
    <nav className="relative">
      <div className="navbar fixed top-0 z-[100] bg-base-100 px-4 text-base-content shadow backdrop-blur">
        <div className="navbar-start">
          <Logo />
        </div>

        <div className="hidden w-full max-w-lg md:flex md:gap-10 md:navbar-center">
          <NavBarSearch />

          <NextLink href="/create-post">
            <a className="btn-ghost btn text-xl normal-case">Create post</a>
          </NextLink>
        </div>
        <div className="navbar-end">
          <div className="flex md:hidden ">
            <a
              onClick={() => {
                setSearchMenuOpened(!searchMenuOpened);
              }}
              className="btn-ghost btn-square btn text-xl normal-case"
            >
              <i className="ri-search-line" />
            </a>
          </div>

          <ColorModeSwitcher />

          {userData ? (
            <IconMenu image={userData.image} />
          ) : (
            <button
              className="btn-ghost btn text-xl normal-case"
              onClick={() => signIn()}
            >
              Sign in
            </button>
          )}
        </div>
      </div>
      {searchMenuOpened && (
        <MobileNavBarSearch setSearchMenuOpened={setSearchMenuOpened} />
      )}
    </nav>
  );
};

export default NavBar;
