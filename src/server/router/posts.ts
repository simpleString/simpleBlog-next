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
        include: { user: true, likes: { where: { userId } }, tag: true },
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
        //TODO: Rewrite it to one query in raw sql
        where: { id: input.postId },
        include: {
          likes: {
            where: { postId: input.postId, userId },
            take: 1,
          },
          tag: true,
          comments: {
            include: {
              user: true,
              childrenComments: {
                include: { user: true },
                orderBy: { createdAt: "asc" },
              },
            },
            where: { mainCommentId: null },
            orderBy: { createdAt: "asc" },
          },
        },
      });
      // if (postResult) {
      //   const comments = await Promise.all(
      //     postResult?.comments.map(async (comment) => {
      //       return ctx.prisma.comment.findMany({
      //         where: { mainCommentId: comment.id },
      //         include: { user: true },
      //         orderBy: { createdAt: "asc" },
      //       });
      //     })
      //   );
      // }

      // const firstChildComment = await ctx.prisma.comment.findMany({})

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
            if (input.isPositive === like.isPositive) {
              return ctx.prisma.like.update({
                where: {
                  postId_userId: {
                    postId: input.postId,
                    userId: ctx.session.user.id,
                  },
                },
                data: {
                  isPositive: null,
                  post: {
                    update: {
                      likesValue: { increment: input.isPositive ? -1 : 1 },
                    },
                  },
                },
              });
            } else if (like.isPositive === null) {
              return ctx.prisma.like.update({
                where: {
                  postId_userId: {
                    postId: input.postId,
                    userId: ctx.session.user.id,
                  },
                },
                data: {
                  isPositive: input.isPositive,
                  post: {
                    update: {
                      likesValue: { increment: input.isPositive ? 1 : -1 },
                    },
                  },
                },
              });
            } else {
              const updateLikesValue = like.isPositive ? -2 : 2;
              return ctx.prisma.like.update({
                where: {
                  postId_userId: {
                    postId: input.postId,
                    userId: ctx.session.user.id,
                  },
                },
                data: {
                  isPositive: !like.isPositive,
                  post: {
                    update: { likesValue: { increment: updateLikesValue } },
                  },
                },
              });
            }
          }

          return ctx.prisma.post.update({
            where: {
              id: input.postId,
            },
            data: {
              likesValue: {
                increment: input.isPositive ? +input.isPositive : -1,
              },
              likes: {
                create: {
                  isPositive: input.isPositive,
                  userId: ctx.session.user.id,
                },
              },
            },
          });
        },
      })
      .mutation("createPost", {
        //TODO: Need to check image guard!!!
        input: z.object({
          title: z.string().min(5),
          text: z.string(),
          img: z.string().url(),
          tagIds: z.string().cuid().array().optional(),
        }),
        async resolve({ input, ctx }) {
          // Check that it's a image
          return ctx.prisma.post.create({
            data: { ...input, userId: ctx.session.user.id },
          });
          const result = await fetch(input.img);
          if (
            result.status === 200 &&
            result.headers.has("Content-Type") &&
            result.headers.get("Content-Type")?.includes("image/")
          ) {
          }
          throw new trpc.TRPCError({
            code: "PARSE_ERROR",
            message: "Image didn't exists.",
          });
        },
      })
      .mutation("updatePost", {
        //TODO: Need to check image guard!!!
        input: z.object({
          id: z.string().cuid(),
          title: z.string().min(5),
          text: z.string(),
          img: z.string().url(),
          tagIds: z.string().cuid().array().optional(),
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
