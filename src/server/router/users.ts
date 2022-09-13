import { z } from "zod";
import { createRouter } from "./context";
import { createProtectedRouter } from "./protected-router";

export const userRouter = createRouter()
  .query("me", {
    async resolve({ ctx }) {
      if (!ctx.session?.user) {
        return null;
      }
      const user = await ctx.prisma.user.findFirst({
        where: { id: ctx.session.user.id },
      });
      return user;
    },
  })
  .merge(
    "",
    createProtectedRouter()
      .mutation("updateUserPhoto", {
        input: z.object({ imgUrl: z.string().url() }),
        resolve({ ctx, input }) {
          return ctx.prisma.user.update({
            data: { image: input.imgUrl },
            where: { id: ctx.session.user.id },
            select: null,
          });
        },
      })
      .mutation("updateUser", {
        input: z.object({ name: z.string().min(1) }),
        resolve({ ctx, input }) {
          return ctx.prisma.user.update({
            where: { id: ctx.session.user.id },
            data: { name: input.name },
          });
        },
      })
      .query("communities", {
        resolve({ ctx }) {
          return ctx.prisma.community.findMany({
            where: { users: { some: { id: ctx.session.user.id } } },
          });
        },
      })
  );
