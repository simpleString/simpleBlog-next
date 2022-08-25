import type { NextPage } from "next";
import Head from "next/head";
import { PostComponent } from "../components/PostComponent";
import { trpc } from "../utils/trpc";

const Home: NextPage = () => {
  const posts = trpc.useQuery(["post.posts"]);

  return (
    <>
      <Head>
        <title>Create T3 App</title>
        <meta name="description" content="SimpleBlog" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="container mx-auto flex flex-col items-center justify-center min-h-screen p-4">
        {posts.isFetching ? (
          <div>Loading...</div>
        ) : (
          posts.data?.map((post) => <PostComponent key={post.id} post={post} />)
        )}
      </main>
    </>
  );
};

export default Home;
