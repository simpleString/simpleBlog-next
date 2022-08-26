import { Post as PrismaPost } from "@prisma/client";
import { User } from "next-auth";
import Image from "next/image";
import NextLink from "next/link";
import React from "react";

type PostProps = {
  post: PrismaPost & {
    user: User;
  };
};

export const PostComponent: React.FC<PostProps> = ({ post }) => {
  console.log(post);

  console.log(post.img);

  return (
    <div className="flex flex-col  bg-yellow-50 border-2 border-black w-screen max-w-3xl rounded-lg">
      <div className="flex p-4">
        <div className="mr-6">
          <Image
            alt="Avatar"
            src={post.user.image || "/user-placeholder.jpg"}
            width="24"
            height="24"
            className="rounded"
          />
        </div>
        <div>{post.user.name}</div>
        <div className="ml-auto">{post.createdAt.toLocaleDateString()}</div>
      </div>

      <div>
        <NextLink href={`/post/${post.id}`}>
          <a className="font-medium text-2xl mt-2 p-4">{post.title}</a>
        </NextLink>
      </div>

      <NextLink href={`/post/${post.id}`} passHref>
        <div>
          {!post.img ? (
            <Image
              className="p-0 cursor-pointer"
              src={"/testImage.jpg"}
              alt="Post image"
              layout="responsive"
              width="640"
              height="360"
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              className="p-0 cursor-pointer"
              src={post.img}
              alt="Post image"
              width="100%"
              height="360"
            />
          )}
        </div>
      </NextLink>
      <div className="flex p-4">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
          stroke="currentColor"
          className="w-6 h-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M2.25 12.76c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.076-4.076a1.526 1.526 0 011.037-.443 48.282 48.282 0 005.68-.494c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z"
          />
        </svg>
        <span>{post.commentsCount}</span>
        <div className="ml-auto flex ">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19.5 8.25l-7.5 7.5-7.5-7.5"
            />
          </svg>
          <span>{post.likesValue}</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4.5 15.75l7.5-7.5 7.5 7.5"
            />
          </svg>
        </div>
      </div>
    </div>
  );
};
