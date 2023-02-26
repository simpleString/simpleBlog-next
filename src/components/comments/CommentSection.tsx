import { useIsAuthCheck } from "../../hooks/useIsAuth";
import { useOrderCommentStore } from "../../store";
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

  const { order, changeOrder } = useOrderCommentStore();

  const createCommentMutation = trpc.useMutation(["comment.createComment"], {
    onSuccess: async (data) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      utils.setQueryData(["post.post", { postId }], (old: any) =>
        old ? { ...old, commentsCount: old.commentsCount + 1 } : null
      );

      utils.setQueryData(
        ["comment.getCommentsByPostId", { postId, orderBy: order }],
        (old) => {
          if (!old) return [];
          return [data, ...old];
        }
      );
    },
  });

  const { data: comments, isLoading } = trpc.useQuery([
    "comment.getCommentsByPostId",
    { postId, orderBy: order },
  ]);

  const onSubmitComment = async (text: string) => {
    checkIsAuth();
    await createCommentMutation.mutateAsync({
      postId,
      text,
    });
    return Promise.resolve();
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <>
      <div className=" shadow">
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
              buttonComponentClasses="btn "
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
              callbackUrl={"/post/" + comment.postId}
            />
          </div>
        ))}
      </div>
    </>
  );
};

export default CommentSection;
