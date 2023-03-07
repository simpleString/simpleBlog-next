import { CommentOrderType } from "../types/frontend";

export const generateMessageObject = ({
  comment,
  order,
}: CommentOrderType) => ({
  postId: !comment.mainCommentId ? comment.postId : undefined,
  orderBy: order,
  mainCommentId: comment.mainCommentId ? comment.mainCommentId : undefined,
});
