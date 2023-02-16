type getLikeValueType = {
  inputLikeBooleanValue: boolean;
  previousLikeValue: number | undefined;
};

export const getLikeValue = ({
  inputLikeBooleanValue,
  previousLikeValue,
}: getLikeValueType) => {
  let likeValueChange = 0;
  let likeValue = 0;
  if (inputLikeBooleanValue) {
    if (previousLikeValue === 1) {
      likeValue = 0;
      likeValueChange = -1;
    } else if (previousLikeValue === 0) {
      likeValue = 1;
      likeValueChange = 1;
    } else {
      likeValue = 1;
      likeValueChange = 2;
    }
  } else {
    if (previousLikeValue === 1) {
      likeValue = -1;
      likeValueChange = -2;
    } else if (previousLikeValue === 0) {
      likeValue = -1;
      likeValueChange = -1;
    } else {
      likeValue = 0;
      likeValueChange = 1;
    }
  }

  return { likeValue, likeValueChange };
};
