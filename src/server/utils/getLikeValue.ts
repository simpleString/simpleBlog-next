type getLikeValueType = {
  currentLikeValue: number;
  inputLikeValue: boolean;
};

export const getLikeValue = ({
  currentLikeValue,
  inputLikeValue,
}: getLikeValueType) => {
  let likeValueChange = 0;
  let likeValue = 0;
  if (inputLikeValue) {
    if (currentLikeValue === 1) {
      likeValue = 0;
      likeValueChange = -1;
    } else if (currentLikeValue === 0) {
      likeValue = 1;
      likeValueChange = 1;
    } else {
      likeValue = 1;
      likeValueChange = 2;
    }
  } else {
    if (currentLikeValue === 1) {
      likeValue = -1;
      likeValueChange = -2;
    } else if (currentLikeValue === 0) {
      likeValue = -1;
      likeValueChange = -1;
    } else {
      likeValue = 0;
      likeValueChange = 1;
    }
  }
  return { likeValueChange, likeValue };
};
