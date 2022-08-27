import { createRouter } from "./context";

export const userRouter = createRouter().query("me", {
  async resolve({ ctx }) {
    if (!ctx.session?.user) {
      return null;
    }
    const user = await ctx.prisma.user.findFirst({
      where: { id: ctx.session.user.id },
    });
    return user;
  },
});
