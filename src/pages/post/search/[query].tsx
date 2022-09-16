import Head from "next/head";
import { useRouter } from "next/router";
import { ReactElement } from "react";
import { Layout } from "../../../components/Layout";
import LoadingSpinner from "../../../components/LoadingSpinner";
import { PostComponent } from "../../../components/posts/PostComponent";
import { trpc } from "../../../utils/trpc";
import { NextPageWithLayout } from "../../_app";

const Search: NextPageWithLayout<React.FC> = () => {
  const router = useRouter();

  const query = router.query.query as string;

  const posts = trpc.useQuery(["post.search", { query }]);

  return (
    <>
      <Head>
        <title>Simple Blog</title>
        <meta name="description" content="SimpleBlog" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="">Results for query: {query}</div>

      <div className="md:p-4">
        {posts.isLoading ? (
          <LoadingSpinner />
        ) : (
          posts.data?.map((post) => <PostComponent key={post.id} post={post} />)
        )}
      </div>
    </>
  );
};

Search.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>;
};

export default Search;
