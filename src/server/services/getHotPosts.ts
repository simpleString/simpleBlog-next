import { PrismaClient, Prisma, Post } from "@prisma/client";
import { Session } from "next-auth";
import {
  HOT_LIKES_THRESHOLD,
  NEGATIVE_THRESHOLD_COMMENTS,
} from "../../constants/backend";
import { getSearchInterval } from "../utils/getSearchInterval";

type getHotPostsType = {
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

type getHotPostsInDateType = Omit<getHotPostsType, "cursor"> & {
  date: Date;
  userId: string | undefined;
  searchInterval?: number;
  cursorPost: Post | null | undefined;
};

export const getHotPosts = async ({
  ctx,
  cursor,
  limit,
  skip,
}: getHotPostsType) => {
  let userId: undefined | string;
  if (ctx.session && ctx.session.user) userId = ctx.session.user.id;
  let cursorPost;
  if (cursor)
    cursorPost = await ctx.prisma.post.findFirst({ where: { id: cursor } });

  const currentDate = cursorPost?.createdAt ?? new Date();

  const hotPosts = await getHotPostsInDate({
    ctx,
    limit,
    skip,
    userId,
    date: currentDate,
    searchInterval: getSearchInterval(5),
    cursorPost,
  });

  return hotPosts;
};

const getHotPostsInDate = async ({
  ctx,
  cursorPost,
  date,
  limit,
  skip,
  userId,
  searchInterval,
}: getHotPostsInDateType) => {
  if (!searchInterval) {
    return [];
  }

  const yesterdayDate = new Date(date);

  yesterdayDate.setDate(date.getDate() - searchInterval);

  // Get posts with likes that accept threshold rule.
  // Search without skip. Will remove extra post in js.
  let hotPosts = await ctx.prisma.post.findMany({
    take: limit,
    cursor: cursorPost ? { id: cursorPost.id } : undefined,
    where: {
      OR: [
        {
          likesValue: { lt: -HOT_LIKES_THRESHOLD },
          commentsCount: { gt: NEGATIVE_THRESHOLD_COMMENTS },
        },
        { likesValue: { gt: HOT_LIKES_THRESHOLD } },
      ],
      createdAt: { gte: yesterdayDate, lte: date },
    },
    include: {
      bookmarks: { where: { userId }, take: 1 },
      likes: { where: { userId }, take: 1 },
      user: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  hotPosts.sort((a, b) => {
    if (a.commentsCount < b.commentsCount) return 1;
    else if (a.commentsCount > b.commentsCount) return -1;
    else return 0;
  });

  // IF For yerterday haven't created post.
  // Increase search interval
  if (hotPosts.length < limit) {
    const newSearchInterval = getSearchInterval(searchInterval);

    const bestPostForYesterday = await getHotPostsInDate({
      limit: limit - hotPosts.length,
      ctx,
      date: yesterdayDate,
      skip,
      userId,
      searchInterval: newSearchInterval,
      cursorPost,
    });

    hotPosts = hotPosts.concat(bestPostForYesterday);
  }

  return hotPosts;
};
