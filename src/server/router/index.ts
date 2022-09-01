// src/server/router/index.ts
import { createRouter } from "./context";
import superjson from "superjson";

import { postRouter } from "./posts";
import { userRouter } from "./users";
import { setTimeout } from "timers/promises";

export const appRouter = createRouter()
  .transformer(superjson)
  // .middleware(async ({ next }) => {
  //   console.log("start");
  //   await setTimeout(6000);
  //   console.log("end");

  //   return next();
  // })
  .merge("user.", userRouter)
  .merge("post.", postRouter);

// export type definition of API
export type AppRouter = typeof appRouter;
