import React from "react";
import { inferQueryOutput } from "../../utils/trpc";
import PostFooter from "./PostFooter";
import PostHeader from "./PostHeader";
import PostImage from "./PostImage";
import PostTitle from "./PostTitle";

export type PostProps = { post: inferQueryOutput<"post.posts">[0] };

export const PostComponent: React.FC<PostProps> = ({ post }) => {
  const postLike = post.likes[0] || null;

  return (
    <div className="flex flex-col mb-8 shadow bg-base-200">
      <PostHeader
        date={post.createdAt}
        image={post.user.image}
        userName={post.user.name}
      />

      <PostTitle title={post.title} postId={post.id} />

      {post.image && <PostImage image={post.image} postId={post.id} />}

      <PostFooter
        commentsCount={post.commentsCount}
        like={postLike}
        likesValue={post.likesValue}
        postId={post.id}
      />
    </div>
  );
};
