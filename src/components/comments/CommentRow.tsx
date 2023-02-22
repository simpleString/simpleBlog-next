import { useSession } from "next-auth/react";
import NextImage from "next/image";
import { ChangeEvent, memo, useEffect, useState } from "react";
import { useIsAuthCheck } from "../../hooks/useIsAuth";
import { getLikeValue } from "../../utils/getLikeValue";
import { inferQueryOutput, trpc } from "../../utils/trpc";
import CustomTextarea from "../custom/CustomTextarea";
import LikeControlComponent from "../LikeControlComponent";

type commentType = inferQueryOutput<"comment.getCommentsByPostId">[0];
type CommentRowProps = {
  comment: commentType;
  callbackUrl: string;
  openComments?: boolean;
  isShow?: boolean;
};

type CommentStateStatus = {
  comment: string;
  index: string;
};

const CommentRow: React.FC<CommentRowProps> = ({
  comment,
  callbackUrl,
  openComments = false,
  isShow = true,
}) => {
  const session = useSession();
  const checkIsAuth = useIsAuthCheck(callbackUrl);

  const utils = trpc.useContext();

  const [editableComment, setEditableComment] = useState<CommentStateStatus>({
    comment: "",
    index: "",
  });

  const [replyComment, setReplyComment] = useState<CommentStateStatus>({
    comment: "",
    index: "",
  });

  // Open first inner comments for user comport by default
  const [isChildrenOpen, setIsChildrenOpen] = useState(false);

  useEffect(() => {
    setIsChildrenOpen(openComments);
  }, [openComments]);

  const commentsQuery = trpc.useQuery(
    ["comment.getAllCommentsByMainCommentId", { mainCommentId: comment.id }],
    { enabled: openComments }
  );

  const updateCommentMutation = trpc.useMutation(["comment.updateComment"], {
    // async onMutate(newData) {
    //   if (!comment.mainCommentId) return;
    //   await utils.cancelQuery([
    //     "comment.getAllCommentsByMainCommentId",
    //     { mainCommentId: comment.mainCommentId },
    //   ]);
    //   const previousValue = utils.getQueryData([
    //     "comment.getAllCommentsByMainCommentId",
    //     { mainCommentId: comment.mainCommentId },
    //   ]);

    //   console.log(newData);

    //   utils.setQueryData(
    //     [
    //       "comment.getAllCommentsByMainCommentId",
    //       { mainCommentId: comment.mainCommentId },
    //     ],
    //     (old) => [...old, newTodo]
    //   );

    //   // Return a context object with the snapshotted value
    //   return { previousTodos };
    // },

    // onError() {},

    async onSettled() {
      //   if (comment.mainCommentId) {
      //     utils.invalidateQueries([
      //       "comment.getAllCommentsByMainCommentId",
      //       { mainCommentId: comment.mainCommentId },
      //     ]);
      //   } else {
      //     utils.invalidateQueries([
      //       "comment.getCommentsByPostId",
      //       { postId: comment.postId },
      //     ]);
      //   }
    },
  });

  const createCommentMutation = trpc.useMutation(["comment.createComment"], {
    async onSuccess() {
      // commentsQuery.refetch();
      // if (comment.mainCommentId) {
      //   utils.refetchQueries([
      //     "comment.getAllCommentsByMainCommentId",
      //     { mainCommentId: comment.mainCommentId },
      //   ]);
      // } else {
      //   utils.invalidateQueries([
      //     "comment.getCommentsByPostId",
      //     { postId: comment.postId },
      //   ]);
      // }
      // setIsChildrenOpen(true);
    },
  });

  const createLikeMutation = trpc.useMutation(["comment.like"], {
    onMutate: async (likeData) => {
      if (comment.mainCommentId) {
        await utils.cancelQuery([
          "comment.getAllCommentsByMainCommentId",
          { mainCommentId: comment.mainCommentId },
        ]);

        const previousComments = utils.getQueryData([
          "comment.getAllCommentsByMainCommentId",
          { mainCommentId: comment.mainCommentId },
        ]);

        if (!previousComments) return;

        const optimisticUpdatedComments = previousComments.map((commentT) => {
          if (commentT.id === likeData.commentId) {
            const likesValuesObject = getLikeValue({
              previousLikeValue: commentT.commentLikes[0]?.isPositive,
              inputLikeBooleanValue: likeData.isPositive,
            });
            console.log("commentLike " + commentT.commentLikes[0]?.isPositive);
            console.log("comment Likes value " + commentT.commentLikesValue);
            console.log("comment future " + likesValuesObject.likeValue);

            console.log("likes change " + likesValuesObject.likeValueChange);

            return {
              ...commentT,
              commentLikesValue:
                commentT.commentLikesValue + likesValuesObject.likeValueChange,
              commentLikes: [
                {
                  ...commentT.commentLikes[0],
                  isPositive: likesValuesObject.likeValue,
                },
              ],
            } as unknown as commentType;
          }
          return commentT;
        });

        utils.setQueryData(
          [
            "comment.getAllCommentsByMainCommentId",
            { mainCommentId: comment.mainCommentId },
          ],
          optimisticUpdatedComments
        );
        console.log("hello there");

        console.log(comment.commentLikesValue);

        console.log(optimisticUpdatedComments);

        return { previousComments };
      } else {
        // await utils.cancelQuery([
        //   "comment.getCommentsByPostId",
        //   { postId: comment.postId },
        // ]);
        // const previousComments = utils.getQueryData([
        //   "comment.getCommentsByPostId",
        //   { postId: comment.postId },
        // ]);
        // if (!previousComments) return;
        // const optimisticUpdatedComments = previousComments.map((commentT) => {
        //   if (commentT.id === likeData.commentId) {
        //     const likesValuesObject = getLikeValue({
        //       previousLikeValue: commentT.commentLikes[0]?.isPositive,
        //       inputLikeBooleanValue: likeData.isPositive,
        //     });
        //     return {
        //       ...commentT,
        //       commentLikesValue: (comment.commentLikesValue +=
        //         likesValuesObject.likeValueChange),
        //       commentLikes: [
        //         {
        //           ...commentT.commentLikes[0],
        //           isPositive: likesValuesObject.likeValue,
        //         },
        //       ],
        //     } as unknown as commentType;
        //   }
        //   return commentT;
        // });
        // utils.queryClient.setQueryData(
        //   ["comment.getCommentsByPostId", { postId: comment.postId }],
        //   optimisticUpdatedComments
        // );
        // return { previousComments };
      }
    },

    onError(_err, _newComment, context) {
      if (!context) return;

      if (comment.mainCommentId) {
        utils.setQueryData(
          [
            "comment.getAllCommentsByMainCommentId",
            { mainCommentId: comment.mainCommentId },
          ],
          context.previousComments
        );
      } else {
        // utils.setQueryData(
        //   ["comment.getCommentsByPostId", { postId: comment.postId }],
        //   context.previousComments
        // );
        // console.log(context.previousComments);
      }
    },

    onSettled() {
      if (comment.mainCommentId) {
        utils.refetchQueries([
          "comment.getAllCommentsByMainCommentId",
          { mainCommentId: comment.mainCommentId },
        ]);
      } else {
        // utils.invalidateQueries([
        //   "comment.getCommentsByPostId",
        //   { postId: comment.postId },
        // ]);
      }
    },
  });

  const toggleEditMode = () => {
    if (editableComment.index === comment.id) {
      setEditableComment({ ...editableComment, index: "" });
    } else {
      setEditableComment({
        comment: comment.text,
        index: comment.id,
      });
    }
  };

  const handleEditableTextChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setEditableComment({
      ...editableComment,
      comment: e.target.value || "",
    });
  };

  const updateComment = async () => {
    checkIsAuth();
    if (editableComment.comment.length > 0) {
      await updateCommentMutation.mutateAsync({
        postId: comment.id,
        id: comment.id,
        text: editableComment.comment,
      });
      setEditableComment({ comment: "", index: "" });
    }
  };

  const toggleReplyMode = () => {
    if (replyComment.index === comment.id) {
      setReplyComment({ ...replyComment, index: "" });
    } else {
      setReplyComment({ ...replyComment, index: comment.id });
    }
  };

  const handleReplyTextChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setReplyComment({
      ...replyComment,
      comment: e.target.value || "",
    });
  };

  const createReply = async () => {
    checkIsAuth();
    if (replyComment.comment.length > 0) {
      await createCommentMutation.mutateAsync({
        postId: comment.postId,
        text: replyComment.comment,
        mainCommentId: replyComment.index,
      });
      setReplyComment({ comment: "", index: "" });
    }
  };

  const openChildrenComments = async () => {
    if (commentsQuery.status === "idle") {
      await commentsQuery.refetch();
    }
    setIsChildrenOpen(!isChildrenOpen);
  };

  const changeLikeForComment = async (isPositive: boolean) => {
    checkIsAuth();
    createLikeMutation.mutateAsync({
      commentId: comment.id,
      isPositive,
    });
  };

  const formattedDate = comment.createdAt.toLocaleDateString();
  const isInEditableMode = editableComment.index === comment.id;
  const isInReplayMode = replyComment.index === comment.id;
  const isCommentHaveChildren = !!comment.childrenCount;

  return (
    <div className="relative">
      {isShow && (
        <>
          {isChildrenOpen && isCommentHaveChildren && (
            <div
              className="absolute top-12 left-0 w-3 h-[length:calc(100%_-_theme(spacing.12))] border-l-4 border-r-4 border-transparent bg-[rgba(0,_0,_0,_0.1)] bg-clip-padding hover:bg-[rgba(0,_0,_0,_0.3)] cursor-pointer"
              onClick={openChildrenComments}
            />
          )}
          <div className="flex items-center gap-4">
            <NextImage
              alt="Avatar"
              src={comment.user.image || "/user-placeholder.jpg"}
              width="32"
              height="32"
              className="rounded-full"
            />

            <div>
              <div>{comment.user.name}</div>
              <div>{formattedDate}</div>
            </div>
            {session.status === "authenticated" && (
              <div
                className="ml-auto pr-2 motion-safe:hover:scale-105 duration-500 text-center cursor-pointer"
                onClick={toggleEditMode}
              >
                <a>Edit</a>
                <i className="ri-pencil-line" />
              </div>
            )}
          </div>

          <div className="ml-8">
            {isInEditableMode ? (
              <div className="border border-gray-800 mb-4 ">
                <CustomTextarea
                  placeholder="Write your comment here..."
                  value={editableComment.comment}
                  onChange={handleEditableTextChange}
                />
                <div className="flex justify-end pb-4">
                  <button onClick={updateComment}>Update</button>
                </div>
              </div>
            ) : (
              <p>{comment.text}</p>
            )}

            <div className="flex gap-2">
              <LikeControlComponent
                callbackFn={changeLikeForComment}
                likeValue={comment.commentLikes[0]?.isPositive}
                likesCount={comment.commentLikesValue}
              />
              <span className="cursor-pointer " onClick={toggleReplyMode}>
                Reply
              </span>
            </div>
            {isInReplayMode && (
              <div className="border border-gray-800 mb-4 ">
                <CustomTextarea
                  className="bg-inherit"
                  placeholder="Write your comment here..."
                  value={replyComment.comment}
                  onChange={handleReplyTextChange}
                />
                <div className="flex justify-end pb-4">
                  <button onClick={createReply}>Comment</button>
                </div>
              </div>
            )}

            {isCommentHaveChildren && !isChildrenOpen && (
              <p
                className={`
                  "text-sm btn btn-link btn-xs hover:text-primary-focus  " 
                  ${commentsQuery.isLoading ? "loading" : ""}
                `}
                onClick={openChildrenComments}
              >
                {comment.childrenCount} more replies
              </p>
            )}
          </div>
        </>
      )}
      {commentsQuery.data?.map((comment) => (
        <div className="ml-8" key={comment.id}>
          <CommentRowMemo
            comment={comment}
            callbackUrl={callbackUrl}
            isShow={isChildrenOpen && isShow}
          />
        </div>
      ))}
    </div>
  );
};

export const CommentRowMemo = memo(CommentRow);
export default CommentRow;
