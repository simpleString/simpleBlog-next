import { JSONContent } from "@tiptap/react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Tiptap from "../components/Tiptap";
import { trpc } from "../utils/trpc";

const UpdatePost: React.FC = () => {
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
    <div className="container mx-auto mt-10 h-screen">
      <Tiptap
        content={content}
        setContent={setContent}
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
    </div>
  );
};

export default UpdatePost;
