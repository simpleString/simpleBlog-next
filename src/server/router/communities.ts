import { z } from "zod";
import { createRouter } from "./context";
import { createProtectedRouter } from "./protected-router";

export const communityRouter = createRouter()
  // .query("me", {
  //   async resolve({ ctx }) {
  //     if (!ctx.session?.user) {
  //       return null;
  //     }
  //     const user = await ctx.prisma.user.findFirst({
  //       where: { id: ctx.session.user.id },
  //     });
  //     return user;
  //   },
  // })
  .merge(
    "",
    createProtectedRouter()
      .mutation("createCommunity", {
        input: z.object({
          img: z.string().url(),
          title: z.string().min(1),
          description: z.string(),
        }),
        resolve({ ctx, input }) {
          return ctx.prisma.community.create({
            data: { ...input, users: { connect: { id: ctx.session.user.id } } },
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
