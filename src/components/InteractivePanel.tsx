import { useSession } from "next-auth/react";
import NextLink from "next/link";
import { useIsAuthCheck } from "../hooks/useIsAuth";
import { inferQueryOutput, trpc } from "../utils/trpc";
import LikeControlComponent from "./LikeControlComponent";

type InteractivePanelProps = {
  post: Exclude<inferQueryOutput<"post.post">, null>;
  isShowEditSection?: boolean;
  callbackUrl: string;
};

const InteractivePanel: React.FC<InteractivePanelProps> = ({
  post,
  isShowEditSection = false,
  callbackUrl,
}) => {
  const session = useSession();
  const utils = trpc.useContext();
  const checkIsAuth = useIsAuthCheck(callbackUrl);

  const createLikeMutation = trpc.useMutation(["post.like"], {
    // onMutate: async (data) => {
    //   await utils.cancelQuery([
    //     "post.post",
    //     {
    //       postId: post.id,
    //     },
    //   ]);

    //   await utils.cancelQuery(["post.posts"]);
    //   await utils.cancelQuery(["post.search"]);

    //   const previousPost = utils.getQueryData([
    //     "post.post",
    //     { postId: post.id },
    //   ]);

    //   if (!previousPost) return;

    //   const optimisticUpdatedPost = { ...previousPost };

    //   const likesValuesObject = getLikeValue({
    //     previousLikeValue: previousPost.likedByMe,
    //     inputLikeBooleanValue: data.isPositive,
    //   });

    //   optimisticUpdatedPost.likedByMe = likesValuesObject.likeValue;
    //   optimisticUpdatedPost.likesValue =
    //     post.likesValue + likesValuesObject.likeValueChange;

    //   utils.setQueryData(
    //     ["post.post", { postId: post.id }],
    //     optimisticUpdatedPost
    //   );

    //   const posts = utils.getQueryData(["post.posts"]);

    //   console.log(posts);

    //   if (posts)
    //     utils.setQueryData(["post.posts"], (old) => {
    //       if (!old) return [];
    //       return old?.map((postI) => {
    //         if (postI.id === post.id) {
    //           return optimisticUpdatedPost;
    //         }
    //         return postI;
    //       });
    //     });

    //   // utils.setQueryData(["post.search"], (old) => {
    //   //   if (!old) return [];
    //   //   return old.map((postI) => {
    //   //     if (postI.id === post.id) {
    //   //       return optimisticUpdatedPost;
    //   //     }
    //   //     return postI;
    //   //   });
    //   // });

    //   return { previousPost };
    // },

    // onError(_err, _newData, context) {
    //   if (!context) return;

    //   utils.setQueryData(
    //     ["post.post", { postId: post.id }],
    //     context.previousPost
    //   );
    // },

    onSuccess() {
      utils.invalidateQueries(["post.post", { postId: post.id }]);
      utils.invalidateQueries(["post.posts"]);
      utils.invalidateQueries(["post.search"]);
    },
  });

  const bookmarkMutation = trpc.useMutation(["post.bookmark"], {
    onSuccess: (data) => {
      utils.invalidateQueries(["post.post", { postId: post.id }]);
      utils.invalidateQueries(["post.posts"]);
      utils.invalidateQueries(["post.search"]);
    },
  });

  const changeLikeForPost = async (isPositive: boolean) => {
    checkIsAuth();
    await createLikeMutation.mutateAsync({
      isPositive,
      postId: post.id,
    });
  };

  const bookmarkPost = (postId: string) => {
    bookmarkMutation.mutateAsync({ postId });
  };

  const isUserOwner = session.data?.user?.id;

  return (
    <div className="flex p-4 pb-2 items-center">
      <NextLink href={`/post/${post.id}#comments`}>
        <a className="motion-safe:hover:scale-110 duration-500 flex group space-x-1 hover:text-primary">
          <i className="ri-chat-1-line" />
          <span>{post?.commentsCount}</span>
        </a>
      </NextLink>
      <button onClick={() => bookmarkPost(post.id)}>
        <i
          className={`${
            post.bookmarked ? "ri-bookmark-fill" : "ri-bookmark-line"
          }`}
        />
      </button>
      {isUserOwner && isShowEditSection && (
        <NextLink
          href={{ pathname: "/update-post", query: { id: post?.id } }}
          passHref
        >
          <button className="ml-auto motion-safe:hover:scale-110 duration-500 flex space-x-1">
            <span>Edit</span>
            <i className="ri-pencil-line" />
          </button>
        </NextLink>
      )}
      <LikeControlComponent
        callbackFn={changeLikeForPost}
        likeValue={post.likedByMe}
        likesCount={post.likesValue}
        className="ml-auto"
      />
    </div>
  );
};

export default InteractivePanel;
