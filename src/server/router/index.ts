// src/server/router/index.ts
import superjson from "superjson";
import { createRouter } from "./context";

import { commentRouter } from "./comments";
import { fileRouter } from "./files";
import { postRouter } from "./posts";
import { userRouter } from "./users";

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
  .merge("post.", postRouter)
  .merge("file.", fileRouter);

// export type definition of API
export type AppRouter = typeof appRouter;
