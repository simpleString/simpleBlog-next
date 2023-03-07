import { Comment, User } from "@prisma/client";
import * as trpc from "@trpc/server";
import { z } from "zod";
import { createRouter } from "./context";
import { createProtectedRouter } from "./protected-router";

type CommentOutputType = Comment & {
  user: User;
  isAuthorOfPost: boolean;
  likedByMe: number | undefined;
};

export const commentRouter = createRouter()
  .query("getCommentsByPostId", {
    input: z.object({
      postId: z.string().cuid(),
      orderBy: z.enum(["best", "new"]),
    }),
    async resolve({ ctx, input }): Promise<CommentOutputType[]> {
      let userId: undefined | string;
      if (ctx.session && ctx.session.user) userId = ctx.session.user.id;
      const comments = await ctx.prisma.comment.findMany({
        where: { postId: input.postId, mainCommentId: null },
        include: {
          user: true,
          post: true,
          commentLikes: { where: { userId }, take: 1 },
        },
        orderBy: {
          ...(input.orderBy === "best" && { commentLikesValue: "desc" }),
          ...(input.orderBy === "new" && { updatedAt: "desc" }),
        },
      });

      return comments.map((comment) => ({
        ...comment,
        isAuthorOfPost: comment.post.userId === comment.userId,
        likedByMe: comment.commentLikes[0]?.isPositive,
      }));
    },
  })
  .query("getAllCommentsByMainCommentId", {
    input: z.object({
      mainCommentId: z.string().cuid(),
      orderBy: z.enum(["best", "new"]),
    }),
    async resolve({ input, ctx }): Promise<CommentOutputType[]> {
      const comments = await ctx.prisma.comment.findMany({
        where: { mainCommentId: input.mainCommentId },
        include: { user: true, post: true, commentLikes: true },
        orderBy: {
          ...(input.orderBy === "best" && { commentLikesValue: "desc" }),
          ...(input.orderBy === "new" && { updatedAt: "desc" }),
        },
      });

      return comments.map((comment) => ({
        ...comment,
        isAuthorOfPost: comment.post.userId === comment.userId,
        likedByMe: comment.commentLikes[0]?.isPositive,
      }));
    },
  })
  .merge(
    "",
    createProtectedRouter()
      .mutation("createComment", {
        input: z.object(
          {
            text: z
              .string()
              .min(1, { message: "Must be 1 or more characters long" }),
            postId: z.string().cuid(),
            mainCommentId: z.string().cuid().optional(),
          },
          { required_error: "test" }
        ),
        async resolve({ input, ctx }): Promise<CommentOutputType> {
          return ctx.prisma.$transaction(async (prisma) => {
            const newComment = await prisma.comment.create({
              data: {
                text: input.text,
                mainCommentId: input.mainCommentId,
                userId: ctx.session.user.id,
                postId: input.postId,
              },
              include: { user: true, commentLikes: true, post: true },
            });

            await ctx.prisma.post.update({
              where: { id: input.postId },
              data: {
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
            return {
              ...newComment,
              isAuthorOfPost: newComment.post.userId === newComment.userId,
              likedByMe: newComment.commentLikes[0]?.isPositive,
            };
          });
        },
      })
      .mutation("updateComment", {
        input: z.object({
          id: z.string().cuid(),
          text: z.string().min(1),
          postId: z.string().cuid(),
        }),
        async resolve({ input, ctx }): Promise<CommentOutputType> {
          const comment = await ctx.prisma.comment.findFirst({
            where: {
              userId: ctx.session.user.id,
              id: input.id,
            },
          });

          if (!comment) {
            throw new trpc.TRPCError({
              code: "FORBIDDEN",
              message: "User has not access to that comment",
            });
          }

          const updatedComment = await ctx.prisma.comment.update({
            where: {
              id: input.id,
            },
            data: {
              text: input.text,
            },
            include: {
              user: true,
              commentLikes: true,
              post: true,
            },
          });

          return {
            ...updatedComment,
            isAuthorOfPost:
              updatedComment.post.userId === updatedComment.userId,
            likedByMe: updatedComment.commentLikes[0]?.isPositive,
          };
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
        },
      })
  );
