import { Dispatch, SetStateAction } from "react";

export type stateCallback<T> = Dispatch<SetStateAction<T>>;

export type FieldZodError =
  | {
      [x: string]: string[] | undefined;
      [x: number]: string[] | undefined;
      [x: symbol]: string[] | undefined;
    }
  | undefined;
