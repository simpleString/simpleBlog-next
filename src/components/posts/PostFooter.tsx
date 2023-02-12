import { useIsAuth } from "../../hooks/useIsAuth";
import { trpc } from "../../utils/trpc";
import { ChevronDownIcon, ChevronUpIcon, MessageBubbleIcon } from "../Svg";

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
  const checkIsAuth = useIsAuth("");

  const utils = trpc.useContext();

  const createLike = trpc.useMutation(["post.like"], {
    onSuccess() {
      utils.invalidateQueries(["post.posts"]);
    },
  });

  const changeLikeForPost = async (isPositive: boolean) => {
    checkIsAuth();
    await createLike.mutateAsync({
      isPositive,
      postId: postId,
    });
  };

  const likeIsNegative = !like?.isPositive && like?.isPositive !== null;
  const likeIsPositive = like?.isPositive;

  return (
    <div className="flex p-4 items-center border-1 border-black ">
      <div className="motion-safe:hover:scale-105 duration-500 flex items-center group">
        <MessageBubbleIcon />
        <span>{commentsCount}</span>
      </div>
      <div className="ml-auto flex items-center">
        <ChevronDownIcon
          onClick={() => {
            changeLikeForPost(false);
          }}
          className={`${
            likeIsNegative
              ? "text-red-700"
              : "hover:text-red-900  motion-safe:hover:scale-105 duration-500 motion-safe:hover:translate-y-1.5"
          }
          cursor-pointer`}
        />
        <span>{likesValue}</span>
        <ChevronUpIcon
          onClick={async () => {
            changeLikeForPost(true);
          }}
          className={`${
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
