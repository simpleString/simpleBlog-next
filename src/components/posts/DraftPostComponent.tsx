import React from "react";
import { inferQueryOutput } from "../../utils/trpc";
import PostHeader from "./PostHeader";
import PostImage from "./PostImage";
import PostTitle from "./PostTitle";
import DraftInteractivePanel from "../DraftInteractivePanel";

export type DraftPostComponentProps = {
  draft: NonNullable<inferQueryOutput<"post.drafts">[0]>;
};

const DraftPostComponent: React.FC<DraftPostComponentProps> = ({
  draft: draft,
}) => {
  return (
    <div className="mb-8 flex flex-col bg-base-200 shadow">
      <PostHeader
        date={draft.createdAt}
        image={draft.user.image}
        username={draft.user.name}
      />

      <PostTitle
        title={draft.title}
        link={`/create-post?draftId=${draft.id}`}
      />

      {draft.image && (
        <PostImage
          image={draft.image}
          link={`/create-post?draftId=${draft.id}`}
        />
      )}
      <DraftInteractivePanel draftId={draft.id} />
    </div>
  );
};

export default DraftPostComponent;
