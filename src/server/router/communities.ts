import { z } from "zod";
import { createRouter } from "./context";
import { createProtectedRouter } from "./protected-router";

export const communityRouter = createRouter()
  .query("search", {
    input: z.object({
      title: z.string(),
    }),
    async resolve({ ctx, input }) {
      const userId = ctx.session?.user?.id;

      const communities = await ctx.prisma.community.findMany({
        where: {
          title: { startsWith: input.title },
          users: { none: { id: userId } },
        },
      });

      return communities;
    },
  })
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
      .query("communitiesForUser", {
        resolve({ ctx }) {
          return ctx.prisma.community.findMany({
            where: { users: { some: { id: ctx.session.user.id } } },
          });
        },
      })
  );
