import { useSession } from "next-auth/react";
import NextImage from "next/image";
import { useEffect, useState } from "react";
import { useIsAuthCheck } from "../../hooks/useIsAuth";
import { useOrderCommentStore } from "../../store";
import { getLikeValue } from "../../utils/getLikeValue";
import { inferQueryOutput, trpc } from "../../utils/trpc";
import LikeControlComponent from "../LikeControlComponent";
import CommentForm from "./CommentForm";

type commentType = inferQueryOutput<"comment.getAllCommentsByMainCommentId">[0];
type CommentRowProps = {
  comment: commentType;
  callbackUrl: string;
  openComments?: boolean;
  isShow?: boolean;
};

const CommentRow: React.FC<CommentRowProps> = ({
  comment,
  callbackUrl,
  isShow = true,
}) => {
  const session = useSession();
  const checkIsAuth = useIsAuthCheck(callbackUrl);

  // Open first inner comments for user comport by default
  const [areChildrenOpen, setAreChildrenOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isReplyMode, setIsReplyMode] = useState(false);

  const order = useOrderCommentStore((store) => store.order);

  const utils = trpc.useContext();

  const childrenCommentsQuery = trpc.useQuery(
    [
      "comment.getAllCommentsByMainCommentId",
      { mainCommentId: comment.id, orderBy: order },
    ],
    { enabled: areChildrenOpen }
  );

  const updateCommentMutation = trpc.useMutation(["comment.updateComment"], {
    onSuccess: (data) => {
      if (!comment.mainCommentId) return;
      utils.setQueryData(
        [
          "comment.getAllCommentsByMainCommentId",
          {
            orderBy: order,
            mainCommentId: comment.mainCommentId,
          },
        ],
        (old) => {
          if (!old) return [];
          return old?.map((comment) => {
            if (data.id === comment.id) {
              return data;
            }
            return comment;
          });
        }
      );
    },
  });

  const createCommentMutation = trpc.useMutation(["comment.createComment"], {
    onSuccess: async (data) => {
      if (!comment.mainCommentId) return;

      utils.setQueryData(["post.post", { postId: comment.postId }], (old) =>
        old ? { ...old, commentsCount: old.commentsCount + 1 } : null
      );
      utils.setQueryData(
        [
          "comment.getAllCommentsByMainCommentId",
          {
            orderBy: order,
            mainCommentId: comment.mainCommentId,
          },
        ],
        (old) => {
          if (!old) return [];
          return old?.map((oldComment) => {
            if (oldComment.id === comment.id)
              return {
                ...oldComment,
                childrenCount: oldComment.childrenCount + 1,
              };

            return oldComment;
          });
        }
      );
      utils.setQueryData(
        [
          "comment.getAllCommentsByMainCommentId",
          { mainCommentId: comment.id, orderBy: order },
        ],
        (old) => {
          if (!old) return [data];
          return [data, ...old];
        }
      );
      setAreChildrenOpen(true);
    },
  });

  const createLikeMutation = trpc.useMutation(["comment.like"], {
    onMutate: async (data) => {
      if (!comment.mainCommentId) return;

      await utils.cancelQuery([
        "comment.getAllCommentsByMainCommentId",
        {
          orderBy: order,
          mainCommentId: comment.mainCommentId,
        },
      ]);

      const previousComments = utils.getQueryData([
        "comment.getAllCommentsByMainCommentId",
        {
          orderBy: order,
          mainCommentId: comment.mainCommentId,
        },
      ]);

      if (!previousComments) return;

      const optimisticUpdatedComments = previousComments.map((oldComment) => {
        if (oldComment.id === data.commentId) {
          const likesValuesObject = getLikeValue({
            previousLikeValue: oldComment.likedByMe,
            inputLikeBooleanValue: data.isPositive,
          });
          return {
            ...oldComment,
            commentLikesValue:
              comment.commentLikesValue + likesValuesObject.likeValueChange,
            likedByMe: likesValuesObject.likeValue,
          } as any;
        }
        return oldComment;
      });

      utils.setQueryData(
        [
          "comment.getAllCommentsByMainCommentId",
          {
            orderBy: order,
            mainCommentId: comment.mainCommentId,
          },
        ],
        optimisticUpdatedComments
      );

      return { previousComments };
    },

    onError(_err, _newData, context) {
      if (!context) return;
      if (!comment.mainCommentId) return;

      utils.setQueryData(
        [
          "comment.getAllCommentsByMainCommentId",
          {
            orderBy: order,
            mainCommentId: comment.mainCommentId,
          },
        ],
        context.previousComments
      );
    },
  });

  const onSubmitEdit = async (text: string) => {
    checkIsAuth();

    await updateCommentMutation.mutateAsync({
      postId: comment.id,
      id: comment.id,
      text,
    });
    setIsEditMode(false);
    return Promise.resolve();
  };

  const onSubmitReply = async (text: string) => {
    checkIsAuth();
    await createCommentMutation.mutateAsync({
      postId: comment.postId,
      text,
      mainCommentId: comment.id,
    });
    setIsReplyMode(false);
  };

  const changeLikeForComment = async (isPositive: boolean) => {
    checkIsAuth();
    createLikeMutation.mutateAsync({
      commentId: comment.id,
      isPositive,
    });
  };

  const formattedDate = comment.createdAt.toLocaleDateString();
  const isCommentHaveChildren = !!comment.childrenCount;

  return (
    <div className="relative">
      {isShow && (
        <>
          {areChildrenOpen && isCommentHaveChildren && (
            <div
              className="absolute top-12 left-0 w-3 h-[length:calc(100%_-_theme(spacing.12))] border-l-4 border-r-4 border-transparent bg-[rgba(0,_0,_0,_0.1)] bg-clip-padding hover:bg-[rgba(0,_0,_0,_0.3)] cursor-pointer"
              onClick={() => setAreChildrenOpen(!areChildrenOpen)}
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
              <p>{comment.user.name}</p>
              <div>{formattedDate}</div>
            </div>
            {session.status === "authenticated" && (
              <div
                className="ml-auto pr-2 motion-safe:hover:scale-105 duration-500 text-center cursor-pointer"
                onClick={() => setIsEditMode(!isEditMode)}
              >
                <a>Edit</a>
                <i className="ri-pencil-line" />
              </div>
            )}
          </div>

          <div className="ml-8">
            {isEditMode ? (
              <CommentForm
                onSubmit={onSubmitEdit}
                initialValue={comment.text}
                error={updateCommentMutation.error?.data?.zodError?.fieldErrors}
                loading={updateCommentMutation.isLoading}
              />
            ) : (
              <p>{comment.text}</p>
            )}

            <div className="flex gap-2">
              <LikeControlComponent
                callbackFn={changeLikeForComment}
                likeValue={comment.likedByMe}
                likesCount={comment.commentLikesValue}
              />
              <span
                className="cursor-pointer "
                onClick={() => setIsReplyMode(!isReplyMode)}
              >
                Reply
              </span>
            </div>
            {isReplyMode && (
              <CommentForm
                onSubmit={onSubmitReply}
                error={createCommentMutation.error?.data?.zodError?.fieldErrors}
                loading={createCommentMutation.isLoading}
              />
            )}

            {isCommentHaveChildren && !areChildrenOpen && (
              <p
                className={`
                  "text-sm btn btn-link btn-xs hover:text-primary-focus" 
                `}
                onClick={() => setAreChildrenOpen(!areChildrenOpen)}
              >
                {comment.childrenCount} more replies
              </p>
            )}

            {childrenCommentsQuery.isLoading && (
              <p
                className={`
                  "text-sm btn loading btn-link btn-xs hover:text-primary-focus " 
                `}
              >
                {comment.childrenCount} more replies
              </p>
            )}
          </div>
        </>
      )}
      {childrenCommentsQuery.data?.map((comment) => (
        <div className="ml-8" key={comment.id}>
          <CommentRow
            comment={comment}
            callbackUrl={callbackUrl}
            isShow={areChildrenOpen && isShow}
          />
        </div>
      ))}
    </div>
  );
};

export default CommentRow;
