// src/server/router/index.ts
import { createRouter } from "./context";
import superjson from "superjson";

import { postRouter } from "./posts";
import { userRouter } from "./users";
import { setTimeout } from "timers/promises";
import { commentRouter } from "./comments";

export const appRouter = createRouter()
  .transformer(superjson)
  // .middleware(async ({ next }) => {
  //   console.log("start");
  //   await setTimeout(6000);
  //   console.log("end");

  //   return next();
  // })
  .merge("comment.", commentRouter)
  .merge("user.", userRouter)
  .merge("post.", postRouter);

// export type definition of API
export type AppRouter = typeof appRouter;
