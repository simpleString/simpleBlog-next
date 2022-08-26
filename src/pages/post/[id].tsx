import ChatBubbleLeftIcon from "@heroicons/react/24/outline/ChatBubbleLeftIcon";
import ChevronDown from "@heroicons/react/24/outline/ChevronDownIcon";
import ChevronUp from "@heroicons/react/24/outline/ChevronUpIcon";
import Document from "@tiptap/extension-document";
import Highlight from "@tiptap/extension-highlight";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import Typography from "@tiptap/extension-typography";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useSession } from "next-auth/react";
import NextImage from "next/image";
import { useRouter } from "next/router";
import { useState } from "react";
import { trpc } from "../../utils/trpc";
import { getBaseUrl } from "../_app";

const Post: React.FC = () => {
  const router = useRouter();

  const postId = router.query.id as string;
  const post = trpc.useQuery(["post.post", { postId }]);
  const [comment, setComment] = useState("");
  const session = useSession();
  const utils = trpc.useContext();
  const createComment = trpc.useMutation(["post.createComment"], {
    onSuccess() {
      utils.invalidateQueries(["post.post"]);
    },
  });
  const createLike = trpc.useMutation(["post.createLike"], {
    onSuccess() {
      utils.invalidateQueries(["post.post"]);
    },
  });

  const isAuthAndDataExists = (): boolean => {
    if (!session.data) {
      router.push(
        "/api/auth/signin?error=SessionRequired&callbackUrl=" +
          getBaseUrl() +
          "/post/" +
          postId
      );
    }
    if (post.data) {
      return true;
    }
    return false;
  };

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
    content: post.data && post.data.text ? JSON.parse(post.data.text) : "",
    editorProps: {
      attributes: {
        class:
          "prose prose-sm sm:prose lg:prose-lg xl:prose-2xl m-5 focus:outline-none",
      },
    },
  });

  if (post.isFetching) {
    console.log("loading");

    return <div>Loading...</div>;
  }

  return (
    <div className="max-w-3xl  mx-auto space-y-2">
      <div className="border-2 border-black ">
        <EditorContent
          content={
            post.isFetching
              ? ""
              : post.data && post.data.text
              ? JSON.parse(post.data.text)
              : ""
          }
          className=""
          editor={editor}
        />
      </div>

      <div className="flex p-4 items-center border-2 border-black ">
        <div className="motion-safe:hover:scale-105 duration-500 flex items-center group">
          <ChatBubbleLeftIcon className="w-6 h-6 mr-2 group-hover:fill-current" />
          <span>{post.data?.commentsCount}</span>
        </div>
        <div className="ml-auto flex items-center">
          <ChevronDown
            onClick={async () => {
              if (isAuthAndDataExists()) {
                await createLike.mutateAsync({
                  isPositive: false,
                  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                  postId: post.data!.id,
                });
              }
            }}
            className={`${
              !post.data?.likes[0]?.isPositive
                ? "text-red-700"
                : "hover:text-red-900 cursor-pointer motion-safe:hover:scale-105 duration-500 motion-safe:hover:translate-y-1.5"
            }
              w-6 h-6 `}
          />
          <span>{post.data?.likesValue}</span>
          <ChevronUp
            onClick={async () => {
              if (isAuthAndDataExists()) {
                await createLike.mutateAsync({
                  isPositive: true,
                  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                  postId: post.data!.id,
                });
              }
            }}
            className={`${
              post.data?.likes[0]?.isPositive
                ? "text-green-700"
                : "hover:text-green-900 cursor-pointer motion-safe:hover:scale-105 duration-500 motion-safe:hover:-translate-y-1.5"
            }
              w-6 h-6 `}
          />
        </div>
      </div>
      <div className="border border-gray-800 rounded-md mb-4 ">
        <textarea
          className="min-w-full resize-y border-none focus:border-none"
          value={comment}
          onChange={(e) => setComment(e.target.value || "")}
        />
        <div className="flex justify-end pb-4">
          <button
            onClick={async () => {
              if (isAuthAndDataExists())
                if (comment.length > 0) {
                  await createComment.mutateAsync({
                    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                    postId: post.data!.id,
                    text: comment,
                  });
                  setComment("");
                }
            }}
            className="mr-2 px-3 border rounded border-black font-semibold text-lg bg-yellow-300 hover:bg-yellow-500 "
          >
            Comment
          </button>
        </div>
      </div>
      <div className="">
        {post.data?.comments.map((comment, index) => (
          <div
            key={index}
            className="flex flex-col border border-black odd:bg-yellow-100"
          >
            <div className="flex">
              <div>
                <NextImage
                  alt="Avatar"
                  src={comment.user.image || "/user-placeholder.jpg"}
                  width="32"
                  height="32"
                  className="rounded-full"
                />
              </div>
              <div>
                <div>{comment.user.name}</div>
                <div>{comment.createdAt.toLocaleTimeString()}</div>
              </div>
            </div>
            <div className="">{comment.text}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Post;
