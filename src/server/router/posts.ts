import { Post, User } from "@prisma/client";
import * as trpc from "@trpc/server";
import { z } from "zod";
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

export const postRouter = createRouter()
  .query("posts", {
    input: z.object({
      limit: z.number().min(1).max(100).nullish(),
      cursor: z.string().cuid().nullish(),
    }),
    async resolve({ ctx, input }): Promise<InfinitePostsOutputType> {
      const limit = input.limit ?? 50;
      const { cursor } = input;

      let userId: undefined | string;
      if (ctx.session && ctx.session.user) userId = ctx.session.user.id;
      const posts = await ctx.prisma.post.findMany({
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
        include: {
          user: true,
          likes: { where: { userId }, take: 1 },
          bookmarks: { where: { userId }, take: 1 },
        },
        orderBy: { createdAt: "desc" },
      });

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
      };
    },
  })

  .query("search", {
    input: z.object({
      query: z.string(),
    }),
    async resolve({ ctx, input }): Promise<PostOutputType[]> {
      let userId: undefined | string;
      if (ctx.session && ctx.session.user) userId = ctx.session.user.id;
      const posts = await ctx.prisma.post.findMany({
        include: {
          user: true,
          likes: { where: { userId }, take: 1 },
          bookmarks: { where: { userId }, take: 1 },
        },
        where: { title: { contains: input.query } },
        orderBy: { createdAt: "desc" },
      });

      return posts.map((post) => ({
        ...post,
        bookmarked: post.bookmarks[0] ? true : false,
        likedByMe: post.likes[0]?.isPositive,
      }));
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
              let likeValueChange = 0;
              let likeValue = 0;
              if (input.isPositive) {
                if (like.isPositive === 1) {
                  likeValue = 0;
                  likeValueChange = -1;
                } else if (like.isPositive === 0) {
                  likeValue = 1;
                  likeValueChange = 1;
                } else {
                  likeValue = 1;
                  likeValueChange = 2;
                }
              } else {
                if (like.isPositive === 1) {
                  likeValue = -1;
                  likeValueChange = -2;
                } else if (like.isPositive === 0) {
                  likeValue = -1;
                  likeValueChange = -1;
                } else {
                  likeValue = 0;
                  likeValueChange = 1;
                }
              }

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

      .mutation("createPost", {
        input: z.object({
          title: z.string().min(5),
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
          title: z.string().min(5),
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
