import NextImage from "next/image";
import { inferQueryOutput } from "../../utils/trpc";
type commentType = inferQueryOutput<"comment.getAllCommentsByMainCommentId">[0];

type CommentHeaderType = {
  toggleEditMode: (status: boolean) => void;
  comment: commentType;
  isEditMode: boolean;
  formattedDate: string | undefined;
  sessionStatus: string;
};

const CommentHeader: React.FC<CommentHeaderType> = ({
  comment,
  toggleEditMode,
  isEditMode,
  formattedDate,
  sessionStatus,
}) => {
  return (
    <div className="flex items-center gap-4">
      <NextImage
        alt="Avatar"
        src={comment.user.image || "/user-placeholder.jpg"}
        width="32"
        height="32"
        className="rounded-full"
        loading="lazy"
      />

      <div className="flex space-x-2">
        <div>
          <p className="font-semibold">{comment.user.name}</p>
          {comment.isAuthorOfPost && <p className="text-blue-400">Author</p>}
        </div>
        <div className="tooltip" data-tip={comment.createdAt}>
          <p>{formattedDate}</p>
        </div>
      </div>
      {sessionStatus === "authenticated" && (
        <button
          className="ml-auto motion-safe:hover:scale-105 duration-500"
          onClick={() => toggleEditMode(!isEditMode)}
        >
          <span className="text-base">
            Edit
            <i
              className={`align-text-bottom ${
                isEditMode ? "ri-pencil-fill text-primary" : "ri-pencil-line"
              }`}
            />
          </span>
        </button>
      )}
    </div>
  );
};

export default CommentHeader;
