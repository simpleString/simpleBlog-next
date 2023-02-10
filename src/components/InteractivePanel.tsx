import { Comment, Like, Post, User } from "@prisma/client";
import { useSession } from "next-auth/react";
import NextLink from "next/link";
import router from "next/router";
import { getBaseUrl } from "../pages/_app";
import { trpc } from "../utils/trpc";

type InteractivePanelProps = {
  post:
    | (Post & {
        likes: Like[];
        comments: (Comment & {
          user: User;
        })[];
      })
    | null
    | undefined;
};

const InteractivePanel: React.FC<InteractivePanelProps> = ({ post }) => {
  const session = useSession();
  const utils = trpc.useContext();

  const createLike = trpc.useMutation(["post.like"], {
    onSuccess() {
      utils.invalidateQueries(["post.post"]);
    },
  });

  return (
    <div className="flex p-4 items-center">
      <div className="motion-safe:hover:scale-105 duration-500 flex items-center group">
        <i className="ri-chat-1-line mr-2 group-hover:fill-current" />
        <span>{post?.commentsCount}</span>
      </div>
      {post?.userId === session.data?.user?.id ? (
        <NextLink
          href={{ pathname: "/update-post", query: { id: post?.id } }}
          passHref
        >
          <div className="ml-auto motion-safe:hover:scale-105 duration-500 text-center group cursor-pointer">
            <a>Edit</a>
            <i className="ml-2 inline-block ri-pencil-line" />
          </div>
        </NextLink>
      ) : null}
      <div className="ml-auto flex items-center">
        <i
          onClick={async () => {
            if (session.status !== "authenticated") {
              router.push(
                "/api/auth/signin?error=SessionRequired&callbackUrl=" +
                  getBaseUrl() +
                  "/post/" +
                  post?.id
              );
            } else if (session.status === "authenticated" && post) {
              await createLike.mutateAsync({
                isPositive: false,
                postId: post.id,
              });
            }
          }}
          className={`${
            !post?.likes[0]?.isPositive && post?.likes[0]?.isPositive !== null
              ? "text-red-700"
              : "hover:text-red-900  motion-safe:hover:scale-105 duration-500 motion-safe:hover:translate-y-1.5"
          }
         cursor-pointer ri-arrow-down-s-line`}
        />
        <span>{post?.likesValue}</span>
        <i
          onClick={async () => {
            if (session.status !== "authenticated") {
              router.push(
                "/api/auth/signin?error=SessionRequired&callbackUrl=" +
                  getBaseUrl() +
                  "/post/" +
                  post?.id
              );
            } else if (session.status === "authenticated" && post) {
              await createLike.mutateAsync({
                isPositive: true,
                postId: post.id,
              });
            }
          }}
          className={`${
            post?.likes[0]?.isPositive
              ? "text-green-700"
              : "hover:text-green-900  motion-safe:hover:scale-105 duration-500 motion-safe:hover:-translate-y-1.5"
          }
        cursor-pointer ri-arrow-up-s-line`}
        />
      </div>
    </div>
  );
};

export default InteractivePanel;
