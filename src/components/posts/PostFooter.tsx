import { useIsAuthCheck } from "../../hooks/useIsAuth";
import { trpc } from "../../utils/trpc";

type PostFooterProps = {
  postId: string;
  likesValue: number;
  commentsCount: number;
  like: {
    isPositive: boolean | null;
  } | null;
};

const PostFooter: React.FC<PostFooterProps> = ({
  postId,
  likesValue,
  commentsCount,
  like,
}) => {
  const checkIsAuth = useIsAuthCheck("");

  const utils = trpc.useContext();

  const createLikeMutation = trpc.useMutation(["post.like"], {
    onSuccess() {
      utils.invalidateQueries(["post.posts"]);
    },
  });

  const changeLikeForPost = async (isPositive: boolean) => {
    checkIsAuth();
    await createLikeMutation.mutateAsync({
      isPositive,
      postId: postId,
    });
  };

  const likeIsNegative = !like?.isPositive && like?.isPositive !== null;
  const likeIsPositive = like?.isPositive;

  return (
    <div className="flex p-4 items-center border-1 border-black ">
      <div className="motion-safe:hover:scale-105 duration-500 flex items-center group">
        <i className="ri-chat-1-line" />
        <span>{commentsCount}</span>
      </div>
      <div className="ml-auto flex items-center">
        <i
          onClick={() => {
            changeLikeForPost(false);
          }}
          className={`ri-pencil-line ${
            likeIsNegative
              ? "text-red-700"
              : "hover:text-red-900  motion-safe:hover:scale-105 duration-500 motion-safe:hover:translate-y-1.5"
          }
          cursor-pointer`}
        />
        <span>{likesValue}</span>
        <i
          onClick={async () => {
            changeLikeForPost(true);
          }}
          className={`ri-arrow-down-s-line ${
            likeIsPositive
              ? "text-green-700"
              : "hover:text-green-900  motion-safe:hover:scale-105 duration-500 motion-safe:hover:-translate-y-1.5"
          }
          cursor-pointer `}
        />
      </div>
    </div>
  );
};

export default PostFooter;
