import { ReactElement } from "react";
import { Layout } from "../layouts/Layout";

const ServerErrorPage = () => {
  return (
    <div className="flex h-[calc(100vh_-_64px)] items-center justify-center">
      <div className="h-1/2 bg-gradient-to-tr from-primary-focus to-primary-content bg-clip-text text-center text-5xl text-transparent md:text-8xl">
        Server error. Please try again later.
      </div>
    </div>
  );
};

ServerErrorPage.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>;
};

export default ServerErrorPage;
