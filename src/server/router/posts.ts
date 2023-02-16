import * as trpc from "@trpc/server";
import { z } from "zod";
import { createRouter } from "./context";
import { createProtectedRouter } from "./protected-router";

export const postRouter = createRouter()
  .query("posts", {
    resolve({ ctx }) {
      let userId: undefined | string;
      if (ctx.session && ctx.session.user) userId = ctx.session.user.id;
      return ctx.prisma.post.findMany({
        include: { user: true, likes: { where: { userId } } },
        orderBy: { createdAt: "desc" },
      });
    },
  })

  .query("search", {
    input: z.object({
      query: z.string(),
    }),
    resolve({ ctx, input }) {
      let userId: undefined | string;
      if (ctx.session && ctx.session.user) userId = ctx.session.user.id;
      return ctx.prisma.post.findMany({
        include: { user: true, likes: { where: { userId } } },
        where: { title: { contains: input.query } },
        orderBy: { createdAt: "desc" },
      });
    },
  })

  .query("post", {
    input: z.object({
      postId: z.string().cuid(),
    }),
    async resolve({ input, ctx }) {
      let userId: undefined | string;
      if (ctx.session && ctx.session.user) userId = ctx.session.user.id;

      const postResult = await ctx.prisma.post.findFirst({
        where: { id: input.postId },
        include: {
          likes: {
            where: { postId: input.postId, userId },
            take: 1,
          },
        },
      });

      return postResult;
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
          const like = await ctx.prisma.like.findFirst({
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

            return ctx.prisma.like.update({
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
            return ctx.prisma.post.update({
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
        },
      })

      .mutation("createPost", {
        input: z.object({
          title: z.string().min(5),
          text: z.string(),
          image: z.string().url().or(z.string().max(0)),
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
          image: z.string().url(),
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
  );
