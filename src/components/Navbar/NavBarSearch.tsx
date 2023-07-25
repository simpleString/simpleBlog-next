import { useRouter } from "next/router";
import type { ChangeEvent, FormEvent } from "react";
import { useSearchQueryStore } from "../../store";

const NavBarSearch = () => {
  const router = useRouter();

  const { query, setQuery } = useSearchQueryStore();

  // const [searchValue, setSearchValue] = useState("");

  const onChagneSearchValue = (e: ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  const searchPosts = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    router.push(`/posts/search?query=${query}`);
  };

  return (
    <div className="form-control relative w-full">
      <form onSubmit={searchPosts} className="input-group">
        <input
          type="text"
          placeholder="Search..."
          className=" input-bordered input-primary input w-full"
          value={query}
          onChange={onChagneSearchValue}
        />
        <button className="btn-square btn">
          <i className="ri-search-line ri-xl" />
        </button>
      </form>
    </div>
  );
};

export default NavBarSearch;
