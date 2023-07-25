import React from "react";
import { inferQueryOutput } from "../../utils/trpc";
import InteractivePanel from "../InteractivePanel";
import PostHeader from "./PostHeader";
import PostImage from "./PostImage";
import PostTitle from "./PostTitle";

export type PostProps = { post: inferQueryOutput<"post.post"> };

export const PostComponent: React.FC<PostProps> = ({ post }) => {
  return (
    <div className="mb-8 flex flex-col bg-base-200 shadow">
      <PostHeader
        date={post.createdAt}
        image={post.user.image}
        username={post.user.name}
      />

      <PostTitle link={`/posts/${post.id}`} title={post.title} />

      {post.image && <PostImage image={post.image} link={`s/${post.id}`} />}
      <InteractivePanel post={post} callbackUrl={"/"} />
    </div>
  );
};
