// src/server/router/index.ts
import superjson from "superjson";
import { createRouter } from "./context";

import { ZodError } from "zod";
import { commentRouter } from "./comments";
import { fileRouter } from "./files";
import { postRouter } from "./posts";
import { userRouter } from "./users";

export const appRouter = createRouter()
  .transformer(superjson)
  .formatError(({ shape, error }) => {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.code === "BAD_REQUEST" && error.cause instanceof ZodError
            ? error.cause.flatten()
            : null,
      },
    };
  })
  .merge("comment.", commentRouter)
  .merge("user.", userRouter)
  .merge("post.", postRouter)
  .merge("file.", fileRouter);

// export type definition of API
export type AppRouter = typeof appRouter;
