import { useEffect, useState } from "react";
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

  const [commentCount, setCommentCount] = useState(0);

  useEffect(() => {
    setCommentCount(
      postCommentsCount < commentCount ? commentCount : postCommentsCount
    );
  }, [postCommentsCount, commentCount]);

  const createCommentMutation = trpc.useMutation(["comment.createComment"], {
    onSuccess: (data) => {
      setCommentCount(commentCount + 1);

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
          <p>{commentCount} comments</p>
          <div className="ml-auto">
            <Dropdown
              buttonComponentClasses="btn "
              childrenClasses="p-0 w-36 menu-compact"
              buttonComponent={<div className="">Select order</div>}
              dropdownClasses="dropdown-end"
            >
              <li className="w-36">
                <span onClick={() => changeOrder("new")}>New</span>
              </li>
              <li>
                <span onClick={() => changeOrder("best")}>Best</span>
              </li>
            </Dropdown>
          </div>
        </div>
        {comments?.map((comment) => (
          <div key={comment.id} className="p-2  shadow ">
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
