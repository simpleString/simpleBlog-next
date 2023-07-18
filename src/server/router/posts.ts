import { Post, User } from "@prisma/client";
import * as trpc from "@trpc/server";
import { z } from "zod";
import { DEFAULT_POST_LIMIT } from "../../constants/backend";
import { getPosts } from "../services/posts.service";
import { getLikeValue } from "../utils/getLikeValue";
import { createRouter } from "./context";
import { createProtectedRouter } from "./protected-router";

type PostOutputType = Post & {
  user: User;
  likedByMe: number | undefined;
  bookmarked: boolean;
};

type InfinitePostsOutputType = {
  posts: PostOutputType[];
  nextCursor: string | undefined;
};

type InfiniteSearchPostsOutputType = InfinitePostsOutputType & {
  postsCount: number;
};

const ZodOrderByField = z.enum(["best", "new", "hot"]);
export type OrderByFieldType = z.infer<typeof ZodOrderByField>;

export const postRouter = createRouter()
  .query("posts", {
    input: z.object({
      limit: z.number().min(1).max(100).nullish(),
      cursor: z.string().cuid().optional(),
      orderBy: ZodOrderByField,
      skip: z.number().optional(),
    }),
    async resolve({ ctx, input }): Promise<InfinitePostsOutputType> {
      const limit = input.limit ?? DEFAULT_POST_LIMIT;
      const { cursor, skip } = input;

      const { posts, nextCursor } = await getPosts({
        ctx,
        cursor,
        limit,
        orderBy: input.orderBy,
        skip: skip ?? 0,
        searchQuery: undefined,
      });

      return {
        posts: posts.map((post) => ({
          ...post,
          bookmarked: post.bookmarks[0] ? true : false,
          likedByMe: post.likes[0]?.isPositive,
        })),
        nextCursor,
      };
    },
  })

  .query("search", {
    input: z.object({
      query: z.string(),
      limit: z.number().min(1).max(100).nullish(),
      cursor: z.string().cuid().optional(),
      orderBy: ZodOrderByField,
      skip: z.number().optional(),
      author: z.string().optional(),
      dateFrom: z.date().optional(),
      dateTo: z.date().optional(),
      ratingTo: z.number().optional(),
      ratingFrom: z.number().optional(),
      bookmark: z.boolean().optional(),
    }),
    async resolve({ ctx, input }): Promise<InfiniteSearchPostsOutputType> {
      const limit = input.limit ?? DEFAULT_POST_LIMIT;
      const {
        cursor,
        skip,
        author,
        dateFrom,
        dateTo,
        orderBy,
        query,
        ratingFrom,
        ratingTo,
        bookmark,
      } = input;

      const userId = ctx.session?.user?.id;

      const [postsCount, posts] = await ctx.prisma.$transaction(
        async (prisma) => {
          const postsCount = await prisma.post.count({
            cursor: cursor ? { id: cursor } : undefined,
            take: limit + 1,
            skip,
            where: {
              likesValue: { gte: ratingFrom, lte: ratingTo },
              createdAt: { gte: dateFrom, lte: dateTo },
              user: { name: { contains: author } },
              title: { contains: query },
              ...(bookmark && userId && { bookmarks: { some: { userId } } }),
            },
          });

          const innerPosts = await ctx.prisma.post.findMany({
            cursor: cursor ? { id: cursor } : undefined,
            take: limit + 1,
            skip,
            where: {
              likesValue: { gte: ratingFrom, lte: ratingTo },
              createdAt: { gte: dateFrom, lte: dateTo },
              user: { name: { contains: author } },
              title: { contains: query },
              ...(bookmark && userId && { bookmarks: { some: { userId } } }),
            },
            include: {
              user: true,
              likes: { where: { userId }, take: 1 },
              bookmarks: { where: { userId }, take: 1 },
            },
            orderBy: {
              ...(orderBy === "best" && { likesValue: "desc" }),
              ...(orderBy === "new" && { createdAt: "desc" }),
            },
          });

          return [postsCount, innerPosts];
        }
      );

      let nextCursor: typeof cursor = undefined;
      if (posts.length > limit) {
        const nextItem = posts.pop();
        if (nextItem) nextCursor = nextItem.id;
      }

      return {
        posts: posts.map((post) => ({
          ...post,
          bookmarked: post.bookmarks[0] ? true : false,
          likedByMe: post.likes[0]?.isPositive,
        })),
        nextCursor,
        postsCount,
      };
    },
  })

  .query("post", {
    input: z.object({
      postId: z.string().cuid(),
    }),
    async resolve({ input, ctx }): Promise<PostOutputType> {
      let userId: undefined | string;
      if (ctx.session && ctx.session.user) userId = ctx.session.user.id;

      const post = await ctx.prisma.post.findFirstOrThrow({
        where: { id: input.postId },
        include: {
          likes: {
            where: { postId: input.postId, userId },
            take: 1,
          },
          bookmarks: { where: { userId }, take: 1 },
          user: true,
        },
      });

      return {
        ...post,
        bookmarked: post.bookmarks[0] ? true : false,
        likedByMe: post?.likes[0]?.isPositive,
      };
    },
  })

  .merge(
    "",
    createProtectedRouter()
      .mutation("like", {
        input: z.object({
          postId: z.string(),
          isPositive: z.boolean(),
        }),
        async resolve({ input, ctx }) {
          return ctx.prisma?.$transaction(async (prisma) => {
            const like = await prisma.like.findFirst({
              where: { postId: input.postId, userId: ctx.session.user.id },
            });

            if (like) {
              const { likeValue, likeValueChange } = getLikeValue({
                currentLikeValue: like.isPositive,
                inputLikeValue: input.isPositive,
              });

              return prisma.like.update({
                where: {
                  postId_userId: {
                    postId: input.postId,
                    userId: ctx.session.user.id,
                  },
                },
                data: {
                  isPositive: likeValue,
                  post: {
                    update: {
                      likesValue: { increment: likeValueChange },
                    },
                  },
                },
              });
            } else {
              return prisma.post.update({
                where: {
                  id: input.postId,
                },
                data: {
                  likesValue: { increment: input.isPositive ? 1 : -1 },
                  likes: {
                    create: {
                      isPositive: input.isPositive ? 1 : -1,
                      userId: ctx.session.user.id,
                    },
                  },
                },
              });
            }
          });
        },
      })

      .query("bookedPosts", {
        input: z.object({
          limit: z.number().min(1).max(100).nullish(),
          cursor: z.string().cuid().optional(),
          orderBy: ZodOrderByField,
          skip: z.number().optional(),
        }),
        async resolve({ ctx, input }): Promise<InfiniteSearchPostsOutputType> {
          const limit = input.limit ?? DEFAULT_POST_LIMIT;
          const { cursor, skip, orderBy } = input;

          const userId = ctx.session?.user?.id;

          const [postsCount, posts] = await ctx.prisma.$transaction(
            async (prisma) => {
              const postsCount = await prisma.post.count({
                cursor: cursor ? { id: cursor } : undefined,
                take: limit + 1,
                skip,
                where: {
                  bookmarks: { some: { userId } },
                },
              });

              const innerPosts = await ctx.prisma.post.findMany({
                cursor: cursor ? { id: cursor } : undefined,
                take: limit + 1,
                skip,
                where: {
                  bookmarks: { some: { userId } },
                },
                include: {
                  user: true,
                  likes: { where: { userId }, take: 1 },
                  bookmarks: { where: { userId }, take: 1 },
                },
                orderBy: {
                  ...(orderBy === "best" && { likesValue: "desc" }),
                  ...(orderBy === "new" && { createdAt: "desc" }),
                },
              });

              return [postsCount, innerPosts];
            }
          );

          let nextCursor: typeof cursor = undefined;
          if (posts.length > limit) {
            const nextItem = posts.pop();
            if (nextItem) nextCursor = nextItem.id;
          }

          return {
            posts: posts.map((post) => ({
              ...post,
              bookmarked: post.bookmarks[0] ? true : false,
              likedByMe: post.likes[0]?.isPositive,
            })),
            nextCursor,
            postsCount,
          };
        },
      })

      .mutation("draftPost", {
        input: z.object({
          id: z.string().cuid().optional(),
          title: z.string(),
          text: z.string(),
          image: z.string().url().nullable(),
        }),
        async resolve({ input, ctx }) {
          if (!input.id) {
            return await ctx.prisma.draft.create({
              data: {
                ...input,
                userId: ctx.session.user.id,
              },
            });
          }

          return await ctx.prisma.draft.update({
            where: {
              id: input.id,
            },
            data: {
              ...input,
            },
          });
        },
      })

      .mutation("deleteDraft", {
        input: z.object({
          id: z.string().cuid(),
        }),
        async resolve({ input, ctx }) {
          const draft = await ctx.prisma.draft.findFirst({
            where: {
              id: input.id,
              userId: ctx.session.user.id,
            },
          });

          if (!draft) throw new trpc.TRPCError({ code: "FORBIDDEN" });

          return await ctx.prisma.draft.delete({
            where: {
              id: input.id,
            },
          });
        },
      })

      .query("draft", {
        input: z.object({
          id: z.string().cuid(),
        }),
        async resolve({ input, ctx }) {
          return await ctx.prisma.draft.findFirst({
            where: { id: input.id, userId: ctx.session.user.id },
          });
        },
      })

      .query("drafts", {
        async resolve({ ctx }) {
          return await ctx.prisma.draft.findMany({
            where: {
              userId: ctx.session.user.id,
            },
            include: {
              user: true,
            },
            orderBy: {
              updatedAt: "desc",
            },
          });
        },
      })

      .mutation("createPost", {
        input: z.object({
          title: z.string(),
          text: z.string(),
          image: z.string().url().nullable(),
        }),
        async resolve({ input, ctx }) {
          return ctx.prisma.post.create({
            data: { ...input, userId: ctx.session.user.id },
          });
        },
      })
      .mutation("updatePost", {
        input: z.object({
          id: z.string().cuid(),
          title: z.string(),
          text: z.string(),
          image: z.string().url().nullable(),
        }),
        async resolve({ input, ctx }) {
          const post = await ctx.prisma.post.findFirst({
            where: {
              userId: ctx.session.user.id,
              id: input.id,
            },
          });

          if (!post) {
            throw new trpc.TRPCError({ code: "FORBIDDEN" });
          }

          return ctx.prisma.post.update({
            where: { id: input.id },
            data: { ...input },
          });
        },
      })
      .mutation("bookmark", {
        input: z.object({
          postId: z.string().cuid(),
        }),
        output: z.object({
          bookmarked: z.boolean(),
        }),
        async resolve({ input, ctx }) {
          try {
            await ctx.prisma.bookmark.create({
              data: { postId: input.postId, userId: ctx.session.user.id },
            });
            return { bookmarked: true };
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
          } catch (error: any) {
            if (error.code !== "P2002")
              throw new trpc.TRPCError({ code: "INTERNAL_SERVER_ERROR" });
            //if bookmark exist delete it
            await ctx.prisma.bookmark.delete({
              where: {
                postId_userId: {
                  postId: input.postId,
                  userId: ctx.session.user.id,
                },
              },
            });
            return { bookmarked: false };
          }
        },
      })
  );
