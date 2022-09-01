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
    resolve({ input, ctx }) {
      console.log("endpoint");

      let userId: undefined | string;
      if (ctx.session && ctx.session.user) userId = ctx.session.user.id;

      return ctx.prisma.post.findFirst({
        where: { id: input.postId },
        include: {
          likes: {
            where: { postId: input.postId, userId },
            take: 1,
          },
          tag: true,
          comments: { include: { user: true }, orderBy: { createdAt: "asc" } },
        },
      });
    },
  })
  .merge(
    "",
    createProtectedRouter()
      .mutation("createComment", {
        input: z.object({
          text: z.string().min(1),
          postId: z.string().cuid(),
        }),
        resolve({ input, ctx }) {
          return ctx.prisma.post.update({
            where: { id: input.postId },
            data: {
              comments: {
                create: { text: input.text, userId: ctx.session.user.id },
              },
              commentsCount: { increment: 1 },
            },
          });
        },
      })
      .mutation("updateComment", {
        input: z.object({
          id: z.string().cuid(),
          text: z.string().min(1),
          postId: z.string().cuid(),
        }),
        async resolve({ input, ctx }) {
          const comment = await ctx.prisma.comment.findFirst({
            where: {
              userId: ctx.session.user.id,
              id: input.id,
            },
          });

          if (!comment) {
            throw new trpc.TRPCError({ code: "FORBIDDEN" });
          }

          return ctx.prisma.comment.update({
            where: {
              id: input.id,
            },
            data: {
              ...input,
            },
          });
        },
      })
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
          const result = await fetch(input.img);
          if (
            result.status === 200 &&
            result.headers.has("Content-Type") &&
            result.headers.get("Content-Type")?.includes("image/")
          ) {
            return ctx.prisma.post.create({
              data: { ...input, userId: ctx.session.user.id },
            });
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
