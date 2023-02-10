import { Comment, Like, Post, User } from "@prisma/client";
import { useState } from "react";
import { trpc } from "../utils/trpc";
import CommentRow from "./CommentRow";
import CustomButton from "./custom/CustomButton";
import CustomTextarea from "./custom/CustomTextarea";
import { useIsAuth } from "../hooks/useIsAuth";

type CommentSectionProps = {
  post:
    | (Post & {
        likes: Like[];
        comments: (Comment & {
          user: User;
          childrenComments: (Comment & {
            user: User;
          })[];
        })[];
      })
    | null
    | undefined;
};

const CommentSection: React.FC<CommentSectionProps> = ({ post }) => {
  const checkIsAuth = useIsAuth("/post/" + post?.id);

  const utils = trpc.useContext();

  const createCommentMutation = trpc.useMutation(["comment.createComment"], {
    onSuccess() {
      utils.invalidateQueries(["post.post", { postId: post?.id || "" }]);
    },
  });

  const onSaveButtonClick = async () => {
    checkIsAuth();
    if (commentState.length > 0) {
      await createCommentMutation.mutateAsync({
        postId: post?.id || "",
        text: commentState,
      });
      setCommentState("");
    }
  };

  const [commentState, setCommentState] = useState("");

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
      <div className="">
        {post?.comments.map((comment) => (
          <div
            key={comment.id}
            className="p-2  shadow bg-primary  odd:bg-secondary text-primary-content odd:text-secondary-content"
          >
            <CommentRow comment={comment} />
          </div>
        ))}
      </div>
    </>
  );
};

export default CommentSection;
