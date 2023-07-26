import { ReactElement, useEffect, useRef, useState } from "react";
import Dropdown from "../components/Dropdown";
import LoadingSpinner from "../components/LoadingSpinner";
import { PostComponent } from "../components/posts/PostComponent";
import { POST_LIMIT } from "../constants/frontend";
import { useOnScreen } from "../hooks/useOnScreen";
import { Layout } from "../layouts/Layout";
import { useOrderPostStore } from "../store";
import { trpc } from "../utils/trpc";
import { NextPageWithLayout } from "./_app";

const Home: NextPageWithLayout<React.FC> = () => {
  const bottomOfPosts = useRef<HTMLDivElement>(null);
  const isOnScreen = useOnScreen(bottomOfPosts);

  const { order: notHydratedOrder, changeOrder } = useOrderPostStore();

  //It's solve hydration error
  const [order, setOrder] = useState<typeof notHydratedOrder>("best");
  useEffect(() => {
    setOrder(notHydratedOrder);
  }, [notHydratedOrder]);

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
      <div className="flex justify-end p-4 ">
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
          <li>
            <span
              className={`${order === "hot" ? "active" : ""}`}
              onClick={() => changeOrder("hot")}
            >
              Hot
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

Home.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>;
};

export default Home;
