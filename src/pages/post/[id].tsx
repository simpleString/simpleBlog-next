import Document from "@tiptap/extension-document";
import Highlight from "@tiptap/extension-highlight";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import Typography from "@tiptap/extension-typography";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useRouter } from "next/router";
import { ReactElement, useEffect } from "react";
import ContentLoader from "react-content-loader";
import CommentSection from "../../components/CommentSection";
import InteractivePanel from "../../components/InteractivePanel";
import { Layout } from "../../components/Layout";
import { trpc } from "../../utils/trpc";
import { NextPageWithLayout } from "../_app";

const HeadBodyGrid = (props: any) => (
  <ContentLoader
    speed={2}
    viewBox="0 0 400 460"
    backgroundColor="#f3f3f3"
    foregroundColor="#ecebeb"
    {...props}
  >
    <rect x="15" y="15" rx="4" ry="4" width="350" height="25" />
    <rect x="15" y="50" rx="2" ry="2" width="350" height="250" />
    <rect x="508" y="535" rx="2" ry="2" width="170" height="20" />
    <rect x="581" y="526" rx="2" ry="2" width="170" height="20" />
  </ContentLoader>
);

const Post: NextPageWithLayout<React.FC> = () => {
  const router = useRouter();

  const postId = router.query.id as string;
  const post = trpc.useQuery(["post.post", { postId }]);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        document: false,
      }),
      Highlight,
      Typography,
      Document,
      Image,
      Placeholder,
    ],
    editable: false,
    content: "",
    editorProps: {
      attributes: {
        class:
          "prose prose-sm sm:prose lg:prose-lg xl:prose-2xl m-5 focus:outline-none",
      },
    },
  });

  useEffect(() => {
    editor?.commands.setContent(
      post.data && post.data.text ? JSON.parse(post.data.text) : ""
    );
  }, [editor, post.data]);

  return (
    <div className="max-w-3xl mx-auto space-y-2 mb-5">
      <div className="flex flex-col border-2 border-black ">
        {post.isLoading ? (
          <HeadBodyGrid className="min-w-full" />
        ) : (
          <EditorContent editor={editor} />
        )}
      </div>

      <InteractivePanel post={post.data} />
      <CommentSection post={post.data} />
    </div>
  );
};

Post.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>;
};

export default Post;
