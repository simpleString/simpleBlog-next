import { z } from "zod";
import { createProtectedRouter } from "./protected-router";

export const fileRouter = createProtectedRouter().mutation("uploadImage", {
  input: z.object({ image: z.string().url() }),
  async resolve({ ctx }) {
    // return await ctx.prisma.
    const user = await ctx.prisma.user.findFirst({
      where: { id: ctx.session.user.id },
    });
    return user;
  },
});
