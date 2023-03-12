import { SEARCH_INTERVAL } from "../../constants/backend";

export const getSearchInterval = (interval: number) => {
  const newInterval = SEARCH_INTERVAL[interval];
  return newInterval;
};
