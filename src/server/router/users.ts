import { createRouter } from "./context";
import { createProtectedRouter } from "./protected-router";

export const userRouter = createRouter().query("me", {
  resolve({ ctx }) {
    if (!ctx.session?.user) {
      return null;
    }
    return ctx.prisma.user.findFirst({
      where: { id: ctx.session.user.id },
    });
  },
});
