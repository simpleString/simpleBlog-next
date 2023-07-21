import { useSession } from "next-auth/react";
import { useState } from "react";
import { useCreateCommentMutation } from "../../hooks/api/useCreateCommentMutation";
import { useLikeCommentMutation } from "../../hooks/api/useLikeCommentMutation";
import { useUpdateCommentMutation } from "../../hooks/api/useUpdateCommentMutation";
import { useIsAuthCheck } from "../../hooks/useIsAuth";
import { useOrderCommentStore } from "../../store";
import { getRelativeTime } from "../../utils/getRelativeTime";
import { inferQueryOutput, trpc } from "../../utils/trpc";
import LikeControlComponent from "../LikeControlComponent";
import CommentFooter from "./CommentFooter";
import CommentForm from "./CommentForm";
import CommentHeader from "./CommentHeader";

type commentType = inferQueryOutput<"comment.getComments">[0];
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

  const [areChildrenOpen, setAreChildrenOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isReplyMode, setIsReplyMode] = useState(false);

  const order = useOrderCommentStore((store) => store.order);

  const childrenCommentsQuery = trpc.useQuery(
    ["comment.getComments", { mainCommentId: comment.id, orderBy: order }],
    { enabled: areChildrenOpen }
  );

  const updateCommentMutation = useUpdateCommentMutation({ comment, order });

  const createCommentMutation = useCreateCommentMutation({ comment, order });

  const createLikeMutation = useLikeCommentMutation({ comment, order });

  const onSubmitEdit = async (text: string) => {
    if (!checkIsAuth()) return;

    await updateCommentMutation.mutateAsync({
      postId: comment.id,
      id: comment.id,
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
    setAreChildrenOpen(true);
    toggleReplyMode(false);
    return Promise.resolve();
  };

  const changeLikeForComment = async (isPositive: boolean) => {
    checkIsAuth();
    createLikeMutation.mutateAsync({
      commentId: comment.id,
      isPositive,
    });
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
      {isShow && (
        <>
          {areChildrenOpen && isCommentHaveChildren && (
            <button
              className="absolute top-12 left-0 h-[calc(100%_-_theme(spacing.12))] w-3 border-l-4 border-r-4 border-transparent bg-base-content bg-clip-padding opacity-10 hover:opacity-30"
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

            <div className="mt-2 flex gap-2">
              <LikeControlComponent
                callbackFn={changeLikeForComment}
                likeValue={comment.likedByMe}
                likesCount={comment.commentLikesValue}
              />
              <button
                className="duration-500 motion-safe:hover:scale-110"
                onClick={() => toggleReplyMode(!isReplyMode)}
              >
                <span className="text-base">
                  <i
                    className={`ri-xl align-text-bottom ${
                      isReplyMode
                        ? "ri-chat-1-fill text-primary"
                        : "ri-chat-1-line"
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
