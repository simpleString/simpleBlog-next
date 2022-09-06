import { Comment, Like, Post, Tag, User } from "@prisma/client";
import { useState } from "react";
import { trpc } from "../utils/trpc";
import CommentRow from "./CommentRow";
import CustomButton from "./custom/CustomButton";
import CustomTextarea from "./custom/CustomTextarea";
import { useIsAuth } from "../hooks/isAuth";

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
        tag: Tag[];
      })
    | null
    | undefined;
};

const CommentSection: React.FC<CommentSectionProps> = ({ post }) => {
  const checkIsAuth = useIsAuth("/post/" + post?.id);

  const utils = trpc.useContext();

  const createComment = trpc.useMutation(["comment.createComment"], {
    onSuccess() {
      utils.invalidateQueries(["post.post", { postId: post?.id || "" }]);
    },
  });

  const [commentState, setCommentState] = useState("");

  return (
    <>
      <div className="border border-gray-800 mb-4 ">
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
          <CustomButton
            variant="secondary"
            onClick={async () => {
              checkIsAuth();
              if (commentState.length > 0) {
                await createComment.mutateAsync({
                  postId: post?.id || "",
                  text: commentState,
                });
                setCommentState("");
              }
            }}
          >
            Comment
          </CustomButton>
        </div>
      </div>
      <div className="">
        {post?.comments.map((comment) => (
          <div
            key={comment.id}
            className="border border-black p-2 odd:bg-yellow-100"
          >
            <CommentRow comment={comment} />
          </div>
        ))}
      </div>
    </>
  );
};

export default CommentSection;
