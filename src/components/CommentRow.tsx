import { Comment, User } from "@prisma/client";
import { useSession } from "next-auth/react";
import NextImage from "next/image";
import { ChangeEvent, useEffect, useState } from "react";
import { inferQueryOutput, trpc } from "../utils/trpc";
import CustomButton from "./custom/CustomButton";
import CustomTextarea from "./custom/CustomTextarea";
import { useIsAuthCheck } from "../hooks/useIsAuth";
import LoadingSpinner from "./LoadingSpinner";

type CommentRowProps = {
  comment: inferQueryOutput<"comment.getCommentsByPostId">[0];
  callbackUrl: string;
  openComments?: boolean;
};

type CommentStateStatus = {
  comment: string;
  index: string;
};

const CommentRow: React.FC<CommentRowProps> = ({
  comment,
  callbackUrl,
  openComments = false,
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
  const [isChildrenOpen, setIsChildrenOpen] = useState(openComments);

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
      setIsChildrenOpen(true);
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
        mainCommentId: replyComment.index, //TODO: FIx it
      });
      setReplyComment({ comment: "", index: "" });
    }
  };

  const loadChildrenComments = async () => {
    if (commentsQuery.status === "idle") {
      await commentsQuery.refetch();
    }
    setIsChildrenOpen(!isChildrenOpen);
  };

  const formattedDate = comment.createdAt.toLocaleDateString();
  const isInEditableMode = editableComment.index === comment.id;
  const isInReplayMode = replyComment.index === comment.id;
  const isCommentHaveChildren = !!comment.childrenCount;

  return (
    <>
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
        <div>{comment.text}</div>
      )}
      <div>
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

      {isCommentHaveChildren && (
        <div className="cursor-pointer text-xl" onClick={loadChildrenComments}>
          {comment.childrenCount}
        </div>
      )}

      {isChildrenOpen && (
        <>
          {commentsQuery.data?.map((comment) => (
            <div className="ml-8" key={comment.id}>
              <CommentRow comment={comment} callbackUrl={callbackUrl} />
            </div>
          ))}
        </>
      )}
    </>
  );
};

export default CommentRow;
