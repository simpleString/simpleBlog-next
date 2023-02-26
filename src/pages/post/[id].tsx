import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { ReactElement, useEffect, useRef, useState } from "react";
import ContentLoader from "react-content-loader";
import InteractivePanel from "../../components/InteractivePanel";
import { useOnScreen } from "../../hooks/useOnScreen";
import { Layout } from "../../layouts/Layout";
import { trpc } from "../../utils/trpc";
import { NextPageWithLayout } from "../_app";
import NextImage from "next/image";
import { getRelativeTime } from "../../utils/getRelativeTime";

const HeadBodyGrid = (props: any) => (
  <ContentLoader
    uniqueKey="post"
    speed={2}
    viewBox="0 0 400 460"
    backgroundColor="#f3f3f3"
    foregroundColor="#ecebeb"
    {...props}
  >
    <rect x="15" y="15" rx="4" ry="4" width="350" height="25" />
    <rect x="15" y="50" rx="2" ry="2" width="350" height="250" />
    <rect x="508" y="535" rx="2" ry="2" width="170" height="20" />
    <rect x="581" y="526" rx="2" ry="2" width="170" height="20" />
  </ContentLoader>
);

const CommentSection = dynamic(
  () => import("../../components/comments/CommentSection")
);

const Post: NextPageWithLayout<React.FC> = () => {
  const router = useRouter();

  const postId = router.query.id as string;
  const postQuery = trpc.useQuery(["post.post", { postId }]);

  const commentRef = useRef<HTMLDivElement>(null);
  const isOnScreen = useOnScreen(commentRef);

  const [isChildRendered, setIsChildRendered] = useState(false);

  // Disable rerender component
  useEffect(() => {
    if (!isChildRendered) setIsChildRendered(isOnScreen);
  }, [isChildRendered, isOnScreen]);

  const formattedDate = postQuery.data?.createdAt
    ? getRelativeTime(postQuery.data.createdAt)
    : "";

  return (
    <div className="space-y-4 sm:p-4">
      <div className="flex flex-col shadow">
        {!postQuery.data ? (
          <HeadBodyGrid className="min-w-full" />
        ) : (
          <>
            <div className="flex space-x-8 p-2">
              <div className="flex justify-center space-x-2">
                <NextImage
                  alt="Avatar"
                  src={postQuery.data.user.image || "/user-placeholder.jpg"}
                  width={22}
                  height={22}
                  className="rounded-full"
                />
                <span>{postQuery.data.user.name}</span>
              </div>
              <div className="tooltip z-50" data-tip={postQuery.data.createdAt}>
                <span>{formattedDate}</span>
              </div>
            </div>
            <h1 className="text-2xl font-bold p-2">{postQuery.data.title}</h1>
            {postQuery.data.image && (
              <div className="relative p-2">
                <NextImage
                  src={postQuery.data.image}
                  layout="responsive"
                  width="640"
                  height="360"
                />
              </div>
            )}
            <div
              dangerouslySetInnerHTML={{ __html: postQuery.data.text }}
              className="prose prose-sm focus:outline-none p-4 prose-img:my-1 prose-img:w-full max-w-none prose-headings:my-1 prose-p:my-1"
            />

            <InteractivePanel
              post={postQuery.data}
              isShowEditSection={true}
              callbackUrl={`/post/${postQuery.data.id}`}
            />
          </>
        )}
      </div>

      <div ref={commentRef} id="comments">
        {isChildRendered && postQuery.data && (
          <CommentSection
            postId={postQuery.data.id}
            callbackUrl={`/post/${postQuery.data.id}`}
            postCommentsCount={postQuery.data.commentsCount}
          />
        )}
      </div>
    </div>
  );
};

Post.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>;
};

export default Post;
