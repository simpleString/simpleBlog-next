import { POST_LIMIT } from "../../constants/frontend";
import { useOrderPostStore } from "../../store";
import { inferQueryOutput, trpc } from "../../utils/trpc";

type useBookmarkMutationType = {
  post: Exclude<inferQueryOutput<"post.post">, null>;
};

export const useBookmarkMutation = ({ post }: useBookmarkMutationType) => {
  const utils = trpc.useContext();

  const order = useOrderPostStore((store) => store.order);

  return trpc.useMutation(["post.bookmark"], {
    onMutate: async (data) => {
      await utils.cancelQuery([
        "post.post",
        {
          postId: post.id,
        },
      ]);

      await utils.cancelQuery(["post.posts"]);

      const previousPost = utils.getQueryData([
        "post.post",
        { postId: post.id },
      ]);

      const previousPostsList = utils.getInfiniteQueryData([
        "post.posts",
        { orderBy: order, limit: POST_LIMIT },
      ]);

      if (previousPost) {
        utils.setQueryData(["post.post", { postId: post.id }], {
          ...previousPost,
          bookmarked: previousPost.bookmarked ? false : true,
        });
      }

      if (previousPostsList) {
        utils.setInfiniteQueryData(
          ["post.posts", { orderBy: order, limit: POST_LIMIT }],
          {
            pages: previousPostsList.pages.map((page) => ({
              ...page,

              posts: page.posts.map((postPrevious) => {
                if (postPrevious.id === data.postId) {
                  return {
                    ...postPrevious,
                    bookmarked: postPrevious.bookmarked ? false : true,
                  };
                }
                return postPrevious;
              }),
            })),
            pageParams: previousPostsList.pageParams,
          }
        );
      }

      return { previousPost, previousPostsList };
    },

    onError(_err, _newData, context) {
      if (!context) return;

      if (context.previousPost)
        utils.setQueryData(
          ["post.post", { postId: post.id }],
          context.previousPost
        );

      if (context.previousPostsList)
        utils.setInfiniteQueryData(
          ["post.posts", { orderBy: order, limit: POST_LIMIT }],
          context.previousPostsList
        );
    },
  });
};
