import { useRouter } from "next/router";
import { ReactElement, useEffect, useRef, useState } from "react";
import LoadingSpinner from "../../../components/LoadingSpinner";
import SearchComponent, {
  FormInputType,
} from "../../../components/SearchComponent";
import { PostComponent } from "../../../components/posts/PostComponent";
import { POST_LIMIT } from "../../../constants/frontend";
import { useOnScreen } from "../../../hooks/useOnScreen";
import { Layout } from "../../../layouts/Layout";
import { useOrderSearchPostsStore, useSearchQueryStore } from "../../../store";
import { trpc } from "../../../utils/trpc";
import { NextPageWithLayout } from "../../_app";

type AdvanceSearchValueType = FormInputType;

const Search: NextPageWithLayout<React.FC> = () => {
  const router = useRouter();

  const restoreQuery = useSearchQueryStore((store) => store.restoreQuery);

  const query = router.query.query;

  const bottomOfPosts = useRef<HTMLDivElement>(null);
  const isOnScreen = useOnScreen(bottomOfPosts);

  const order = useOrderSearchPostsStore((store) => store.order);

  const [advanceSearchParams, setAdvanceSearchParams] =
    useState<AdvanceSearchValueType>();

  const {
    data,
    isLoading: postLoading,
    fetchNextPage,
    isFetchingNextPage,
  } = trpc.useInfiniteQuery(
    [
      "post.search",
      {
        limit: POST_LIMIT,
        orderBy: order,
        query: query as string,
        ...advanceSearchParams,
      },
    ],
    {
      enabled: !!query,
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    }
  );

  useEffect(() => {
    const handleFetchNextPage = () => {
      fetchNextPage();
    };

    if (isOnScreen) handleFetchNextPage();
  }, [isOnScreen, fetchNextPage]);

  useEffect(() => {
    return () => {
      restoreQuery();
    };
  }, [restoreQuery]);

  const onSubmitSearch = (data: AdvanceSearchValueType) => {
    setAdvanceSearchParams(data);
  };

  return (
    <div className="md:p-4">
      <SearchComponent
        submitFn={onSubmitSearch}
        query={typeof query === "string" ? query : ""}
        resultCount={data?.pages[0]?.postsCount ?? 0}
      />
      {postLoading ? (
        <LoadingSpinner />
      ) : data?.pages[0]?.posts.length === 0 ? (
        <div className="flex h-56 items-center justify-center p-4">
          <h2 className="text-center text-2xl">
            Sorry, but we didn&apos;t find anything
          </h2>
        </div>
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

Search.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>;
};

export default Search;
