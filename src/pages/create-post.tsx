import Document from "@tiptap/extension-document";
import Highlight from "@tiptap/extension-highlight";
import ImageTipTap from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import Typography from "@tiptap/extension-typography";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useSession } from "next-auth/react";
import Image from "next/image";
import NextLink from "next/link";
import { useRouter } from "next/router";
import { FormEvent, ReactElement, useEffect, useState } from "react";
import { MenuBar } from "../components/editor/MenuBar";
import PostEditor from "../components/editor/PostEditor";
import LoadingSpinner from "../components/LoadingSpinner";
import { CloseIcon } from "../components/Svg";
import { SupabaseBackets } from "../constants/supabase";
import { Layout } from "../layouts/Layout";
import { fileUploader } from "../utils/fileUploader";
import { trpc } from "../utils/trpc";
import updatePost from "./update-post";
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
