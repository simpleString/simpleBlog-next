import PencilIcon from "@heroicons/react/24/outline/PencilIcon";
import { Comment, User } from "@prisma/client";
import { useSession } from "next-auth/react";
import NextImage from "next/image";
import { useState } from "react";
import { trpc } from "../utils/trpc";
import CustomButton from "./custom/CustomButton";
import CustomTextarea from "./custom/CustomTextarea";
import { useIsAuth } from "./hooks/isAuth";

type CommentRowProps = {
  comment:
    | Comment & {
        user: User;
        childrenComments?: (Comment & {
          user: User;
        })[];
      };
};
// | {
//     comment: Comment & {
//       user: User;
//     };
//   };

type CommentStateStatus = {
  comment: string;
  index: string;
};

const CommentRow: React.FC<CommentRowProps> = ({ comment }) => {
  const session = useSession();
  const checkIsAuth = useIsAuth("/post/" + comment.postId);

  const utils = trpc.useContext();

  const getMessageByParentId = trpc.useQuery(
    ["comment.getAllCommentsByMainCommentId", { mainCommentId: comment.id }],
    { enabled: false }
  );

  const updateComment = trpc.useMutation(["comment.updateComment"], {
    async onSuccess() {
      if (comment.mainCommentId) {
        utils.refetchQueries([
          "comment.getAllCommentsByMainCommentId",
          { mainCommentId: comment.mainCommentId },
        ]);
      }
      utils.invalidateQueries(["post.post", { postId: comment.postId }]);
    },
  }); //TODO: Make optimistic update!!!
  const createComment = trpc.useMutation(["comment.createComment"], {
    async onSuccess() {
      if (comment.mainCommentId) {
        utils.refetchQueries([
          "comment.getAllCommentsByMainCommentId",
          { mainCommentId: comment.mainCommentId },
        ]);
        getMessageByParentId.refetch();
        setIsChilderOpen(true);
      }
      utils.invalidateQueries(["post.post", { postId: comment.postId }]);
    },
  });

  const [editableComment, setEditableComment] = useState<CommentStateStatus>({
    comment: "",
    index: "",
  });

  const [commentChain, setCommentChain] = useState<CommentStateStatus>({
    comment: "",
    index: "",
  });

  const [isChilderOpen, setIsChilderOpen] = useState(
    comment.childrenComments ? true : false
  );

  return (
    <>
      <div className="flex items-center">
        <div className="mr-2">
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
        {comment.userId === session.data?.user?.id ? (
          <div
            className="ml-auto pr-2 motion-safe:hover:scale-105 duration-500 text-center group cursor-pointer"
            onClick={() => {
              if (editableComment.index === comment.id) {
                setEditableComment({ ...editableComment, index: "" });
              } else {
                setEditableComment({
                  comment: comment.text,
                  index: comment.id,
                });
              }
            }}
          >
            <a>Edit</a>
            <PencilIcon className="h-6 w-6 ml-2 inline-block" />
          </div>
        ) : null}
      </div>
      {editableComment.index === comment.id ? (
        <div className="border border-gray-800 mb-4 ">
          <CustomTextarea
            className="bg-inherit"
            placeholder="Write your comment here..."
            value={editableComment.comment}
            onChange={(e) =>
              setEditableComment({
                ...editableComment,
                comment: e.target.value || "",
              })
            }
          />
          <div className="flex justify-end pb-4">
            <CustomButton
              onClick={async () => {
                checkIsAuth();
                if (editableComment.comment.length > 0) {
                  await updateComment.mutateAsync({
                    postId: comment.id,
                    id: comment.id,
                    text: editableComment.comment,
                  });
                  setEditableComment({ comment: "", index: "" });
                }
              }}
            >
              Update
            </CustomButton>
          </div>
        </div>
      ) : (
        <>
          <div>{comment.text}</div>
          <div>
            <span
              className="cursor-pointer hover:text-blue-200"
              onClick={() => {
                if (commentChain.index === comment.id) {
                  setCommentChain({ ...commentChain, index: "" });
                } else {
                  setCommentChain({ ...commentChain, index: comment.id });
                }
              }}
            >
              Reply
            </span>
          </div>
          {commentChain.index === comment.id ? (
            <div className="border border-gray-800 mb-4 ">
              <CustomTextarea
                className="bg-inherit"
                placeholder="Write your comment here..."
                value={commentChain.comment}
                onChange={(e) => {
                  {
                    setCommentChain({
                      ...commentChain,
                      comment: e.target.value || "",
                    });
                  }
                }}
              />
              <div className="flex justify-end pb-4">
                <CustomButton
                  variant="secondary"
                  onClick={async () => {
                    checkIsAuth();
                    if (commentChain.comment.length > 0) {
                      await createComment.mutateAsync({
                        postId: comment.postId,
                        text: commentChain.comment,
                        mainCommentId: commentChain.index, //TODO: FIx it
                      });
                      setCommentChain({ comment: "", index: "" });
                    }
                  }}
                >
                  Comment
                </CustomButton>
              </div>
            </div>
          ) : null}

          <div
            className="cursor-pointer text-xl hover:text-red-500"
            onClick={async () => {
              if (!isChilderOpen) {
                await getMessageByParentId.refetch();
              }
              setIsChilderOpen(!isChilderOpen);
            }}
          >
            {comment.childrenCount}
          </div>

          {isChilderOpen ? (
            <>
              {comment.childrenComments?.map((comment) => (
                <div className="ml-8" key={comment.id}>
                  <CommentRow comment={comment} />
                </div>
              ))}

              {comment.mainCommentId &&
                getMessageByParentId.data?.map((comment) => (
                  <div className="ml-8" key={comment.id}>
                    <CommentRow comment={comment} />
                  </div>
                ))}
            </>
          ) : null}
        </>
      )}
    </>
  );
};

export default CommentRow;
