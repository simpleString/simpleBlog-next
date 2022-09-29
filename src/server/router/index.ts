// src/server/router/index.ts
import superjson from "superjson";
import { createRouter } from "./context";

import { commentRouter } from "./comments";
import { postRouter } from "./posts";
import { userRouter } from "./users";
import { communityRouter } from "./communities";
import { fileRouter } from "./files";

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
  .merge('file.', fileRouter)
  .merge("community.", communityRouter);

// export type definition of API
export type AppRouter = typeof appRouter;
