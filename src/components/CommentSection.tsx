import { useState } from "react";
import { useIsAuthCheck } from "../hooks/useIsAuth";
import { trpc } from "../utils/trpc";
import CommentRow from "./CommentRow";
import CustomTextarea from "./custom/CustomTextarea";
import LoadingSpinner from "./LoadingSpinner";

type CommentSectionProps = {
  postId: string;
  callbackUrl: string;
  postCommentsCount: number;
};

const CommentSection: React.FC<CommentSectionProps> = ({
  postId,
  callbackUrl,
  postCommentsCount,
}) => {
  const checkIsAuth = useIsAuthCheck(callbackUrl);
  const utils = trpc.useContext();

  const [commentState, setCommentState] = useState("");

  const createCommentMutation = trpc.useMutation(["comment.createComment"], {
    onSuccess() {
      utils.invalidateQueries(["comment.getCommentsByPostId", { postId }]);
    },
  });

  const { data: comments } = trpc.useQuery([
    "comment.getCommentsByPostId",
    { postId },
  ]);

  const onSaveButtonClick = async () => {
    checkIsAuth();
    if (commentState.length > 0) {
      await createCommentMutation.mutateAsync({
        postId: postId,
        text: commentState,
      });
      setCommentState("");
    }
  };

  if (!comments) return <LoadingSpinner />;

  return (
    <>
      <div className=" shadow">
        <CustomTextarea
          value={commentState}
          placeholder="Write your comment here..."
          onChange={(e) => {
            {
              setCommentState(e.target.value || "");
            }
          }}
        />
        <div className="flex justify-end pb-4">
          <button className="btn" onClick={onSaveButtonClick}>
            Comment
          </button>
        </div>
      </div>
      <div>
        <div>
          <p>{postCommentsCount} comments</p>
        </div>
        {comments.map((comment) => (
          <div key={comment.id} className="p-2  shadow ">
            <CommentRow
              comment={comment}
              callbackUrl={"/post/" + comment.postId}
              openComments={true}
            />
          </div>
        ))}
      </div>
    </>
  );
};

export default CommentSection;
