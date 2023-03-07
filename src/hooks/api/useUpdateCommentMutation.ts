import { CommentOrderType } from "../../types/frontend";
import { generateMessageObject } from "../../utils/messageApiHelper";
import { trpc } from "../../utils/trpc";

export const useUpdateCommentMutation = ({
  comment,
  order,
}: CommentOrderType) => {
  const utils = trpc.useContext();

  return trpc.useMutation(["comment.updateComment"], {
    onSuccess: (data) => {
      utils.setQueryData(
        ["comment.getComments", generateMessageObject({ comment, order })],
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
};
