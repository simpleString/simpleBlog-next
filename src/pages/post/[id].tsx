import { useRouter } from "next/router";
import { ReactElement } from "react";
import ContentLoader from "react-content-loader";
import CommentSection from "../../components/CommentSection";
import InteractivePanel from "../../components/InteractivePanel";
import LoadingSpinner from "../../components/LoadingSpinner";
import { Layout } from "../../layouts/Layout";
import { trpc } from "../../utils/trpc";
import { NextPageWithLayout } from "../_app";

const HeadBodyGrid = (props: any) => (
  <ContentLoader
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

const Post: NextPageWithLayout<React.FC> = () => {
  const router = useRouter();

  const postId = router.query.id as string;
  const postQuery = trpc.useQuery(["post.post", { postId }]);

  if (!postQuery.data) return <LoadingSpinner />;

  return (
    <div className="space-y-4 sm:p-4">
      <div className="flex flex-col shadow">
        {postQuery.isLoading ? (
          <HeadBodyGrid className="min-w-full" />
        ) : (
          <div
            dangerouslySetInnerHTML={{ __html: postQuery.data.text }}
            className="prose prose-sm focus:outline-none p-4 min-h-[200px] prose-img:my-1 prose-img:w-full max-w-none prose-headings:my-1 prose-p:my-1"
          />
        )}
        <InteractivePanel
          post={postQuery.data}
          isShowEditSection={true}
          callbackUrl={`/post/${postQuery.data.id}`}
        />
      </div>

      <CommentSection
        postId={postQuery.data.id}
        callbackUrl={`/post/${postQuery.data.id}`}
        postCommentsCount={postQuery.data.commentsCount}
      />
    </div>
  );
};

Post.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>;
};

export default Post;
