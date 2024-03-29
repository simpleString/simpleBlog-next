import dynamic from "next/dynamic";
import NextImage from "next/image";
import { useRouter } from "next/router";
import { ReactElement, useEffect, useRef, useState } from "react";
import HeadBodyGrid from "../../components/HeadBodygrid";
import InteractivePanel from "../../components/InteractivePanel";
import PostHeader from "../../components/posts/PostHeader";
import { useOnScreen } from "../../hooks/useOnScreen";
import { Layout } from "../../layouts/Layout";
import { trpc } from "../../utils/trpc";
import { NextPageWithLayout } from "../_app";
import MetaHead from "../../components/MetaHead";

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
    if (!isChildRendered && !postQuery.isLoading)
      setIsChildRendered(isOnScreen);
  }, [isChildRendered, isOnScreen, postQuery.isLoading]);

  return (
    <>
      <MetaHead
        pageTitle={postQuery.data?.title}
        description={postQuery.data?.title}
        author={postQuery.data?.user.name ?? undefined}
        image={postQuery.data?.image ?? undefined}
      />

      <div className="space-y-4 sm:p-4">
        <div className="flex flex-col shadow">
          {!postQuery.data ? (
            <HeadBodyGrid className="min-w-full" />
          ) : (
            <>
              <PostHeader
                date={postQuery.data.createdAt}
                image={postQuery.data.user.image}
                username={postQuery.data.user.name}
              />
              <h1 className="p-2 text-2xl font-bold">{postQuery.data.title}</h1>
              {postQuery.data.image && (
                <div className="relative p-2">
                  <NextImage
                    src={postQuery.data.image}
                    layout="responsive"
                    width="640"
                    height="360"
                    loading="lazy"
                    objectFit="contain"
                  />
                </div>
              )}
              <div
                dangerouslySetInnerHTML={{ __html: postQuery.data.text }}
                className="prose-sm prose max-w-none p-4 focus:outline-none prose-headings:my-1 prose-p:my-1 prose-img:my-1 prose-img:w-full"
              />

              <InteractivePanel
                post={postQuery.data}
                isShowEditSection={true}
                callbackUrl={`/posts/${postQuery.data.id}`}
              />
            </>
          )}
        </div>
        <div ref={commentRef} id="comments">
          {isChildRendered && postQuery.data && (
            <CommentSection
              postId={postQuery.data.id}
              callbackUrl={`/posts/${postQuery.data.id}`}
              postCommentsCount={postQuery.data.commentsCount}
            />
          )}
        </div>
      </div>
    </>
  );
};

Post.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>;
};

export default Post;
