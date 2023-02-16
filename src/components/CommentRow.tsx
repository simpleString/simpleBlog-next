import { useSession } from "next-auth/react";
import NextImage from "next/image";
import { ChangeEvent, memo, useEffect, useState } from "react";
import { useIsAuthCheck } from "../hooks/useIsAuth";
import { inferQueryOutput, trpc } from "../utils/trpc";
import CustomTextarea from "./custom/CustomTextarea";

type CommentRowProps = {
  comment: inferQueryOutput<"comment.getCommentsByPostId">[0];
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
    async onSuccess() {
      if (comment.mainCommentId) {
        utils.refetchQueries([
          "comment.getAllCommentsByMainCommentId",
          { mainCommentId: comment.mainCommentId },
        ]);
      } else {
        utils.invalidateQueries([
          "comment.getCommentsByPostId",
          { postId: comment.postId },
        ]);
      }
    },
  }); //TODO: Make optimistic update!!!

  const createCommentMutation = trpc.useMutation(["comment.createComment"], {
    async onSuccess() {
      commentsQuery.refetch();

      if (comment.mainCommentId) {
        utils.refetchQueries([
          "comment.getAllCommentsByMainCommentId",
          { mainCommentId: comment.mainCommentId },
        ]);
      } else {
        utils.invalidateQueries([
          "comment.getCommentsByPostId",
          { postId: comment.postId },
        ]);
      }

      setIsChildrenOpen(true);
    },
  });

  const createLikeMutation = trpc.useMutation(["comment.like"], {
    onSuccess() {
      if (comment.mainCommentId) {
        utils.refetchQueries([
          "comment.getAllCommentsByMainCommentId",
          { mainCommentId: comment.mainCommentId },
        ]);
      } else {
        utils.invalidateQueries([
          "comment.getCommentsByPostId",
          { postId: comment.postId },
        ]);
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
    await createLikeMutation.mutateAsync({
      commentId: comment.id,
      isPositive,
    });
  };

  const formattedDate = comment.createdAt.toLocaleDateString();
  const isInEditableMode = editableComment.index === comment.id;
  const isInReplayMode = replyComment.index === comment.id;
  const isCommentHaveChildren = !!comment.childrenCount;

  const likeIsNegative =
    comment.commentLikes[0] && !comment.commentLikes[0].isPositive;
  const likeIsPositive =
    comment.commentLikes[0] && comment.commentLikes[0].isPositive;

  console.log("is nagative " + likeIsNegative);
  console.log("is positive " + likeIsPositive);

  console.log("is children open " + isChildrenOpen);
  console.log("is show " + isShow);

  const CommentRowMemeo = memo(CommentRow);

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
              <div className=" flex items-center">
                <i
                  onClick={() => changeLikeForComment(false)}
                  className={`${
                    likeIsNegative
                      ? "text-red-700"
                      : "hover:text-red-900  motion-safe:hover:scale-105 duration-500 motion-safe:hover:translate-y-1.5"
                  }
         cursor-pointer ri-arrow-down-s-line text-xl`}
                />
                <span>{comment.commentLikesValue}</span>
                <i
                  onClick={() => changeLikeForComment(true)}
                  className={`${
                    likeIsPositive
                      ? "text-green-700"
                      : "hover:text-green-900  motion-safe:hover:scale-105 duration-500 motion-safe:hover:-translate-y-1.5"
                  }
        cursor-pointer ri-arrow-up-s-line text-xl`}
                />
              </div>
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
                className="cursor-pointer text-sm text-info"
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
          <CommentRowMemeo
            comment={comment}
            callbackUrl={callbackUrl}
            isShow={isChildrenOpen && isShow}
            openComments={isChildrenOpen}
          />
        </div>
      ))}
    </div>
  );
};

export default CommentRow;
