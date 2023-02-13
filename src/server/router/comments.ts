import * as trpc from "@trpc/server";
import { z } from "zod";
import { createRouter } from "./context";
import { createProtectedRouter } from "./protected-router";

export const commentRouter = createRouter()
  .query("getCommentsByPostId", {
    input: z.object({ postId: z.string().cuid() }),
    resolve({ ctx, input }) {
      return ctx.prisma.comment.findMany({
        where: { postId: input.postId, mainCommentId: null },
        include: { user: true },
      });
    },
  })
  .query("getAllCommentsByMainCommentId", {
    input: z.object({
      mainCommentId: z.string().cuid(),
    }),
    async resolve({ input, ctx }) {
      const data = await ctx.prisma.comment.findMany({
        where: { mainCommentId: input.mainCommentId },
        include: { user: true },
        orderBy: { createdAt: "asc" },
      });

      console.log(data);
      return data;
    },
  })
  .merge(
    "",
    createProtectedRouter()
      .mutation("createComment", {
        input: z.object({
          text: z.string().min(1),
          postId: z.string().cuid(),
          mainCommentId: z.string().cuid().optional(),
        }),
        async resolve({ input, ctx }) {
          const post = await ctx.prisma.post.update({
            where: { id: input.postId },
            data: {
              comments: {
                create: {
                  text: input.text,
                  mainCommentId: input.mainCommentId,
                  userId: ctx.session.user.id,
                },
              },
              commentsCount: { increment: 1 },
            },
          });

          if (input.mainCommentId) {
            await ctx.prisma.comment.update({
              data: {
                childrenCount: { increment: 1 },
              },
              where: { id: input.mainCommentId },
            });
          }

          return post;
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
              text: input.text,
            },
          });
        },
      })
  );
