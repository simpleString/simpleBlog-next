import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { ReactElement } from "react";
import PostEditor from "../components/editor/PostEditor";
import LoadingSpinner from "../components/LoadingSpinner";
import { Layout } from "../layouts/Layout";
import { trpc } from "../utils/trpc";
import { NextPageWithLayout } from "./_app";
import { CreatePostType } from "../types/frontend";

const UpdatePost: NextPageWithLayout<React.FC> = () => {
  const session = useSession({ required: true });
  const router = useRouter();

  const postId = router.query.id as string;

  const utils = trpc.useContext();

  const { data: post } = trpc.useQuery(["post.post", { postId }]);
  const updatePostMutation = trpc.useMutation(["post.updatePost"], {
    onSuccess() {
      utils.invalidateQueries(["post.post", { postId }]);
      utils.invalidateQueries(["post.posts"]);
    },
  });

  const updatePost = ({ title, text, image }: CreatePostType) => {
    if (!post) return;
    updatePostMutation.mutateAsync({ id: post.id, image, text, title });
    router.back();
  };

  if (session.status === "loading") return <LoadingSpinner />;

  return (
    <>
      {post && (
        <PostEditor
          image={post.image}
          text={post.text}
          title={post.title}
          savePost={updatePost}
        />
      )}
    </>
  );
};

UpdatePost.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>;
};

export default UpdatePost;

