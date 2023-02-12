import { User } from "next-auth";
import { useSession } from "next-auth/react";
import NextImage from "next/image";
import { list } from "postcss";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { placeholderAvatar } from "../../constants/frontend";
import { useClickOutside } from "../../hooks/useClickOutside";
import { CommunityProps, UserBlogProps } from "../../pages/create-post";
import { stateCallback } from "../../types/frontend";
import { trpc } from "../../utils/trpc";
import { ChevronDownIcon } from "../Svg";

type SelectPostCommunity = {
  currentCommunity: CommunityProps | UserBlogProps | undefined;
  setCurrentCommunity: stateCallback<
    CommunityProps | UserBlogProps | undefined
  >;
  user: User;
};

const SelectPostCommunity: React.FC<SelectPostCommunity> = ({
  currentCommunity,
  setCurrentCommunity,
  user,
}) => {
  const [searchValue, setSearchValue] = useState("");
  const [openSelectMenu, setOpenSelectMenu] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  const { data: userCommunities } = trpc.useQuery([
    "community.communitiesForUser",
  ]);

  const filteredUserCommunities = useMemo(
    () =>
      userCommunities?.filter((community) => {
        if (!searchValue) return true;
        return community.title.startsWith(searchValue);
      }),
    [userCommunities, searchValue]
  );

  const { data: communitiesSearch, refetch: updateCommunitiesSearch } =
    trpc.useQuery(["community.search", { title: searchValue }], {
      enabled: false,
      keepPreviousData: true,
    });

  const toggleSelectMenu = useCallback(() => {
    setSearchValue("");
    setOpenSelectMenu(!openSelectMenu);
  }, [openSelectMenu]);

  const closeSelectMenu = () => {
    setSearchValue("");
    setOpenSelectMenu(false);
  };

  const chooseAsBlog = () => {
    setCurrentCommunity({
      userId: user.id,
      img: user.image,
      title: user.name,
      type: "user",
    });
    toggleSelectMenu();
  };

  const chooseCommunityOther = (id: string) => {
    const selecterCommunity = communitiesSearch?.find((c) => c.id === id);
    if (!selecterCommunity) return;
    setCurrentCommunity({ type: "community", ...selecterCommunity });
    toggleSelectMenu();
  };

  const chooseCommunity = (id: string) => {
    const selecterCommunity = filteredUserCommunities?.find((c) => c.id === id);
    if (!selecterCommunity) return;
    setCurrentCommunity({ type: "community", ...selecterCommunity });
    toggleSelectMenu();
  };

  useEffect(() => {
    setCurrentCommunity({
      userId: user.id,
      type: "user",
      img: user.image,
      title: user.name,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchValue) {
        updateCommunitiesSearch();
      }
    }, 1000);
    return () => clearTimeout(delayDebounceFn);
  }, [searchValue, updateCommunitiesSearch]);

  useClickOutside({ ref: listRef, onClose: closeSelectMenu });

  const userCommunitiesExists =
    filteredUserCommunities && filteredUserCommunities.length > 0;

  const communitiesSearchExists = communitiesSearch && searchValue;

  return (
    <div ref={listRef}>
      <button
        className="bg-base-200 flex items-center space-x-2 p-2 rounded"
        onClick={toggleSelectMenu}
      >
        <NextImage
          src={currentCommunity?.img || "/community.jpeg"}
          alt="Community Image"
          width="24"
          height="24"
        />
        <span>{currentCommunity?.title}</span>
        <ChevronDownIcon />
      </button>
      {openSelectMenu && (
        <ul className="menu p-4 shadow bg-base-100 absolute w-56 z-50">
          <div className="form-control">
            <input
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder="Search..."
              className="input  input-bordered input-sm"
            />
          </div>
          <li className="menu-title">
            <span>Blog</span>
          </li>
          <li onClick={chooseAsBlog}>
            <div>
              <NextImage
                src={user.image}
                alt="Community Image"
                width="24"
                height="24"
              />
              <span>{user.name}</span>
            </div>
          </li>
          {userCommunitiesExists && (
            <>
              <li className="menu-title">
                <span>Subscriptions</span>
              </li>
              {filteredUserCommunities.map((c) => (
                <li key={c.id} onClick={() => chooseCommunity(c.id)}>
                  <div>
                    <NextImage
                      src={c.img}
                      alt="Community Image"
                      width="24"
                      height="24"
                    />
                    <span>{c.title}</span>
                  </div>
                </li>
              ))}
            </>
          )}
          {communitiesSearchExists && (
            <>
              <li className="menu-title">
                <span>Other</span>
              </li>
              {communitiesSearch.map((c) => (
                <li key={c.id} onClick={() => chooseCommunityOther(c.id)}>
                  <div>
                    <NextImage
                      src={c.img}
                      alt="Community Image"
                      width="24"
                      height="24"
                    />
                    <span>{c.title}</span>
                  </div>
                </li>
              ))}
            </>
          )}
        </ul>
      )}
    </div>
  );
};

export default SelectPostCommunity;
