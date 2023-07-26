import { toast } from "react-toastify";
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
      await utils.cancelQuery(["post.bookedPosts"]);

      const previousPost = utils.getQueryData([
        "post.post",
        { postId: post.id },
      ]);

      const previousPostsList = utils.getInfiniteQueryData([
        "post.posts",
        { orderBy: order, limit: POST_LIMIT },
      ]);

      const previousBookedPostsList = utils.getInfiniteQueryData([
        "post.bookedPosts",
        { limit: POST_LIMIT },
      ]);

      if (previousPost) {
        utils.setQueryData(["post.post", { postId: post.id }], {
          ...previousPost,
          bookmarked: previousPost.bookmarked ? false : true,
        });
      }

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
                    bookmarked: postPrevious.bookmarked ? false : true,
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

      return { previousPost, previousPostsList, previousBookedPostsList };
    },

    onError(_err, _newData, context) {
      if (!context) return;

      toast.error("Connection error");

      if (context.previousPost) {
        utils.setQueryData(
          ["post.post", { postId: post.id }],
          context.previousPost
        );
      }

      if (context.previousPostsList) {
        utils.setInfiniteQueryData(
          ["post.posts", { orderBy: order, limit: POST_LIMIT }],
          context.previousPostsList
        );
      }

      if (context.previousBookedPostsList) {
        utils.setInfiniteQueryData(
          ["post.bookedPosts", { limit: POST_LIMIT }],
          context.previousBookedPostsList
        );
      }
    },

    onSuccess() {
      utils.invalidateQueries("post.search");
    },
  });
};
