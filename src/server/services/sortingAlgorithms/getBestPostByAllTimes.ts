import { Post } from "@prisma/client";
import { AlgorithmsType } from "../posts.service";

type getBestPostByAllTimes = AlgorithmsType & {
  author?: string;
  dateFrom?: Date;
  dateTo?: Date;
  ratingTo?: number;
  ratingFrom?: number;
  bookmark?: boolean;
};

type getBestPostsInDateType = Omit<
  getBestPostByAllTimes,
  "cursor" | "dateTo" | "skip"
> & {
  date: Date;
  cursorPost: Post | null | undefined;
};

export const getBestPostByAllTimes = async ({
  ctx,
  cursor,
  limit,
  searchQuery,
  userId,
  author,
  bookmark,
  dateFrom,
  dateTo,
  ratingFrom,
  ratingTo,
}: getBestPostByAllTimes) => {
  let cursorPost;
  if (cursor) {
    cursorPost = await ctx.prisma.post.findFirst({ where: { id: cursor } });
  }

  const currentDate = cursorPost?.createdAt ?? dateTo ?? new Date();

  const bestPosts = await getBestPostsInDate({
    ctx,
    limit,
    userId,
    cursorPost,
    searchQuery,
    author,
    bookmark,
    dateFrom,
    ratingFrom,
    ratingTo,
    date: currentDate,
  });

  return bestPosts;
};

const getBestPostsInDate = async ({
  limit,
  ctx,
  userId,
  cursorPost,
  searchQuery,
  date,
  author,
  bookmark,
  dateFrom,
  ratingFrom,
  ratingTo,
}: getBestPostsInDateType) => {
  // Search without skip. Will remove extra post in js.
  let bestPosts = await ctx.prisma.post.findMany({
    take: limit,
    where: {
      createdAt: { gte: dateFrom, lte: date },
      likesValue: { gte: ratingFrom, lte: ratingTo },
      title: { contains: searchQuery },
      user: { name: { contains: author } },
      ...(bookmark && userId && { bookmarks: { some: { userId } } }),
    },
    include: {
      bookmarks: { where: { userId }, take: 1 },
      likes: { where: { userId }, take: 1 },
      user: true,
    },
    orderBy: {
      likesValue: "desc",
    },
  });

  if (cursorPost) {
    let postIndex = -1;
    bestPosts.forEach((post, index) => {
      if (post.id === cursorPost.id) {
        postIndex = index;
        return;
      }
    });
    if (postIndex !== -1) bestPosts = bestPosts.slice(postIndex);
  }

  return bestPosts;
};
