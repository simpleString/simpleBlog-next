import { useSession } from "next-auth/react";
import NextLink from "next/link";
import { useIsAuthCheck } from "../hooks/useIsAuth";
import { inferQueryOutput, trpc } from "../utils/trpc";

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
    onSuccess() {
      utils.invalidateQueries(["post.post"]);
      utils.invalidateQueries(["post.posts"]);
    },
  });

  const changeLikeForPost = async (isPositive: boolean) => {
    checkIsAuth();
    await createLikeMutation.mutateAsync({
      isPositive,
      postId: post.id,
    });
  };

  const isUserOwner = session.data?.user?.id;
  const likeIsNegative =
    post.likes[0]?.isPositive !== null && !post.likes[0]?.isPositive;
  const likeIsPositive =
    post.likes[0]?.isPositive !== null && post.likes[0]?.isPositive;

  return (
    <div className="flex p-4 pb-2">
      <div className="motion-safe:hover:scale-110 duration-500 flex group space-x-1 hover:text-primary">
        <i className="ri-chat-1-line" />
        <span>{post?.commentsCount}</span>
      </div>
      {isUserOwner && isShowEditSection && (
        <NextLink
          href={{ pathname: "/update-post", query: { id: post?.id } }}
          passHref
        >
          <div className="ml-auto motion-safe:hover:scale-110 duration-500 cursor-pointer flex space-x-1">
            <span>Edit</span>
            <i className="ri-pencil-line" />
          </div>
        </NextLink>
      )}
      <div className="ml-auto flex items-center">
        <i
          onClick={() => changeLikeForPost(false)}
          className={`${
            likeIsNegative
              ? "text-red-700"
              : "hover:text-red-900  motion-safe:hover:scale-105 duration-500 motion-safe:hover:translate-y-1.5"
          }
         cursor-pointer ri-arrow-down-s-line`}
        />
        <span>{post?.likesValue}</span>
        <i
          onClick={() => changeLikeForPost(true)}
          className={`${
            likeIsPositive
              ? "text-green-700"
              : "hover:text-green-900  motion-safe:hover:scale-105 duration-500 motion-safe:hover:-translate-y-1.5"
          }
        cursor-pointer ri-arrow-up-s-line`}
        />
      </div>
    </div>
  );
};

export default InteractivePanel;
