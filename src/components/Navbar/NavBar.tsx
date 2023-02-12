import { signIn } from "next-auth/react";
import NextLink from "next/link";
import { useState } from "react";
import { trpc } from "../../utils/trpc";
import { SearchIcon } from "../Svg";
import IconMenu from "./IconMenu";
import Logo from "./Logo";
import MenuButton from "./MenuButton";
import MobileNavBarSearch from "./MobileNavBarSearch";
import NavBarSearch from "./NavBarSearch";

const NavBar: React.FC = () => {
  const { data: userData } = trpc.useQuery(["user.me"]);

  const [searchMenuOpened, setSearchMenuOpened] = useState(false);

  return (
    <nav className="relative">
      <div className="navbar fixed top-0 z-10 bg-base-100 px-4 text-base-content backdrop-blur shadow">
        <div className="navbar-start">
          <MenuButton />
          <Logo />
        </div>

        <div className="hidden md:flex md:navbar-center md:gap-10 max-w-lg w-full">
          <NavBarSearch
            searchMenuOpened={searchMenuOpened}
            setSearchMenuOpened={setSearchMenuOpened}
          />

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
          {userData ? (
            <IconMenu image={userData.image} />
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
        <MobileNavBarSearch
          searchMenuOpened={searchMenuOpened}
          setSearchMenuOpened={setSearchMenuOpened}
        />
      )}
    </nav>
  );
};

export default NavBar;
