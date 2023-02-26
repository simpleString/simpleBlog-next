import { inferQueryOutput } from "../../utils/trpc";

type commentType = inferQueryOutput<"comment.getAllCommentsByMainCommentId">[0];
type CommentFooterType = {
  isCommentHaveChildren: boolean;
  areChildrenOpen: boolean;
  setAreChildrenOpen: (state: boolean) => void;
  comment: commentType;
  commentLoadingStatus: boolean;
};

const CommentFooter: React.FC<CommentFooterType> = ({
  areChildrenOpen,
  isCommentHaveChildren,
  setAreChildrenOpen,
  comment,
  commentLoadingStatus,
}) => {
  return (
    <>
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

      {commentLoadingStatus && (
        <p
          className={`
        "text-sm btn loading btn-link btn-xs hover:text-primary-focus " 
      `}
        >
          {comment.childrenCount} more replies
        </p>
      )}
    </>
  );
};

export default CommentFooter;
