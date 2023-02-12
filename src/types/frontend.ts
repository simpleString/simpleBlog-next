import { Dispatch, SetStateAction } from "react";

export type stateCallback<T> = Dispatch<SetStateAction<T>>;
