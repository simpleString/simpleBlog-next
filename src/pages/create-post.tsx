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
import SelectPostCommunity from "../components/editor/SelectPostCommunity";
import { MenuBar } from "../components/editor/MenuBar";
import { Layout } from "../layouts/Layout";
import LoadingSpinner from "../components/LoadingSpinner";
import { trpc } from "../utils/trpc";
import type { NextPageWithLayout } from "./_app";
import { User } from "next-auth";

export type CommunityProps = {
  type: "community";
  id: string;
  img: string;
  title: string;
};

export type UserBlogProps = {
  type: "user";
  userId: string;
  img: string;
  title: string;
};

const CreatePost: NextPageWithLayout<React.FC> = () => {
  const session = useSession({ required: true });

  const utils = trpc.useContext();
  const createPost = trpc.useMutation(["post.createPost"], {
    onSuccess() {
      utils.invalidateQueries(["post.posts"]);
    },
  });
  const router = useRouter();

  const [content, setContent] = useState<JSONContent>();
  const [postTitle, setPostTitle] = useState("");

  const [currentCommunity, setCurrentCommunity] = useState<
    CommunityProps | UserBlogProps
  >();

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
    // onUpdate({ editor }) {
    //   const item = editor.getJSON();
    //   setContent(item);
    // },
    content,
    editorProps: {
      attributes: {
        class:
          "prose prose-sm sm:prose lg:prose-lg xl:prose-2xl focus:outline-none pb-4 m-5 min-h-[200px]",
      },
    },
  });
  //TODO: refactor this!!!
  useEffect(() => {
    if (editor) {
      try {
        editor.commands?.setContent(content || "");
      } catch (error) {}
    }
  }, [content, editor]);

  if (session.status === "loading") return <LoadingSpinner />;

  return (
    <>
      <div className="mt-7 shadow p-4">
        <div className="w-1/3">
          <SelectPostCommunity
            currentCommunity={currentCommunity}
            setCurrentCommunity={setCurrentCommunity}
            user={session.data.user as User}
          />
        </div>
        <div className="w-full">
          <input
            className="input input-bordered w-full my-4"
            placeholder="Title"
            value={postTitle}
            onChange={(e) => setPostTitle(e.target.value)}
          />
        </div>
        <div className="shadow">
          <MenuBar editor={editor} />
          <EditorContent editor={editor} />
        </div>
      </div>
      <div className="max-w-3xl space-x-2 my-4">
        <button
          disabled={!postTitle || !currentCommunity}
          className="btn btn-primary"
        >
          Save
        </button>
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
