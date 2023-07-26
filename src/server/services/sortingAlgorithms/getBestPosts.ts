import type { Post } from "@prisma/client";
import { BEST_POST_THRESHOLD } from "../../../constants/backend";
import { getSearchInterval } from "../../utils/getSearchInterval";
import type { AlgorithmsType } from "../posts.service";

type getBestPostsInDateType = Omit<AlgorithmsType, "cursor"> & {
  date: Date;
  searchInterval?: number;
  cursorPost: Post | null | undefined;
};

// Select posts with max likes in current day.
// If not posts in current day, select yesterday, and etc.
export const getBestPosts = async ({
  limit,
  skip,
  ctx,
  cursor,
  userId,
  searchQuery,
}: AlgorithmsType) => {
  let cursorPost;
  if (cursor)
    cursorPost = await ctx.prisma.post.findFirst({ where: { id: cursor } });

  const currentDate = cursorPost?.createdAt ?? new Date();

  const bestPosts = await getBestPostsInDate({
    ctx,
    limit,
    skip,
    userId,
    date: currentDate,
    searchInterval: getSearchInterval(5),
    cursorPost,
    searchQuery,
  });

  return bestPosts;
};

const getBestPostsInDate = async ({
  limit,
  skip,
  date,
  searchInterval,
  ctx,
  userId,
  cursorPost,
  searchQuery,
}: getBestPostsInDateType) => {
  if (!searchInterval) {
    return [];
  }

  const yesterdayDate = new Date(date);

  yesterdayDate.setDate(date.getDate() - searchInterval);

  // Search without skip. Will remove extra post in js.
  let bestPosts = await ctx.prisma.post.findMany({
    take: limit,
    where: {
      createdAt: { gte: yesterdayDate, lte: date },
      likesValue: { gt: BEST_POST_THRESHOLD },
      title: { contains: searchQuery },
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

  // IF For yerterday haven't created post.
  // Increase search interval
  if (bestPosts.length < limit) {
    const newSearchInterval = getSearchInterval(searchInterval);

    const bestPostForYesterday = await getBestPostsInDate({
      limit: limit - bestPosts.length,
      ctx,
      date: yesterdayDate,
      skip,
      userId,
      searchInterval: newSearchInterval,
      cursorPost,
      searchQuery,
    });

    bestPosts = bestPosts.concat(bestPostForYesterday);
  }

  return bestPosts;
};
