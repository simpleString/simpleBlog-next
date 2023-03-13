import { Prisma, PrismaClient } from "@prisma/client";
import { Session } from "next-auth";
import type { OrderByFieldType } from "../router/posts";
import { getBestPosts } from "./sortingAlgorithms/getBestPosts";
import { getBookmarkedBestPosts } from "./sortingAlgorithms/getBookmarkedBestPosts";
import { getBookmarkedHotPosts } from "./sortingAlgorithms/getBookmarkedHotPosts";
import { getBookmarkedNewPosts } from "./sortingAlgorithms/getBookmarkedNewPosts";
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
};

export type AlgorithmsType = Omit<getPostsType, "orderBy"> & {
  userId: string | undefined;
};

export type getBookmarkedPostsType = getPostsType;

export type AlhorithmsBookmarkedType = Omit<getPostsType, "orderBy"> & {
  userId: string;
};

export const getPosts = async ({
  ctx,
  cursor,
  limit,
  skip,
  orderBy,
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
    });
  } else if (orderBy === "best") {
    // get best post
    posts = await getBestPosts({
      ctx,
      limit: limit + 1,
      skip: skip ?? 0,
      cursor,
      userId,
    });
  } else {
    posts = await getHotPosts({
      ctx,
      limit: limit + 1,
      skip: skip ?? 0,
      cursor,
      userId,
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

export const getBookmarkedPosts = async ({
  ctx,
  cursor,
  limit,
  skip,
  orderBy,
}: getBookmarkedPostsType) => {
  let posts;

  let userId = "";
  if (ctx.session && ctx.session.user) userId = ctx.session.user.id;

  if (orderBy === "new") {
    posts = await getBookmarkedNewPosts({
      ctx,
      limit: limit + 1,
      skip: skip ?? 0,
      cursor,
      userId,
    });
  } else if (orderBy === "best") {
    // get best post
    posts = await getBookmarkedBestPosts({
      ctx,
      limit: limit + 1,
      skip: skip ?? 0,
      cursor,
      userId,
    });
  } else {
    posts = await getBookmarkedHotPosts({
      ctx,
      limit: limit + 1,
      skip: skip ?? 0,
      cursor,
      userId,
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
