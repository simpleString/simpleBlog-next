import { Dispatch, SetStateAction } from "react";
import { inferQueryInput, inferQueryOutput } from "../utils/trpc";

export type stateCallback<T> = Dispatch<SetStateAction<T>>;

export type FieldZodError =
  | {
      [x: string]: string[] | undefined;
      [x: number]: string[] | undefined;
      [x: symbol]: string[] | undefined;
    }
  | undefined;

export type OrderByType = Pick<
  inferQueryInput<"comment.getComments">,
  "orderBy"
>["orderBy"];

export type CommentOrderType = {
  comment: inferQueryOutput<"comment.getComments">[0];
  order: OrderByType;
};
