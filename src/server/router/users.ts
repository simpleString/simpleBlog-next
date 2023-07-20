import { z } from "zod";
import { createRouter } from "./context";
import { createProtectedRouter } from "./protected-router";
import type { User } from "@prisma/client";
import { EXPIRATION_TIME_FOR_REDIS } from "../../constants/backend";

export const userRouter = createRouter()
  .query("me", {
    async resolve({ ctx }) {
      if (!ctx.session?.user) {
        return null;
      }
      const cachedUser = await ctx.redis.get(`user:${ctx.session.user.id}`);
      if (cachedUser) {
        return JSON.parse(cachedUser) as User;
      }

      const user = await ctx.prisma.user.findFirst({
        where: { id: ctx.session.user.id },
      });

      await ctx.redis.set(
        `user:${ctx.session.user.id}`,
        JSON.stringify(user),
        "EX",
        EXPIRATION_TIME_FOR_REDIS
      );

      return user;
    },
  })
  .merge(
    "",
    createProtectedRouter()
      .mutation("updateUserPhoto", {
        input: z.object({ imgUrl: z.string().url() }),
        async resolve({ ctx, input }) {
          const user = await ctx.prisma.user.update({
            data: { image: input.imgUrl },
            where: { id: ctx.session.user.id },
            select: null,
          });

          await ctx.redis.set(
            `user:${ctx.session.user.id}`,
            JSON.stringify(user),
            "EX",
            EXPIRATION_TIME_FOR_REDIS
          );
          return user;
        },
      })
      .mutation("updateUser", {
        input: z.object({ name: z.string().min(1) }),
        async resolve({ ctx, input }) {
          const user = await ctx.prisma.user.update({
            where: { id: ctx.session.user.id },
            data: { name: input.name },
          });

          await ctx.redis.set(
            `user:${ctx.session.user.id}`,
            JSON.stringify(user),
            "EX",
            EXPIRATION_TIME_FOR_REDIS
          );
          return user;
        },
      })
  );
