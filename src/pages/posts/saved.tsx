import { ReactElement, useEffect, useRef } from "react";
import LoadingSpinner from "../../components/LoadingSpinner";
import { PostComponent } from "../../components/posts/PostComponent";
import { POST_LIMIT } from "../../constants/frontend";
import { useOnScreen } from "../../hooks/useOnScreen";
import { Layout } from "../../layouts/Layout";
import { trpc } from "../../utils/trpc";
import { NextPageWithLayout } from "../_app";

const SavedPosts: NextPageWithLayout<React.FC> = () => {
  const bottomOfPosts = useRef<HTMLDivElement>(null);
  const isOnScreen = useOnScreen(bottomOfPosts);

  const {
    data,
    isLoading: postLoading,
    fetchNextPage,
    isFetchingNextPage,
  } = trpc.useInfiniteQuery(["post.bookedPosts", { limit: POST_LIMIT }], {
    cacheTime: 0,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });

  useEffect(() => {
    const handleFetchNextPage = () => {
      fetchNextPage();
    };

    if (isOnScreen) handleFetchNextPage();
  }, [isOnScreen, fetchNextPage]);

  return (
    <div className="md:p-4">
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

SavedPosts.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>;
};

export default SavedPosts;
