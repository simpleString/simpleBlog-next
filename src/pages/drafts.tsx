import { ReactElement } from "react";
import LoadingSpinner from "../components/LoadingSpinner";
import DraftPostComponent from "../components/posts/DraftPostComponent";
import { Layout } from "../layouts/Layout";
import { trpc } from "../utils/trpc";

const DraftList = () => {
  const { data: drafts, isLoading } = trpc.useQuery(["post.drafts"]);

  if (isLoading) return <LoadingSpinner />;

  return (
    <>
      {drafts?.map((draft) => (
        <DraftPostComponent draft={draft} key={draft.id} />
      ))}
    </>
  );
};

DraftList.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>;
};

export default DraftList;
