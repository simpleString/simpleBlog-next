import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { ReactElement, useCallback } from "react";
import LoadingSpinner from "../components/LoadingSpinner";
import PostEditor from "../components/editor/PostEditor";
import { Layout } from "../layouts/Layout";
import { trpc } from "../utils/trpc";
import type { NextPageWithLayout } from "./_app";

import { CreatePostType } from "../types/frontend";

const CreatePost: NextPageWithLayout<React.FC> = () => {
  const session = useSession({ required: true });

  const router = useRouter();

  const draftId = router.query.draftId as string | undefined;

  const utils = trpc.useContext();

  const createPostMutation = trpc.useMutation(["post.createPost"], {
    onSuccess() {
      utils.invalidateQueries(["post.posts"]);
    },
  });
  const draftMutation = trpc.useMutation(["post.draftPost"], {});

  const { data: draftData } = trpc.useQuery(
    ["post.draft", { id: draftId ?? "" }],
    {
      enabled: !!draftId,
    }
  );

  const savePost = useCallback(
    async ({ title, text, image }: CreatePostType) => {
      await createPostMutation.mutateAsync({
        text,
        image,
        title,
      });

      router.push("/");
    },
    [createPostMutation, router]
  );

  const saveDraft = useCallback(
    async ({ title, text, image }: CreatePostType) => {
      const draftedPost = await draftMutation.mutateAsync({
        id: draftId,
        text,
        title,
        image,
      });

      if (!draftId) {
        router.push(`/create-post?draftId=${draftedPost.id}`, undefined, {
          scroll: false,
        });
      }
    },
    [draftId, draftMutation, router]
  );

  if (session.status === "loading") return <LoadingSpinner />;

  return (
    <>
      {draftData ? (
        <PostEditor
          key={"props"}
          savePost={savePost}
          saveDraft={saveDraft}
          image={draftData?.image}
          text={draftData?.text}
          title={draftData?.title}
        />
      ) : (
        <div>
          <PostEditor
            key={"without"}
            savePost={savePost}
            saveDraft={saveDraft}
          />
        </div>
      )}
    </>
  );
};

CreatePost.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>;
};

export default CreatePost;

