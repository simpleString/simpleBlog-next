import { useSession } from "next-auth/react";
import { useState } from "react";
import { useIsAuthCheck } from "../../hooks/useIsAuth";
import { useOrderCommentStore } from "../../store";
import { getLikeValue } from "../../utils/getLikeValue";
import { getRelativeTime } from "../../utils/getRelativeTime";
import { inferQueryOutput, trpc } from "../../utils/trpc";
import LikeControlComponent from "../LikeControlComponent";
import CommentFooter from "./CommentFooter";
import CommentForm from "./CommentForm";
import CommentHeader from "./CommentHeader";
import CommentRow from "./CommentRow";

type commentType = inferQueryOutput<"comment.getCommentsByPostId">[0];

type MainPostCommentProps = {
  comment: commentType;
  callbackUrl: string;
};

const MainPostComment: React.FC<MainPostCommentProps> = ({
  comment,
  callbackUrl,
}) => {
  const session = useSession();
  const checkIsAuth = useIsAuthCheck(callbackUrl);

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
      utils.setQueryData(
        [
          "comment.getCommentsByPostId",
          { postId: comment.postId, orderBy: order },
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
      utils.setQueryData(
        ["post.post", { postId: comment.postId }],
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (old: any) =>
          old ? { ...old, commentsCount: old.commentsCount + 1 } : null
      );
      utils.setQueryData(
        [
          "comment.getCommentsByPostId",
          { orderBy: order, postId: comment.postId },
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

  const commentLikeMutation = trpc.useMutation(["comment.like"], {
    onMutate: async (data) => {
      await utils.cancelQuery([
        "comment.getCommentsByPostId",
        { postId: comment.postId, orderBy: order },
      ]);

      const previousComments = utils.getQueryData([
        "comment.getCommentsByPostId",
        { postId: comment.postId, orderBy: order },
      ]);

      if (!previousComments) return;

      console.log(previousComments);

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
          } as never;
        }
        return oldComment;
      });

      console.log(optimisticUpdatedComments);

      utils.setQueryData(
        [
          "comment.getCommentsByPostId",
          { postId: comment.postId, orderBy: order },
        ],
        optimisticUpdatedComments
      );

      return { previousComments };
    },

    onError(_err, _newData, context) {
      if (!context) return;

      utils.setQueryData(
        [
          "comment.getCommentsByPostId",
          { postId: comment.postId, orderBy: order },
        ],
        context.previousComments
      );
    },
  });

  const onSubmitEdit = async (text: string) => {
    checkIsAuth();
    await updateCommentMutation.mutateAsync({
      id: comment.id,
      postId: comment.postId,
      text,
    });
    toggleEditMode(false);
    return Promise.resolve();
  };

  const onSubmitReply = async (text: string) => {
    checkIsAuth();
    await createCommentMutation.mutateAsync({
      postId: comment.postId,
      text,
      mainCommentId: comment.id,
    });
    toggleReplyMode(false);
    return Promise.resolve();
  };

  const changeLikeForComment = async (isPositive: boolean) => {
    checkIsAuth();
    commentLikeMutation.mutateAsync({ commentId: comment.id, isPositive });
  };

  const toggleReplyMode = (state: boolean) => {
    if (!state) createCommentMutation.reset();
    setIsReplyMode(state);
  };

  const toggleEditMode = (state: boolean) => {
    if (!state) updateCommentMutation.reset();
    setIsEditMode(state);
  };

  const formattedDate = getRelativeTime(comment.createdAt);
  const isCommentHaveChildren = !!comment.childrenCount;

  return (
    <div className="relative text-sm">
      {areChildrenOpen && isCommentHaveChildren && (
        <button
          className="absolute top-12 left-0 w-3 h-[calc(100%_-_theme(spacing.12))] border-l-4 border-r-4 border-transparent bg-[rgba(0,_0,_0,_0.1)] bg-clip-padding hover:bg-[rgba(0,_0,_0,_0.3)]"
          onClick={() => setAreChildrenOpen(!areChildrenOpen)}
        />
      )}

      <CommentHeader
        comment={comment}
        formattedDate={formattedDate}
        isEditMode={isEditMode}
        sessionStatus={session.status}
        toggleEditMode={toggleEditMode}
      />

      <div className="ml-12 mt-2">
        {isEditMode ? (
          <CommentForm
            onSubmit={onSubmitEdit}
            initialValue={comment.text}
            error={updateCommentMutation.error?.data?.zodError?.fieldErrors}
            loading={updateCommentMutation.isLoading}
          />
        ) : (
          <p className="text-base">{comment.text}</p>
        )}

        <div className="flex gap-2 mt-2 flex-wrap">
          <LikeControlComponent
            callbackFn={changeLikeForComment}
            likeValue={comment.likedByMe}
            likesCount={comment.commentLikesValue}
          />
          <button
            className="motion-safe:hover:scale-110 duration-500"
            onClick={() => toggleReplyMode(!isReplyMode)}
          >
            <span className="text-base">
              <i
                className={`align-text-bottom ri-xl ${
                  isReplyMode ? "ri-chat-1-fill text-primary" : "ri-chat-1-line"
                }`}
              />
              Reply
            </span>
          </button>
        </div>

        {isReplyMode && (
          <CommentForm
            onSubmit={onSubmitReply}
            error={createCommentMutation.error?.data?.zodError?.fieldErrors}
            loading={createCommentMutation.isLoading}
          />
        )}

        <CommentFooter
          areChildrenOpen={areChildrenOpen}
          comment={comment}
          commentLoadingStatus={childrenCommentsQuery.isLoading}
          isCommentHaveChildren={isCommentHaveChildren}
          setAreChildrenOpen={setAreChildrenOpen}
        />
      </div>

      {childrenCommentsQuery.data?.map((comment) => (
        <div className="ml-8" key={comment.id}>
          <CommentRow
            comment={comment}
            callbackUrl={callbackUrl}
            isShow={areChildrenOpen}
          />
        </div>
      ))}
    </div>
  );
};

export default MainPostComment;
