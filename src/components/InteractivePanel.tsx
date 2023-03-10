import { useSession } from "next-auth/react";
import NextLink from "next/link";
import { useBookmarkMutation } from "../hooks/api/useBookmarkMutation";
import { useLikePostMutation } from "../hooks/api/useLikePostMutation";
import { useIsAuthCheck } from "../hooks/useIsAuth";
import { inferQueryOutput } from "../utils/trpc";
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
  const checkIsAuth = useIsAuthCheck(callbackUrl);

  const createLikeMutation = useLikePostMutation({ post });

  const bookmarkMutation = useBookmarkMutation({ post });

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
