import { ReactElement } from "react";
import { Layout } from "../components/Layout";
import { NextPageWithLayout } from "./_app";

const NotFound: NextPageWithLayout<React.FC> = () => {
  return <div className="text-center">404</div>;
};

NotFound.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>;
};

export default NotFound;
