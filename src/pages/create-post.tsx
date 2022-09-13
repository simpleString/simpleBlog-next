import Document from "@tiptap/extension-document";
import Highlight from "@tiptap/extension-highlight";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import Typography from "@tiptap/extension-typography";
import { EditorContent, JSONContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useSession } from "next-auth/react";
import NextLink from "next/link";
import { useRouter } from "next/router";
import { ReactElement, useEffect, useState } from "react";
import { Layout } from "../components/Layout";
import { MenuBar } from "../components/MenuBar";
import { trpc } from "../utils/trpc";
import type { NextPageWithLayout } from "./_app";
import Select from "react-select";
import NextImage from "next/image";
import LoadingSpinner from "../components/LoadingSpinner";

const CreatePost: NextPageWithLayout<React.FC> = () => {
  useSession({ required: true });

  const utils = trpc.useContext();
  const createPost = trpc.useMutation(["post.createPost"], {
    onSuccess() {
      utils.invalidateQueries(["post.posts"]);
    },
  });
  const router = useRouter();
  const communities = trpc.useQuery(["user.communities"]);

  const [content, setContent] = useState<JSONContent>();
  const [postTitle, setPostTitle] = useState("");

  const editor = useEditor({
    extensions: [
      StarterKit,
      Highlight,
      Typography,
      Document,
      Image,
      Placeholder.configure({
        emptyEditorClass:
          "before:content-[attr(data-placeholder)] before:float-left before:text-gray-400 before:pointer-events-none before:h-0 ",
        placeholder: "Text(optional)",
      }),
    ],
    onUpdate({ editor }) {
      const item = editor.getJSON();
      setContent(item);
    },
    content,
    editorProps: {
      attributes: {
        class: "prose prose-sm sm:prose lg:prose-lg focus:outline-none m-5",
        // "prose prose-sm sm:prose lg:prose-lg xl:prose-2xl m-5 focus:outline-none",
      },
    },
  });

  useEffect(() => {
    if (editor) {
      try {
        editor.commands?.setContent(content || "");
      } catch (error) {}
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor]);

  if (communities.isLoading) {
    <LoadingSpinner />;
  }

  console.log(communities.data);

  return (
    <>
      <div className="mt-7 shadow">
        <div className="w-1/3"></div>
        <div>
          <input
            value={postTitle}
            onChange={(e) => setPostTitle(e.target.value)}
          />
        </div>
        <MenuBar editor={editor} />
        <EditorContent editor={editor} />
      </div>
      <div className="max-w-3xl space-x-2">
        <button className="btn btn-primary">Save</button>
        <NextLink href="/">
          <button className="btn btn-ghost">Close</button>
        </NextLink>
      </div>
    </>
  );
};

CreatePost.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>;
};

export default CreatePost;
