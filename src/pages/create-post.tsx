import { JSONContent } from "@tiptap/react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { ReactElement, useState } from "react";
import { Layout } from "../components/Layout";
import Tiptap from "../components/Tiptap";
import { trpc } from "../utils/trpc";
import type { NextPageWithLayout } from "./_app";

const CreatePost: NextPageWithLayout<React.FC> = () => {
  useSession({ required: true });
  const [content, setContent] = useState<JSONContent>();
  const utils = trpc.useContext();
  const createPost = trpc.useMutation(["post.createPost"], {
    onSuccess() {
      utils.invalidateQueries(["post.posts"]);
    },
  });
  const router = useRouter();

  return (
    <Tiptap
      content={content}
      setContent={setContent}
      tags={[]}
      onSave={async (data) => {
        await createPost.mutateAsync({
          img: data.img,
          text: JSON.stringify(content) || data.title,
          title: data.title,
        });
        router.push("/");
      }}
    />
  );
};

CreatePost.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>;
};

export default CreatePost;
