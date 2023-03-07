import { useEffect, useRef } from "react";
import { POST_LIMIT } from "../../constants/frontend";
import { useOnScreen } from "../../hooks/useOnScreen";
import { useOrderPostStore } from "../../store";
import { trpc } from "../../utils/trpc";
import Dropdown from "../Dropdown";
import LoadingSpinner from "../LoadingSpinner";
import { PostComponent } from "./PostComponent";

const PostList = () => {
  const bottomOfPosts = useRef<HTMLDivElement>(null);
  const isOnScreen = useOnScreen(bottomOfPosts);

  const { order, changeOrder } = useOrderPostStore();

  const {
    data,
    isLoading: postLoading,
    fetchNextPage,
    isFetchingNextPage,
  } = trpc.useInfiniteQuery(
    ["post.posts", { limit: POST_LIMIT, orderBy: order }],
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    }
  );

  useEffect(() => {
    const handleFetchNextPage = () => {
      fetchNextPage();
    };

    if (isOnScreen) handleFetchNextPage();
  }, [isOnScreen, fetchNextPage]);

  return (
    <div className="md:p-4">
      <div className="ml-auto">
        <Dropdown
          buttonComponentClasses="btn "
          childrenClasses="p-0 w-36 menu-compact"
          buttonComponent={<span>Sort by: {order}</span>}
          dropdownClasses="dropdown-end"
        >
          <li className="pt-2">
            <span
              className={`${order === "new" ? "active" : ""}`}
              onClick={() => changeOrder("new")}
            >
              New
            </span>
          </li>
          <li>
            <span
              className={`${order === "best" ? "active" : ""}`}
              onClick={() => changeOrder("best")}
            >
              Best
            </span>
          </li>
        </Dropdown>
      </div>
      {postLoading ? (
        <LoadingSpinner />
      ) : (
        data?.pages?.map((page) =>
          page.posts.map((post) => <PostComponent key={post.id} post={post} />)
        )
      )}
      <div ref={bottomOfPosts} />
      {isFetchingNextPage && <div className="text-center">Loading...</div>}
    </div>
  );
};

export default PostList;
