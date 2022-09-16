import { useRouter } from "next/router";
import { ChangeEvent, FormEvent, useState } from "react";
import { NavbarSearchProps } from "./NavBarSearch";

const MobileNavBarSearch: React.FC<NavbarSearchProps> = ({
  setSearchMenuOpened,
}) => {
  const router = useRouter();

  const [searchValue, setSearchValue] = useState("");

  const onChagneSearchValue = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
  };

  const closeMenu = () => setTimeout(() => setSearchMenuOpened(false), 200);

  const searchPosts = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    closeMenu();
    router.push(`/post/search/${searchValue}`);
  };

  return (
    <div className="md:hidden w-full p-2 fixed bg-base-100 z-50">
      <form onSubmit={searchPosts} className="form-control">
        <input
          type="text"
          placeholder="Search..."
          className="input input-bordered"
          onChange={onChagneSearchValue}
        />
      </form>
    </div>
  );
};

export default MobileNavBarSearch;
