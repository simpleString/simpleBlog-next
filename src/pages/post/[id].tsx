import ChatBubbleLeftIcon from "@heroicons/react/24/outline/ChatBubbleLeftIcon";
import ChevronDownIcon from "@heroicons/react/24/outline/ChevronDownIcon";
import ChevronUpIcon from "@heroicons/react/24/outline/ChevronUpIcon";
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
import { useEffect, useState } from "react";
import { trpc } from "../../utils/trpc";
import { getBaseUrl } from "../_app";
import PencilIcon from "@heroicons/react/24/outline/PencilIcon";
import NextLink from "next/link";

const Post: React.FC = () => {
  const router = useRouter();

  const postId = router.query.id as string;
  const post = trpc.useQuery(["post.post", { postId }]);

  const session = useSession();
  const utils = trpc.useContext();
  const updateComment = trpc.useMutation(["post.updateComment"], {
    onSuccess() {
      utils.invalidateQueries(["post.post", { postId }]);
    },
  }); //TODO: Make optimistic update!!!
  const createComment = trpc.useMutation(["post.createComment"], {
    onSuccess() {
      utils.invalidateQueries(["post.post", { postId }]);
    },
  });

  const createLike = trpc.useMutation(["post.like"], {
    onSuccess() {
      utils.invalidateQueries(["post.post"]);
    },
  });

  const [commentIndex, setCommentIndex] = useState<number>(-1);
  const [comment, setComment] = useState("");
  const [editableComment, setEditableComment] = useState("");

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

  if (post.isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-2 mb-5">
      <div className="border-2 border-black ">
        <EditorContent className="" editor={editor} />
      </div>

      <div className="flex p-4 items-center border-2 border-black ">
        <div className="motion-safe:hover:scale-105 duration-500 flex items-center group">
          <ChatBubbleLeftIcon className="w-6 h-6 mr-2 group-hover:fill-current" />
          <span>{post.data?.commentsCount}</span>
        </div>
        {post.data?.userId === session.data?.user?.id ? (
          <NextLink
            href={{ pathname: "/update-post", query: { id: post.data?.id } }}
            passHref
          >
            <div className="ml-auto motion-safe:hover:scale-105 duration-500 text-center group cursor-pointer">
              <a>Edit</a>
              <PencilIcon className="h-6 w-6 ml-2 inline-block" />
            </div>
          </NextLink>
        ) : null}
        <div className="ml-auto flex items-center">
          <ChevronDownIcon
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
              !post.data?.likes[0]?.isPositive &&
              post.data?.likes[0]?.isPositive !== null
                ? "text-red-700"
                : "hover:text-red-900  motion-safe:hover:scale-105 duration-500 motion-safe:hover:translate-y-1.5"
            }
              w-6 h-6 cursor-pointer`}
          />
          <span>{post.data?.likesValue}</span>
          <ChevronUpIcon
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
                : "hover:text-green-900  motion-safe:hover:scale-105 duration-500 motion-safe:hover:-translate-y-1.5"
            }
              w-6 h-6 cursor-pointer `}
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
        {post.data?.comments.map((c, index) => (
          <div
            key={index}
            className="flex flex-col border border-black p-2 odd:bg-yellow-100"
          >
            <div className="flex items-center">
              <div className="mr-2">
                <NextImage
                  alt="Avatar"
                  src={c.user.image || "/user-placeholder.jpg"}
                  width="32"
                  height="32"
                  className="rounded-full"
                />
              </div>
              <div>
                <div>{c.user.name}</div>
                <div>{c.createdAt.toLocaleTimeString()}</div>
              </div>
              {c.userId === session.data?.user?.id ? (
                <div
                  className="ml-auto pr-2 motion-safe:hover:scale-105 duration-500 text-center group cursor-pointer"
                  onClick={() => {
                    if (commentIndex >= 0) {
                      setCommentIndex(-1);
                    } else {
                      setCommentIndex(index);
                      setEditableComment(c.text);
                    }
                  }}
                >
                  <a>Edit</a>
                  <PencilIcon className="h-6 w-6 ml-2 inline-block" />
                </div>
              ) : null}
            </div>
            {commentIndex === index ? (
              <div className="border border-gray-800 rounded-md mb-4 ">
                <textarea
                  className="min-w-full resize-y border-none focus:border-none"
                  value={editableComment}
                  onChange={(e) => setEditableComment(e.target.value || "")}
                />
                <div className="flex justify-end pb-4">
                  <button
                    onClick={async () => {
                      if (isAuthAndDataExists())
                        if (editableComment.length > 0) {
                          await updateComment.mutateAsync({
                            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                            postId: post.data!.id,
                            id: c.id,
                            text: editableComment,
                          });
                          setEditableComment("");
                          setCommentIndex(-1);
                        }
                    }}
                    className="mr-2 px-3 border rounded border-black font-semibold text-lg bg-yellow-300 hover:bg-yellow-500 "
                  >
                    Update
                  </button>
                </div>
              </div>
            ) : (
              <div className="">{c.text}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Post;
