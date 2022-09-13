import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { CommunityProps } from "../../pages/create-post";
import { trpc } from "../../utils/trpc";

type SelectPostCommunity = {
  currentCommunity: CommunityProps | undefined;
  setCurrentCommunity: Dispatch<SetStateAction<CommunityProps | undefined>>;
};

const SelectPostCommunity: React.FC<SelectPostCommunity> = ({
  currentCommunity,
  setCurrentCommunity,
}) => {
  const [value, setValue] = useState("");
  const [openSelectMenu, setOpenSelectMenu] = useState(false);

  const userCommunities = trpc.useQuery(["community.communitiesForUser"]);
  const communitiesSearch = trpc.useQuery(
    ["community.search", { title: value }],
    { enabled: false, keepPreviousData: true }
  );

  const chooseCommunityOther = (id: string) => {
    setCurrentCommunity(communitiesSearch.data?.find((c) => c.id === id));
    setValue("");
    setOpenSelectMenu(!openSelectMenu);
  };

  const chooseCommunity = (id: string) => {
    setCurrentCommunity(userCommunities.data?.find((c) => c.id === id));
    setValue("");
    setOpenSelectMenu(!openSelectMenu);
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (value) {
        communitiesSearch.refetch();
        console.log(value);
      }
    }, 1000);

    return () => clearTimeout(delayDebounceFn);
  }, [value]);

  return (
    <div>
      <button
        className="btn"
        onClick={() => {
          if (openSelectMenu) {
            setValue("");
          }
          setOpenSelectMenu(!openSelectMenu);
        }}
      >
        <div>
          <img src={currentCommunity?.img} alt="Community Image" />
          <span>{currentCommunity?.title}</span>
        </div>
      </button>
      {openSelectMenu && (
        <ul className="menu p-4 shadow bg-base-100 absolute w-56 z-50">
          <div className="form-control">
            <div className="input-group">
              <input
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="Search..."
                className="input  input-bordered input-sm"
              />
              <button className="btn btn-square">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
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
              </button>
            </div>
          </div>
          <li className="menu-title">
            <span>Subscriptions</span>
          </li>
          {userCommunities.data?.map((c) => (
            <li key={c.id} onClick={() => chooseCommunity(c.id)}>
              <div>
                <img src={c.img} alt="Community Image" />
                <span>{c.title}</span>
              </div>
            </li>
          ))}
          {communitiesSearch.data && value && (
            <>
              <li className="menu-title">
                <span>Other</span>
              </li>
              {communitiesSearch.data?.map((c) => (
                <li key={c.id} onClick={() => chooseCommunityOther(c.id)}>
                  <div>
                    <img src={c.img} alt="Community Image" />
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
