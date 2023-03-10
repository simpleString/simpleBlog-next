import { POST_LIMIT } from "../../constants/frontend";
import { useOrderPostStore } from "../../store";
import { getLikeValue } from "../../utils/getLikeValue";
import { inferQueryOutput, trpc } from "../../utils/trpc";

type useLikePostMutationType = {
  post: Exclude<inferQueryOutput<"post.post">, null>;
};

export const useLikePostMutation = ({ post }: useLikePostMutationType) => {
  const utils = trpc.useContext();

  const order = useOrderPostStore((store) => store.order);

  return trpc.useMutation(["post.like"], {
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
        const optimisticUpdatedPost = { ...previousPost };

        const likesValuesObject = getLikeValue({
          previousLikeValue: previousPost.likedByMe,
          inputLikeBooleanValue: data.isPositive,
        });

        optimisticUpdatedPost.likedByMe = likesValuesObject.likeValue;
        optimisticUpdatedPost.likesValue =
          post.likesValue + likesValuesObject.likeValueChange;

        utils.setQueryData(
          ["post.post", { postId: post.id }],
          optimisticUpdatedPost
        );
      }
      if (previousPostsList) {
        const optimisticUpdatedPostsList = {
          pages: previousPostsList.pages.map((page) => ({
            ...page,

            posts: page.posts.map((postPrevious) => {
              if (postPrevious.id === data.postId) {
                const likesValuesObject = getLikeValue({
                  previousLikeValue: postPrevious.likedByMe,
                  inputLikeBooleanValue: data.isPositive,
                });
                return {
                  ...postPrevious,
                  likedByMe: likesValuesObject.likeValue,
                  likesValue:
                    postPrevious.likesValue + likesValuesObject.likeValueChange,
                };
              }
              return postPrevious;
            }),
          })),
          pageParams: previousPostsList.pageParams,
        };

        utils.setInfiniteQueryData(
          ["post.posts", { orderBy: order, limit: POST_LIMIT }],
          optimisticUpdatedPostsList
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
