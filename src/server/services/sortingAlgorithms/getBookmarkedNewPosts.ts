import { AlgorithmsType } from "../posts.service";

export const getBookmarkedNewPosts = async ({
  ctx,
  cursor,
  limit,
  skip,
  userId,
  searchQuery,
}: AlgorithmsType) => {
  return ctx.prisma.post.findMany({
    take: limit,
    skip,
    cursor: cursor ? { id: cursor } : undefined,
    where: {
      bookmarks: { some: { userId } },
      title: { contains: searchQuery },
    },
    include: {
      user: true,
      likes: { where: { userId }, take: 1 },
      bookmarks: { where: { userId }, take: 1 },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};