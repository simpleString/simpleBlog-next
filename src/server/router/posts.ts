import { createRouter } from "./context";
import { z } from "zod";
import { createProtectedRouter } from "./protected-router";

export const postRouter = createRouter()
  .query("posts", {
    resolve({ ctx }) {
      return ctx.prisma.post.findMany({ include: { user: true } });
    },
  })
  .merge(
    "create-posts",
    createProtectedRouter().mutation("", {
      input: z.object({
        title: z.string().min(5),
        text: z.string(),
      }),
      resolve({ input, ctx }) {
        return ctx.prisma.post.create({
          data: { ...input, userId: ctx.session.user.id },
        });
      },
    })
  );
