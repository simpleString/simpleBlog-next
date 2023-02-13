import NextLink from "next/link";
import { useRouter } from "next/router";
import { ChangeEvent, FormEvent, useState } from "react";
import { stateCallback } from "../../types/frontend";

export type NavbarSearchProps = {
  searchMenuOpened: boolean;
  setSearchMenuOpened: stateCallback<boolean>;
};

const NavBarSearch: React.FC<NavbarSearchProps> = ({
  searchMenuOpened,
  setSearchMenuOpened,
}) => {
  const router = useRouter();

  const [searchValue, setSearchValue] = useState("");

  const onChagneSearchValue = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
  };

  const closeMenu = () => setTimeout(() => setSearchMenuOpened(false), 200);

  const openMenu = () => {
    setSearchMenuOpened(true);
  };

  const searchPosts = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    closeMenu();
    router.push(`/post/search/${searchValue}`);
  };

  return (
    <div className="w-full relative" onBlur={closeMenu}>
      <form onSubmit={searchPosts}>
        <input
          type="text"
          placeholder="Search..."
          className=" input input-bordered input-primary w-full "
          value={searchValue}
          onChange={onChagneSearchValue}
          onClick={openMenu}
        />

        {searchMenuOpened && (
          <ul className="none md:block absolute mt-3 p-2 shadow menu dropdown-content bg-base-100 w-full">
            <li>
              <NextLink href={`/post/search/${searchValue}`}>
                <a onClick={closeMenu}>
                  <i className="ri-search-line" />
                  Go to result
                </a>
              </NextLink>
            </li>
          </ul>
        )}
      </form>
    </div>
  );
};

export default NavBarSearch;
