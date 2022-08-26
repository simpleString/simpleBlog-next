import ChatBubbleLeftIcon from "@heroicons/react/24/outline/ChatBubbleLeftIcon";
import ChevronDown from "@heroicons/react/24/outline/ChevronDownIcon";
import ChevronUp from "@heroicons/react/24/outline/ChevronUpIcon";
import { Like, Post as PrismaPost } from "@prisma/client";
import { User } from "next-auth";
import { useSession } from "next-auth/react";
import Image from "next/image";
import NextLink from "next/link";
import { useRouter } from "next/router";
import React from "react";
import { trpc } from "../utils/trpc";

type PostProps = {
  post: PrismaPost & {
    user: User;
    likes: Like[];
  };
};

export const PostComponent: React.FC<PostProps> = ({ post }) => {
  const session = useSession();
  const router = useRouter();
  const utils = trpc.useContext();
  const createLike = trpc.useMutation(["post.createLike"], {
    onSuccess() {
      utils.invalidateQueries(["post.posts"]);
    },
  });

  console.log(post);

  const isAuthAndDataExists = (): boolean => {
    if (!session.data) {
      router.push("/api/auth/signin?error=SessionRequired");
    }
    return true;
  };

  return (
    <div className="flex flex-col  bg-yellow-50 border-2 border-black w-screen max-w-3xl rounded-lg my-8">
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
      <div className="flex p-4 items-center border-2 border-black ">
        <div className="motion-safe:hover:scale-105 duration-500 flex items-center group">
          <ChatBubbleLeftIcon className="w-6 h-6 mr-2 group-hover:fill-current" />
          <span>{post.commentsCount}</span>
        </div>
        <div className="ml-auto flex items-center">
          <ChevronDown
            onClick={async () => {
              if (isAuthAndDataExists()) {
                await createLike.mutateAsync({
                  isPositive: false,
                  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                  postId: post.id,
                });
              }
            }}
            className={`${
              !post.likes[0]?.isPositive
                ? "text-red-700"
                : "hover:text-red-900 cursor-pointer motion-safe:hover:scale-105 duration-500 motion-safe:hover:translate-y-1.5"
            }
              w-6 h-6 `}
          />
          <span>{post.likesValue}</span>
          <ChevronUp
            onClick={async () => {
              if (isAuthAndDataExists()) {
                await createLike.mutateAsync({
                  isPositive: true,
                  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                  postId: post.id,
                });
              }
            }}
            className={`${
              post.likes[0]?.isPositive
                ? "text-green-700"
                : "hover:text-green-900 cursor-pointer motion-safe:hover:scale-105 duration-500 motion-safe:hover:-translate-y-1.5"
            }
              w-6 h-6 `}
          />
        </div>
      </div>
    </div>
  );
};
