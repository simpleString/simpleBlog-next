import { ReactElement, useEffect, useRef } from "react";
import LoadingSpinner from "../../components/LoadingSpinner";
import { PostComponent } from "../../components/posts/PostComponent";
import { POST_LIMIT } from "../../constants/frontend";
import { useOnScreen } from "../../hooks/useOnScreen";
import { Layout } from "../../layouts/Layout";
import { trpc } from "../../utils/trpc";
import { NextPageWithLayout } from "../_app";
import MetaHead from "../../components/MetaHead";
import { useSession } from "next-auth/react";

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

  const session = useSession({ required: true });

  useEffect(() => {
    const handleFetchNextPage = () => {
      fetchNextPage();
    };

    if (isOnScreen) handleFetchNextPage();
  }, [isOnScreen, fetchNextPage]);

  if (postLoading) return <LoadingSpinner />;

  return (
    <>
      <MetaHead
        pageTitle={
          "Saved posts of simpleString Blog for user " +
          session.data?.user?.name
        }
        description="Saved posts of simpleString Blog"
      />

      <div>
        <h1 className="mb-4 bg-gradient-to-tr from-primary-focus to-primary-content bg-clip-text text-center text-5xl font-medium text-transparent">
          Saved posts
        </h1>
        {data?.pages[0]?.posts.length === 0 ? (
          <div className="flex h-96 items-center justify-center p-4">
            <h2 className="text-center text-2xl">
              Sorry, but you not saved no one post
            </h2>
          </div>
        ) : (
          data?.pages?.map((page) =>
            page.posts.map((post) => (
              <PostComponent key={post.id} post={post} />
            ))
          )
        )}
        <div ref={bottomOfPosts} />
        {isFetchingNextPage && <div className="text-center">Loading...</div>}
      </div>
    </>
  );
};

SavedPosts.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>;
};

export default SavedPosts;
