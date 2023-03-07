import { useEffect, useRef } from "react";
import { useOnScreen } from "../../hooks/useOnScreen";
import { trpc } from "../../utils/trpc";
import LoadingSpinner from "../LoadingSpinner";
import { PostComponent } from "./PostComponent";

const PostList = () => {
  const bottomOfPosts = useRef<HTMLDivElement>(null);
  const isOnScreen = useOnScreen(bottomOfPosts);

  const {
    data,
    isLoading: postLoading,
    fetchNextPage,
    isFetchingNextPage,
  } = trpc.useInfiniteQuery(["post.posts", { limit: 5 }], {
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

export default PostList;
