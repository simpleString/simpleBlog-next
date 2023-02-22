import Head from "next/head";
import { ReactElement } from "react";
import PostList from "../components/posts/PostList";
import { Layout } from "../layouts/Layout";
import { NextPageWithLayout } from "./_app";

const Home: NextPageWithLayout<React.FC> = () => {
  return (
    <>
      <Head>
        <title>Simple Blog</title>
        <meta name="description" content="SimpleBlog" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <PostList />
    </>
  );
};

Home.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>;
};

export default Home;
