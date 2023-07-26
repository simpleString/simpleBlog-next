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
    if (!checkIsAuth()) return;
    await createLikeMutation.mutateAsync({
      isPositive,
      postId: post.id,
    });
  };

  const bookmarkPost = (postId: string) => {
    bookmarkMutation.mutateAsync({ postId });
  };

  const isUserOwner = session.data?.user?.id === post.userId;

  return (
    <div className="flex items-center gap-2 p-4 pb-2">
      <NextLink href={`/posts/${post.id}#comments`}>
        <a className="group flex space-x-1 duration-500 hover:text-primary motion-safe:hover:scale-110">
          <i className="ri-chat-1-line" />
          <span>{post?.commentsCount}</span>
        </a>
      </NextLink>
      <button
        onClick={() => bookmarkPost(post.id)}
        className="flex items-center duration-500 hover:text-primary motion-safe:hover:scale-110"
      >
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
          <button className="ml-auto flex space-x-1 duration-500 motion-safe:hover:scale-110">
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
