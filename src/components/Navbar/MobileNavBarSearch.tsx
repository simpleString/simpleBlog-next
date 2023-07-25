import { useRouter } from "next/router";
import { ChangeEvent, FormEvent } from "react";
import { useSearchQueryStore } from "../../store";
import { stateCallback } from "../../types/frontend";

const MobileNavBarSearch: React.FC<{
  setSearchMenuOpened: stateCallback<boolean>;
}> = ({ setSearchMenuOpened }) => {
  const router = useRouter();

  const { query, setQuery } = useSearchQueryStore();

  const onChagneSearchValue = (e: ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  const searchPosts = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSearchMenuOpened(false);
    router.push(`/posts/search?query=${query}`);
  };

  return (
    <div className="fixed top-16 z-50 w-full bg-base-100 p-2 md:hidden">
      <form onSubmit={searchPosts} className="form-control">
        <input
          type="text"
          placeholder="Search..."
          className="input-bordered input"
          value={query}
          onChange={onChagneSearchValue}
        />
      </form>
    </div>
  );
};

export default MobileNavBarSearch;
