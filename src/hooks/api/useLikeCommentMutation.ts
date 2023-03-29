import { toast } from "react-toastify";
import { CommentOrderType } from "../../types/frontend";
import { getLikeValue } from "../../utils/getLikeValue";
import { generateMessageObject } from "../../utils/messageApiHelper";
import { trpc } from "../../utils/trpc";

export const useLikeCommentMutation = ({
  comment,
  order,
}: CommentOrderType) => {
  const utils = trpc.useContext();

  return trpc.useMutation(["comment.like"], {
    onMutate: async (data) => {
      await utils.cancelQuery([
        "comment.getComments",
        generateMessageObject({ comment, order }),
      ]);

      const previousComments = utils.getQueryData([
        "comment.getComments",
        generateMessageObject({ comment, order }),
      ]);

      if (!previousComments) return;

      const optimisticUpdatedComments = previousComments.map((oldComment) => {
        if (oldComment.id === data.commentId) {
          const likesValuesObject = getLikeValue({
            previousLikeValue: oldComment.likedByMe,
            inputLikeBooleanValue: data.isPositive,
          });
          return {
            ...oldComment,
            commentLikesValue:
              comment.commentLikesValue + likesValuesObject.likeValueChange,
            likedByMe: likesValuesObject.likeValue,
          } as never;
        }
        return oldComment;
      });

      utils.setQueryData(
        ["comment.getComments", generateMessageObject({ comment, order })],
        optimisticUpdatedComments
      );

      return { previousComments };
    },

    onError(_err, _newData, context) {
      if (!context) return;

      toast.error("Connection error");

      utils.setQueryData(
        ["comment.getComments", generateMessageObject({ comment, order })],
        context.previousComments
      );
    },
  });
};
