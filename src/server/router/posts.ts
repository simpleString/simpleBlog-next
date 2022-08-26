import { z } from "zod";
import { createRouter } from "./context";
import { createProtectedRouter } from "./protected-router";

export const postRouter = createRouter()
  .query("posts", {
    resolve({ ctx }) {
      return ctx.prisma.post.findMany({ include: { user: true } });
    },
  })
  .query("post", {
    input: z.object({
      postId: z.string(),
    }),
    resolve({ input, ctx }) {
      return ctx.prisma.post.findFirst({
        where: { id: input.postId },
        include: { comments: { include: { user: true } } },
      });
    },
  })
  .merge(
    "",
    createProtectedRouter()
      .mutation("createComment", {
        input: z.object({
          text: z.string().min(1),
          postId: z.string(),
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
      .mutation("createLike", {
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
              return null;
            }
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
      .mutation("create-posts", {
        input: z.object({
          title: z.string().min(5),
          text: z.string(),
          img: z.string(),
        }),
        resolve({ input, ctx }) {
          return ctx.prisma.post.create({
            data: { ...input, userId: ctx.session.user.id },
          });
        },
      })
  );
