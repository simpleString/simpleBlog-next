import * as trpc from "@trpc/server";
import { z } from "zod";
import { createProtectedRouter } from "./protected-router";

export const commentRouter = createProtectedRouter()
  .mutation("createComment", {
    input: z.object({
      text: z.string().min(1),
      postId: z.string().cuid(),
      mainCommentId: z.string().cuid().optional(),
    }),
    resolve({ input, ctx }) {
      return ctx.prisma.post.update({
        where: { id: input.postId },
        data: {
          comments: {
            create: {
              ...input,
              userId: ctx.session.user.id,
            },
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
  });
