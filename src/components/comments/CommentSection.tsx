import { POST_LIMIT } from "../../constants/frontend";
import { useIsAuthCheck } from "../../hooks/useIsAuth";
import { useOrderCommentStore, useOrderPostStore } from "../../store";
import { trpc } from "../../utils/trpc";
import Dropdown from "../Dropdown";
import LoadingSpinner from "../LoadingSpinner";
import CommentForm from "./CommentForm";
import MainPostComment from "./MainPostComment";

type CommentSectionProps = {
  postId: string;
  callbackUrl: string;
  postCommentsCount: number;
};

const CommentSection: React.FC<CommentSectionProps> = ({
  postId,
  callbackUrl,
  postCommentsCount,
}) => {
  const checkIsAuth = useIsAuthCheck(callbackUrl);
  const utils = trpc.useContext();

  const postOrder = useOrderPostStore((store) => store.order);
  const { order, changeOrder } = useOrderCommentStore();

  const createCommentMutation = trpc.useMutation(["comment.createComment"], {
    onSuccess: async (data) => {
      const previousPostsList = utils.getInfiniteQueryData([
        "post.posts",
        { orderBy: postOrder, limit: POST_LIMIT },
      ]);

      if (previousPostsList)
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

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      utils.setQueryData(["post.post", { postId }], (old: any) =>
        old ? { ...old, commentsCount: old.commentsCount + 1 } : null
      );

      utils.setQueryData(
        ["comment.getComments", { postId, orderBy: order }],
        (old) => {
          if (!old) return [];
          return [data, ...old];
        }
      );
    },
  });

  const { data: comments, isLoading } = trpc.useQuery([
    "comment.getComments",
    { postId, orderBy: order },
  ]);

  const onSubmitComment = async (text: string) => {
    if (!checkIsAuth()) return;

    await createCommentMutation.mutateAsync({
      postId,
      text,
    });
    return Promise.resolve();
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <>
      <div className="shadow">
        <CommentForm
          onSubmit={onSubmitComment}
          loading={createCommentMutation.isLoading}
          error={createCommentMutation.error?.data?.zodError?.fieldErrors}
        />
      </div>
      <div>
        <div className="flex">
          <p>{postCommentsCount} comments</p>
          <div className="ml-auto">
            <Dropdown
              buttonComponentClasses="btn"
              childrenClasses="p-0 w-36 menu-compact"
              buttonComponent={<span>Sort by: {order}</span>}
              dropdownClasses="dropdown-end"
            >
              <li className="pt-2">
                <span
                  className={`${order === "new" ? "active" : ""}`}
                  onClick={() => changeOrder("new")}
                >
                  New
                </span>
              </li>
              <li>
                <span
                  className={`${order === "best" ? "active" : ""}`}
                  onClick={() => changeOrder("best")}
                >
                  Best
                </span>
              </li>
            </Dropdown>
          </div>
        </div>
        {comments?.map((comment) => (
          <div key={comment.id} className="p-2 shadow ">
            <MainPostComment
              comment={comment}
              callbackUrl={"/posts/" + comment.postId}
            />
          </div>
        ))}
      </div>
    </>
  );
};

export default CommentSection;
