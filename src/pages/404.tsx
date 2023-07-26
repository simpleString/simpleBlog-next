import { ReactElement } from "react";
import { Layout } from "../layouts/Layout";
import { NextPageWithLayout } from "./_app";
import MetaHead from "../components/MetaHead";

const NotFound: NextPageWithLayout<React.FC> = () => {
  return (
    <>
      <MetaHead pageTitle="404" description="SimpleString Blog 404 page" />

      <div className="flex h-[calc(100vh_-_64px)] items-center justify-center">
        <div className="h-1/2 bg-gradient-to-tr from-primary-focus to-primary-content bg-clip-text text-8xl text-transparent">
          404
        </div>
      </div>
    </>
  );
};

NotFound.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>;
};

export default NotFound;
