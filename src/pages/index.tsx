import Head from "next/head";
import { ReactElement, useEffect } from "react";
import { Layout } from "../components/Layout";
import LoadingSpinner from "../components/LoadingSpinner";
import { PostComponent } from "../components/posts/PostComponent";
import { useScrollState } from "../store";
import { trpc } from "../utils/trpc";
import { NextPageWithLayout } from "./_app";

const Home: NextPageWithLayout<React.FC> = () => {
  const { data: posts, isLoading: postLoading } = trpc.useQuery(["post.posts"]);
  const scrollPosition = useScrollState((state) => state.scrollPosition);

  useEffect(() => {
    window.scrollTo(0, scrollPosition);
  }, [scrollPosition]);

  return (
    <>
      <Head>
        <title>Simple Blog</title>
        <meta name="description" content="SimpleBlog" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="md:p-4">
        {postLoading ? (
          <LoadingSpinner />
        ) : (
          posts?.map((post) => <PostComponent key={post.id} post={post} />)
        )}
      </div>
    </>
  );
};

Home.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>;
};

export default Home;
