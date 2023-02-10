import Document from "@tiptap/extension-document";
import Highlight from "@tiptap/extension-highlight";
import ImageTipTap from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import Typography from "@tiptap/extension-typography";
import { EditorContent, JSONContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useSession } from "next-auth/react";
import NextLink from "next/link";
import { useRouter } from "next/router";
import { FormEvent, ReactElement, useEffect, useState } from "react";
import SelectPostCommunity from "../components/editor/SelectPostCommunity";
import { MenuBar } from "../components/editor/MenuBar";
import { Layout } from "../layouts/Layout";
import LoadingSpinner from "../components/LoadingSpinner";
import { trpc } from "../utils/trpc";
import type { NextPageWithLayout } from "./_app";
import { User } from "next-auth";
import { SupabaseBackets } from "../constants/supabase";
import { fileUploader } from "../utils/fileUploader";
import Image from "next/image";
import { CloseIcon } from "../components/Svg";

const CreatePost: NextPageWithLayout<React.FC> = () => {
  const session = useSession({ required: true });

  const utils = trpc.useContext();
  const createPostMutation = trpc.useMutation(["post.createPost"], {
    onSuccess() {
      utils.invalidateQueries(["post.posts"]);
    },
  });
  const router = useRouter();

  const onButtonSaveClick = async () => {
    await createPostMutation.mutateAsync({
      text: content?.text || postTitle,
      image: postImage,
      title: postTitle,
    });

    router.push("/");
  };

  const onButtonClearImageClick = () => {
    setPostImage("");
  };

  const onFileChange = async (e: FormEvent<HTMLInputElement>) => {
    const file = e.currentTarget.files?.[0];
    if (!file) return;

    const photoUrl = await fileUploader({
      file,
      backet: SupabaseBackets.FILE,
    });

    setPostImage(photoUrl);
  };

  const [postImage, setPostImage] = useState("");
  const [content, setContent] = useState<JSONContent>();
  const [postTitle, setPostTitle] = useState("");

  const editor = useEditor({
    extensions: [
      StarterKit,
      Highlight,
      Typography,
      Document,
      ImageTipTap,
      Placeholder.configure({
        emptyEditorClass:
          "before:content-[attr(data-placeholder)] before:float-left before:text-gray-400 before:pointer-events-none before:h-0 ",
        placeholder: "Text(optional)",
      }),
    ],
    content,
    editorProps: {
      attributes: {
        class:
          "prose prose-sm focus:outline-none p-4 min-h-[200px] prose-img:my-1 prose-img:w-full max-w-none prose-headings:my-1 prose-p:my-1",
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
      <div className="shadow sm:p-4 space-y-4">
        <div className="w-full">
          <input
            className="input input-bordered w-full "
            placeholder="Title"
            value={postTitle}
            onChange={(e) => setPostTitle(e.target.value)}
          />
        </div>
        <div className="flex items-center justify-center">
          {postImage && (
            <div className="indicator">
              <label
                onClick={onButtonClearImageClick}
                className="top-3 right-6 indicator-item badge cursor-pointer badge-secondary hover:bg-secondary-focus"
              >
                <CloseIcon />
              </label>
              <Image
                src={postImage}
                alt="Post image"
                width="200px"
                height="200px"
                objectFit="fill"
              />
            </div>
          )}
          {!postImage && (
            <label className="flex flex-col w-full h-32 border-4 border-blue-200 border-dashed hover:bg-gray-100 hover:border-gray-300">
              <div className="flex flex-col items-center justify-center pt-7">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-8 h-8 text-gray-400 group-hover:text-gray-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
                <p className="pt-1 text-sm tracking-wider text-gray-400 group-hover:text-gray-600">
                  Upload photo
                </p>
              </div>
              <input
                type="file"
                className="opacity-0"
                onChange={onFileChange}
                accept="image/png, image/jpeg"
              />
            </label>
          )}
        </div>
        <div className="shadow">
          <MenuBar editor={editor} />
          <EditorContent editor={editor} />
        </div>
      </div>
      <div className="mx-4 sm:mx-0 space-x-2 my-4">
        <button
          disabled={!postTitle}
          className="btn btn-primary"
          onClick={onButtonSaveClick}
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
