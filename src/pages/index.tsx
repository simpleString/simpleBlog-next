import dynamic from "next/dynamic";
import { ReactElement } from "react";
import { Layout } from "../layouts/Layout";
import { NextPageWithLayout } from "./_app";

const PostListNoSSR = dynamic(() => import("../components/PostList"), {
  ssr: false,
});

const Home: NextPageWithLayout<React.FC> = () => {
  return (
    <>
      <PostListNoSSR />
    </>
  );
};

Home.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>;
};

export default Home;
