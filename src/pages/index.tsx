import Head from "next/head";
import { ReactElement, useEffect } from "react";
import { Layout } from "../components/Layout";
import LoadingSpinner from "../components/LoadingSpinner";
import { PostComponent } from "../components/PostComponent";
import { useScrollState } from "../store";
import { trpc } from "../utils/trpc";
import { NextPageWithLayout } from "./_app";

const Home: NextPageWithLayout<React.FC> = () => {
  const posts = trpc.useQuery(["post.posts"]);
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

      <main className="container mx-auto flex flex-col items-center justify-center min-h-screen p-4">
        {posts.isLoading ? (
          <LoadingSpinner />
        ) : (
          posts.data?.map((post) => <PostComponent key={post.id} post={post} />)
        )}
      </main>
    </>
  );
};

Home.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>;
};

export default Home;
