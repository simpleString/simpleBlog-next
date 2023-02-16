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
        include: { user: true, commentLikes: true },
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
        include: { user: true, commentLikes: true },
        orderBy: { createdAt: "asc" },
      });

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
      .mutation("like", {
        input: z.object({
          commentId: z.string().cuid(),
          isPositive: z.boolean(),
        }),
        async resolve({ input, ctx }) {
          const like = await ctx.prisma.commentLike.findFirst({
            where: { commentId: input.commentId, userId: ctx.session.user.id },
          });

          console.log(input);

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
              } else if (like.isPositive === -1) {
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
              } else if (like.isPositive === -1) {
                likeValue = 0;
                likeValueChange = 1;
              }
            }

            console.log(like);
            console.log(likeValueChange);

            return await ctx.prisma.commentLike.update({
              where: {
                commentId_userId: {
                  commentId: input.commentId,
                  userId: ctx.session.user.id,
                },
              },
              data: {
                isPositive: likeValue,
                comment: {
                  update: {
                    commentLikesValue: { increment: likeValueChange },
                  },
                },
              },
            });
          } else {
            return ctx.prisma.comment.update({
              where: {
                id: input.commentId,
              },
              data: {
                commentLikesValue: { increment: input.isPositive ? 1 : -1 },
                commentLikes: {
                  create: {
                    isPositive: input.isPositive ? 1 : -1,
                    userId: ctx.session.user.id,
                  },
                },
              },
            });
          }

          // if (like) {
          //   if (input.isPositive === like.isPositive) {
          //     return ctx.prisma.commentLike.update({
          //       where: {
          //         commentId_userId: {
          //           commentId: input.commentId,
          //           userId: ctx.session.user.id,
          //         },
          //       },
          //       data: {
          //         isPositive: null,
          //         comment: {
          //           update: {
          //             commentLikesValue: {
          //               increment: input.isPositive ? -1 : 1,
          //             },
          //           },
          //         },
          //       },
          //     });
          //   } else if (like.isPositive === null) {
          //     return ctx.prisma.commentLike.update({
          //       where: {
          //         commentId_userId: {
          //           commentId: input.commentId,
          //           userId: ctx.session.user.id,
          //         },
          //       },
          //       data: {
          //         isPositive: input.isPositive,
          //         comment: {
          //           update: {
          //             commentLikesValue: {
          //               increment: input.isPositive ? 1 : -1,
          //             },
          //           },
          //         },
          //       },
          //     });
          //   } else {
          //     const updateLikesValue = like.isPositive ? -2 : 2;
          //     return ctx.prisma.commentLike.update({
          //       where: {
          //         commentId_userId: {
          //           commentId: input.commentId,
          //           userId: ctx.session.user.id,
          //         },
          //       },
          //       data: {
          //         isPositive: !like.isPositive,
          //         comment: {
          //           update: {
          //             commentLikesValue: { increment: updateLikesValue },
          //           },
          //         },
          //       },
          //     });
          //   }
          // }

          // return ctx.prisma.comment.update({
          //   where: {
          //     id: input.commentId,
          //   },
          //   data: {
          //     commentLikesValue: {
          //       increment: input.isPositive ? +input.isPositive : -1,
          //     },
          //     commentLikes: {
          //       create: {
          //         isPositive: input.isPositive,
          //         userId: ctx.session.user.id,
          //       },
          //     },
          //   },
          // });
        },
      })
  );
