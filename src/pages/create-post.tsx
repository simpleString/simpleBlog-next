import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { ReactElement } from "react";
import PostEditor from "../components/editor/PostEditor";
import LoadingSpinner from "../components/LoadingSpinner";
import { Layout } from "../layouts/Layout";
import { trpc } from "../utils/trpc";
import type { NextPageWithLayout } from "./_app";

const CreatePost: NextPageWithLayout<React.FC> = () => {
  const session = useSession({ required: true });

  const utils = trpc.useContext();
  const createPostMutation = trpc.useMutation(["post.createPost"], {
    onSuccess() {
      utils.invalidateQueries(["post.posts"]);
    },
  });
  const router = useRouter();

  const savePost = async ({
    title,
    text,
    image,
  }: {
    title: string;
    text: string;
    image: string;
  }) => {
    await createPostMutation.mutateAsync({
      text,
      image,
      title,
    });

    router.push("/");
  };

  if (session.status === "loading") return <LoadingSpinner />;

  return (
    <>
      <PostEditor image={""} text={""} title={""} savePost={savePost} />
    </>
  );
};

CreatePost.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>;
};

export default CreatePost;
