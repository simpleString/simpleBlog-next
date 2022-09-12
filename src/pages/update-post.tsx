import { JSONContent } from "@tiptap/react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { ReactElement, useEffect, useState } from "react";
import { Layout } from "../components/Layout";
import Tiptap from "../components/Tiptap";
import { trpc } from "../utils/trpc";
import { NextPageWithLayout } from "./_app";

const UpdatePost: NextPageWithLayout<React.FC> = () => {
  useSession({ required: true });
  const router = useRouter();

  const [content, setContent] = useState<JSONContent>();
  const postId = router.query.id as string;

  const utils = trpc.useContext();

  const post = trpc.useQuery(["post.post", { postId }]);
  const updatePost = trpc.useMutation(["post.updatePost"], {
    onSuccess() {
      utils.invalidateQueries(["post.post", { postId }]);
      utils.invalidateQueries(["post.posts"]);
    },
  }); //TODO: Do optimistic mutation

  useEffect(() => {
    if (post.data && post.data.text) setContent(JSON.parse(post.data.text));
  }, [post?.data]);

  return (
    <Tiptap
      content={content}
      setContent={setContent}
      tags={[]}
      onSave={async (data) => {
        await updatePost.mutateAsync({
          id: post.data?.id || "",
          img: data.img,
          text: JSON.stringify(content) || data.title,
          title: data.title,
        });
        router.push("/");
      }}
    />
  );
};

UpdatePost.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>;
};

export default UpdatePost;
