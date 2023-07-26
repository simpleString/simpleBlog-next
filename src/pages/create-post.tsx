import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { ReactElement, useCallback, useEffect, useRef } from "react";
import LoadingSpinner from "../components/LoadingSpinner";
import PostEditor from "../components/editor/PostEditor";
import { Layout } from "../layouts/Layout";
import { trpc } from "../utils/trpc";
import type { NextPageWithLayout } from "./_app";

import { toast } from "react-toastify";
import { CreatePostType } from "../types/frontend";
import MetaHead from "../components/MetaHead";

const CreatePost: NextPageWithLayout<React.FC> = () => {
  const session = useSession({ required: true });

  const router = useRouter();

  const mounted = useRef(false);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const draftId = router.query.draftId as string | undefined;

  const utils = trpc.useContext();

  const createPostMutation = trpc.useMutation(["post.createPost"], {
    onSuccess() {
      utils.invalidateQueries(["post.posts"]);
      utils.invalidateQueries(["post.drafts"]);
    },
  });
  const draftMutation = trpc.useMutation(["post.draftPost"], {
    onSuccess(draft) {
      utils.invalidateQueries(["post.drafts"]);
      utils.setQueryData(["post.draft", { id: draft.id }], draft);
    },
  });

  const { data: draftData, isLoading } = trpc.useQuery(
    ["post.draft", { id: draftId ?? "" }],
    {
      enabled: !!draftId,
      retry: false,
    }
  );

  const savePost = useCallback(
    async ({ title, text, image }: CreatePostType) => {
      await createPostMutation.mutateAsync({
        draftId,
        text,
        image,
        title,
      });

      router.push("/");
    },
    [createPostMutation, draftId, router]
  );

  const saveDraft = useCallback(
    async ({ title, text, image }: CreatePostType) => {
      if (!mounted.current) return;

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
        toast.success("Draft created");
      }
    },

    [draftId, draftMutation, router]
  );

  if (session.status === "loading" || isLoading) return <LoadingSpinner />;

  return (
    <>
      <MetaHead
        pageTitle="Create post"
        description="Post creating for simplestring blog"
        author={session.data.user?.name ?? undefined}
      />

      {draftData ? (
        <PostEditor
          key={"editor"}
          savePost={savePost}
          saveDraft={saveDraft}
          image={draftData?.image ?? null}
          text={draftData?.text ?? ""}
          title={draftData?.title ?? ""}
        />
      ) : (
        <PostEditor
          key={"notEditor"}
          savePost={savePost}
          saveDraft={saveDraft}
          image={null}
          text={""}
          title={""}
        />
      )}
    </>
  );
};

CreatePost.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>;
};

export default CreatePost;
