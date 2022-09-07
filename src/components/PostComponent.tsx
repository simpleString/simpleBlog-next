import ChatBubbleLeftIcon from "@heroicons/react/24/outline/ChatBubbleLeftIcon";
import ChevronDownIcon from "@heroicons/react/24/outline/ChevronDownIcon";
import ChevronUpIcon from "@heroicons/react/24/outline/ChevronUpIcon";
import { Like, Post as PrismaPost } from "@prisma/client";
import { User } from "next-auth";
import { useSession } from "next-auth/react";
import Image from "next/image";
import NextLink from "next/link";
import { useRouter } from "next/router";
import React from "react";
import { useScrollState } from "../store";
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
  const updateScrollPosition = useScrollState(
    (state) => state.updateScrollPosition
  );
  const createLike = trpc.useMutation(["post.like"], {
    onSuccess() {
      utils.invalidateQueries(["post.posts"]);
    },
  });

  const isAuthAndDataExists = (): boolean => {
    if (!session.data) {
      router.push("/api/auth/signin?error=SessionRequired");
    }
    return true;
  };

  return (
    <div className="flex flex-col bg-yellow-50 border-2 border-black mb-8">
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
          <a
            onClick={() => updateScrollPosition(window.pageYOffset)}
            className="font-medium text-2xl mt-2 p-4"
          >
            {post.title}
          </a>
        </NextLink>
      </div>

      <NextLink href={`/post/${post.id}`} passHref>
        <div onClick={() => updateScrollPosition(window.pageYOffset)}>
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
      <div className="flex p-4 items-center border-1 border-black ">
        <div className="motion-safe:hover:scale-105 duration-500 flex items-center group">
          <ChatBubbleLeftIcon className="w-6 h-6 mr-2 group-hover:fill-current" />
          <span>{post.commentsCount}</span>
        </div>
        <div className="ml-auto flex items-center">
          <ChevronDownIcon
            onClick={async () => {
              if (isAuthAndDataExists()) {
                await createLike.mutateAsync({
                  isPositive: false,
                  postId: post.id,
                });
              }
            }}
            className={`${
              !post.likes[0]?.isPositive && post.likes[0]?.isPositive !== null
                ? "text-red-700"
                : "hover:text-red-900  motion-safe:hover:scale-105 duration-500 motion-safe:hover:translate-y-1.5"
            }
              w-6 h-6 cursor-pointer`}
          />
          <span>{post.likesValue}</span>
          <ChevronUpIcon
            onClick={async () => {
              if (isAuthAndDataExists()) {
                await createLike.mutateAsync({
                  isPositive: true,
                  postId: post.id,
                });
              }
            }}
            className={`${
              post.likes[0]?.isPositive
                ? "text-green-700"
                : "hover:text-green-900  motion-safe:hover:scale-105 duration-500 motion-safe:hover:-translate-y-1.5"
            }
              w-6 h-6 cursor-pointer `}
          />
        </div>
      </div>
    </div>
  );
};
