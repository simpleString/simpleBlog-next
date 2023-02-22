import { useState } from "react";
import { inferQueryOutput, trpc } from "../../utils/trpc";
import NextImage from "next/image";
import { useSession } from "next-auth/react";
import CommentForm from "./CommentForm";
import LikeControlComponent from "../LikeControlComponent";
import { useIsAuthCheck } from "../../hooks/useIsAuth";
import { CommentRowMemo } from "./CommentRow";

type MainPostCommentProps = {
  comment: inferQueryOutput<"comment.getCommentsByPostId">[0];
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

  const utils = trpc.useContext();

  const childrenCommentsQuery = trpc.useQuery(
    ["comment.getAllCommentsByMainCommentId", { mainCommentId: comment.id }],
    { enabled: areChildrenOpen }
  );

  const updateCommentMutation = trpc.useMutation(["comment.updateComment"], {
    onSuccess: (data) => {
      utils.setQueryData(
        ["comment.getCommentsByPostId", { postId: comment.postId }],
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
    onSuccess: (data) => {
      utils.invalidateQueries(["comment.getCommentsByPostId", { postId }]);
      // utils.setQueryData(
      //   [
      //     "comment.getAllCommentsByMainCommentId",
      //     { mainCommentId: comment.id },
      //   ],
      //   (old) => {
      //     if (!old) return [];
      //     return [data, ...old];
      //   }
      // );
      setAreChildrenOpen(true);
    },
  });
  const commentLikeMutation = trpc.useMutation(["comment.like"]);

  const onSubmitEdit = async (text: string) => {
    checkIsAuth();
    await updateCommentMutation.mutateAsync({
      id: comment.id,
      postId: comment.postId,
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
    return Promise.resolve();
  };

  const changeLikeForComment = async (isPositive: boolean) => {
    checkIsAuth();
    commentLikeMutation.mutateAsync({ commentId: comment.id, isPositive });
  };

  const formattedDate = comment.createdAt.toLocaleDateString();
  const isCommentHaveChildren = !!comment.childrenCount;

  console.log(comment.childrenCount);

  return (
    <div className="relative">
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
            likeValue={comment.commentLikes[0]?.isPositive}
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
                  "text-sm btn btn-link btn-xs hover:text-primary-focus  " 
                  ${childrenCommentsQuery.isLoading ? "loading" : ""}
                `}
            onClick={() => setAreChildrenOpen(!areChildrenOpen)}
          >
            {comment.childrenCount} more replies
          </p>
        )}
      </div>

      {childrenCommentsQuery.data?.map((comment) => (
        <div className="ml-8" key={comment.id}>
          <CommentRowMemo
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
