import type { CommentOrderType } from "../types/frontend";

export const generateMessageObject = ({
  comment,
  order,
}: CommentOrderType): {
  postId: string | undefined;
  orderBy: CommentOrderType["order"];
  mainCommentId: string | undefined;
} => ({
  postId: !comment.mainCommentId ? comment.postId : undefined,
  orderBy: order,
  mainCommentId: comment.mainCommentId ? comment.mainCommentId : undefined,
});
