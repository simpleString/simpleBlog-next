import { PrismaClient, Prisma, Post } from "@prisma/client";
import { Session } from "next-auth";
import { SEARCH_INTERVAL } from "../../constants/backend";

type getBestPostsType = {
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
};

type getBestPostInDateType = Omit<getBestPostsType, "cursor"> & {
  date: Date;
  userId: string | undefined;
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
}: getBestPostsType) => {
  let userId: undefined | string;
  if (ctx.session && ctx.session.user) userId = ctx.session.user.id;
  let cursorPost;
  if (cursor)
    cursorPost = await ctx.prisma.post.findFirst({ where: { id: cursor } });

  const currentDate = cursorPost?.createdAt ?? new Date();

  const bestPosts = await getBestPostInDate({
    ctx,
    limit,
    skip,
    userId,
    date: currentDate,
    searchInterval: getSearchInterval(5),
    cursorPost,
  });

  return bestPosts;
};

const getBestPostInDate = async ({
  limit,
  skip,
  date,
  searchInterval,
  ctx,
  userId,
  cursorPost,
}: getBestPostInDateType) => {
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

    const bestPostForYesterday = await getBestPostInDate({
      limit: limit - bestPosts.length,
      ctx,
      date: yesterdayDate,
      skip,
      userId,
      searchInterval: newSearchInterval,
      cursorPost,
    });

    bestPosts = bestPosts.concat(bestPostForYesterday);
  }

  return bestPosts;
};

const getSearchInterval = (interval: number) => {
  const newInterval = SEARCH_INTERVAL[interval];
  return newInterval;
};
