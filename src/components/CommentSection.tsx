import PencilIcon from "@heroicons/react/24/outline/PencilIcon";
import { Comment, Like, Post, Tag, User } from "@prisma/client";
import { useSession } from "next-auth/react";
import NextImage from "next/image";
import router from "next/router";
import { useState } from "react";
import { getBaseUrl } from "../pages/_app";
import { trpc } from "../utils/trpc";
import CustomTextarea from "./custom/CustomTextarea";

type CommentSectionProps = {
  post:
    | (Post & {
        likes: Like[];
        comments: (Comment & {
          user: User;
        })[];
        tag: Tag[];
      })
    | null
    | undefined;
};

const CommentSection: React.FC<CommentSectionProps> = ({ post }) => {
  const session = useSession();

  const utils = trpc.useContext();
  const updateComment = trpc.useMutation(["comment.updateComment"], {
    onSuccess() {
      utils.invalidateQueries(["post.post", { postId: post?.id || "" }]);
    },
  }); //TODO: Make optimistic update!!!
  const createComment = trpc.useMutation(["comment.createComment"], {
    onSuccess() {
      utils.invalidateQueries(["post.post", { postId: post?.id || "" }]);
    },
  });

  const [commentIndex, setCommentIndex] = useState<number>(-1);
  const [comment, setComment] = useState("");
  const [editableComment, setEditableComment] = useState("");

  return (
    <>
      <div className="border border-gray-800 mb-4 ">
        <CustomTextarea
          value={comment}
          placeholder="Write your comment here..."
          onChange={(e) => {
            {
              setComment(e.target.value || "");
            }
          }}
        />
        <div className="flex justify-end pb-4">
          <button
            onClick={async () => {
              if (session.status !== "authenticated") {
                router.push(
                  "/api/auth/signin?error=SessionRequired&callbackUrl=" +
                    getBaseUrl() +
                    "/post/" +
                    post?.id
                );
              } else if (session.status === "authenticated" && post)
                if (comment.length > 0) {
                  await createComment.mutateAsync({
                    postId: post.id,
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
        {post?.comments.map((c, index) => (
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
              <div className="border border-gray-800 mb-4 ">
                <CustomTextarea
                  className="bg-inherit"
                  placeholder="Write your comment here..."
                  value={editableComment}
                  onChange={(e) => setEditableComment(e.target.value || "")}
                />
                <div className="flex justify-end pb-4">
                  <button
                    onClick={async () => {
                      if (session.status !== "authenticated") {
                        router.push(
                          "/api/auth/signin?error=SessionRequired&callbackUrl=" +
                            getBaseUrl() +
                            "/post/" +
                            post?.id
                        );
                      } else if (session.status === "authenticated" && post)
                        if (editableComment.length > 0) {
                          await updateComment.mutateAsync({
                            postId: post.id,
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
    </>
  );
};

export default CommentSection;
