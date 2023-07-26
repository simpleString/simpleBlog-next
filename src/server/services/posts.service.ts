import { Prisma, PrismaClient } from "@prisma/client";
import { Session } from "next-auth";
import type { OrderByFieldType } from "../router/posts";
import { getBestPosts } from "./sortingAlgorithms/getBestPosts";
import { getHotPosts } from "./sortingAlgorithms/getHotPosts";
import { getNewPosts } from "./sortingAlgorithms/getNewPosts";

type getPostsType = {
  limit: number;
  skip: number;
  cursor: string | undefined;
  ctx: {
    session: Session | null;
    prisma: PrismaClient<
      Prisma.PrismaClientOptions,
      never,
      Prisma.RejectOnNotFound | Prisma.RejectPerOperation | undefined
    >;
  };
  orderBy: OrderByFieldType;
  searchQuery: string | undefined;
};

export type AlgorithmsType = Omit<getPostsType, "orderBy"> & {
  userId: string | undefined;
};

export const getPosts = async ({
  ctx,
  cursor,
  limit,
  skip,
  orderBy,
  searchQuery,
}: getPostsType) => {
  let posts;

  let userId: string | undefined;
  if (ctx.session?.user) userId = ctx.session.user.id;

  if (orderBy === "new") {
    posts = await getNewPosts({
      ctx,
      limit: limit + 1,
      skip: skip ?? 0,
      cursor,
      userId,
      searchQuery,
    });
  } else if (orderBy === "best") {
    // get best post
    posts = await getBestPosts({
      ctx,
      limit: limit + 1,
      skip: skip ?? 0,
      cursor,
      userId,
      searchQuery,
    });
  } else {
    posts = await getHotPosts({
      ctx,
      limit: limit + 1,
      skip: skip ?? 0,
      cursor,
      userId,
      searchQuery,
    });
  }

  let nextCursor: typeof cursor = undefined;
  if (posts.length > limit) {
    if (orderBy === "best") {
      const newPosts = [...posts];
      newPosts.sort((a, b) => {
        if (a.createdAt < b.createdAt) return 1;
        else if (a.createdAt > b.createdAt) return -1;
        else return 0;
      });
      const nextItem = newPosts.pop();
      posts = posts.filter((post) => {
        return post.id !== nextItem?.id;
      });
      if (nextItem) nextCursor = nextItem.id;
    } else {
      const nextItem = posts.pop();
      if (nextItem) nextCursor = nextItem.id;
    }
  }

  return { posts, nextCursor };
};
