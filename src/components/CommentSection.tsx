import PencilIcon from "@heroicons/react/24/outline/PencilIcon";
import { Comment, Like, Post, Tag, User } from "@prisma/client";
import { useSession } from "next-auth/react";
import NextImage from "next/image";
import { useState } from "react";
import { trpc } from "../utils/trpc";
import CommentRow from "./CommentRow";
import CustomButton from "./custom/CustomButton";
import CustomTextarea from "./custom/CustomTextarea";
import { useIsAuth } from "./hooks/isAuth";

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
  console.log("post is ", post);

  const checkIsAuth = useIsAuth("/post/" + post?.id);
  const session = useSession();

  const utils = trpc.useContext();
  const updateComment = trpc.useMutation(["comment.updateComment"], {
    onSuccess() {
      utils.invalidateQueries(["post.post", { postId: post?.id || "" }]);
    },
  }); //TODO: Make optimistic update!!!
  const createComment = trpc.useMutation(["comment.createComment"], {
    onSuccess() {
      utils.invalidateQueries(["post.post", { postId: post?.id || "" }]);
    },
  });

  type CommentStateStatus = {
    comment: string;
    index: string;
  };

  const [commentState, setCommentState] = useState("");
  const [editableComment, setEditableComment] = useState<CommentStateStatus>({
    comment: "",
    index: "",
  });

  const [commentChain, setCommentChain] = useState<CommentStateStatus>({
    comment: "",
    index: "",
  });

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
