import { ReactElement } from "react";
import LoadingSpinner from "../components/LoadingSpinner";
import DraftPostComponent from "../components/posts/DraftPostComponent";
import { Layout } from "../layouts/Layout";
import { trpc } from "../utils/trpc";

const DraftList = () => {
  const { data: drafts, isLoading } = trpc.useQuery(["post.drafts"]);

  if (isLoading) return <LoadingSpinner />;

  return (
    <div>
      <h1 className="mb-4 bg-gradient-to-tr from-primary-focus to-primary-content bg-clip-text text-center text-5xl font-medium text-transparent">
        Drafts
      </h1>
      {drafts?.length === 0 ? (
        <div className="flex h-96 items-center justify-center p-4">
          <h2 className="text-center text-2xl">
            Sorry, but you not draft no one post
          </h2>
        </div>
      ) : (
        drafts?.map((draft) => (
          <DraftPostComponent draft={draft} key={draft.id} />
        ))
      )}
    </div>
  );
};

DraftList.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>;
};

export default DraftList;
