// src/server/router/index.ts
import { createRouter } from "./context";
import superjson from "superjson";

import { postRouter } from "./posts";
import { userRouter } from "./users";
import { setTimeout } from "timers/promises";

export const appRouter = createRouter()
  .transformer(superjson)
  .middleware(async ({ next }) => {
    await setTimeout(1000);
    return next();
  })
  .merge("user.", userRouter)
  .merge("post.", postRouter);

// export type definition of API
export type AppRouter = typeof appRouter;
