// src/server/router/index.ts
import { createRouter } from "./context";
import superjson from "superjson";

import { exampleRouter } from "./example";
import { protectedExampleRouter } from "./protected-example-router";
import { postRouter } from "./posts";
import { userRouter } from "./users";

export const appRouter = createRouter()
  .transformer(superjson)
  .merge("example.", exampleRouter)
  .merge("auth.", protectedExampleRouter)
  .merge("user.", userRouter)
  .merge("post.", postRouter);

// export type definition of API
export type AppRouter = typeof appRouter;
