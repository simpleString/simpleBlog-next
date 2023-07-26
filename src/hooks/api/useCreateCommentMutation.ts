import { POST_LIMIT } from "../../constants/frontend";
import { useOrderPostStore } from "../../store";
import { type CommentOrderType } from "../../types/frontend";
import { generateMessageObject } from "../../utils/messageApiHelper";
import { trpc } from "../../utils/trpc";

export const useCreateCommentMutation = ({
  comment,
  order,
}: CommentOrderType) => {
  const utils = trpc.useContext();
  const postOrder = useOrderPostStore((store) => store.order);

  return trpc.useMutation(["comment.createComment"], {
    onSuccess: async (data) => {
      // Set in carefully. It's sets without autocompolite.
      await utils.queryClient.cancelQueries(["post"]);
      await utils.queryClient.cancelQueries(["comment"]);

      const previousPostsList = utils.getInfiniteQueryData([
        "post.posts",
        { orderBy: postOrder, limit: POST_LIMIT },
      ]);

      const previousBookedPostsList = utils.getInfiniteQueryData([
        "post.bookedPosts",
        { limit: POST_LIMIT },
      ]);

      if (previousBookedPostsList) {
        utils.setInfiniteQueryData(
          ["post.bookedPosts", { limit: POST_LIMIT }],
          {
            pages: previousBookedPostsList.pages.map((page) => ({
              ...page,

              posts: page.posts.map((postPrevious) => {
                if (postPrevious.id === data.postId) {
                  return {
                    ...postPrevious,
                    commentsCount: postPrevious.commentsCount + 1,
                  };
                }
                return postPrevious;
              }),
            })),
            pageParams: previousBookedPostsList.pageParams,
          }
        );
      }

      if (previousPostsList) {
        utils.setInfiniteQueryData(
          ["post.posts", { orderBy: postOrder, limit: POST_LIMIT }],
          {
            pages: previousPostsList.pages.map((page) => ({
              ...page,

              posts: page.posts.map((postPrevious) => {
                if (postPrevious.id === data.postId) {
                  return {
                    ...postPrevious,
                    commentsCount: postPrevious.commentsCount + 1,
                  };
                }
                return postPrevious;
              }),
            })),
            pageParams: previousPostsList.pageParams,
          }
        );
      }

      utils.setQueryData(
        ["post.post", { postId: comment.postId }],
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (old: any) =>
          old ? { ...old, commentsCount: old.commentsCount + 1 } : null
      );
      utils.setQueryData(
        ["comment.getComments", generateMessageObject({ comment, order })],
        (old) => {
          if (!old) return [];
          return old?.map((oldComment) => {
            if (oldComment.id === comment.id)
              return {
                ...oldComment,
                childrenCount: oldComment.childrenCount + 1,
              };

            return oldComment;
          });
        }
      );
      utils.setQueryData(
        ["comment.getComments", { orderBy: order, mainCommentId: comment.id }],
        (old) => {
          if (!old) return [data];
          return [data, ...old];
        }
      );

      utils.invalidateQueries("post.search");
    },
  });
};
