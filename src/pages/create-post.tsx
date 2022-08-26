import { JSONContent } from "@tiptap/react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useState } from "react";
import Tiptap from "../components/Tiptap";
import { trpc } from "../utils/trpc";

const CreatePost: React.FC = () => {
  useSession({ required: true });
  const [content, setContent] = useState<JSONContent>();
  const createPost = trpc.useMutation(["post.create-posts"]);
  const router = useRouter();

  return (
    <div className="container mx-auto mt-10 h-screen">
      <Tiptap
        content={content}
        setContent={setContent}
        onSave={async (data) => {
          await createPost.mutateAsync({
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

export default CreatePost;
