import { twMerge } from "tailwind-merge";

type LikeControlComponentProps = {
  callbackFn: (isPositive: boolean) => void;
  likeValue: number | undefined;
  likesCount: number;
};

const LikeControlComponent: React.FC<
  LikeControlComponentProps & React.ComponentPropsWithoutRef<"div">
> = ({ callbackFn, likeValue, likesCount, ...props }) => {
  const changeLike = async (isPositive: boolean) => {
    callbackFn(isPositive);
  };

  const likeIsNegative = likeValue === -1;
  const likeIsPositive = likeValue === 1;

  return (
    <div className={twMerge("flex items-center text-base", props.className)}>
      <button
        className={`${
          likeIsNegative
            ? "text-red-700"
            : "hover:text-red-900  motion-safe:hover:scale-105 duration-500 motion-safe:hover:translate-y-1.5"
        }`}
        onClick={() => changeLike(false)}
      >
        <i className="ri-arrow-down-s-line text-2xl" />
      </button>
      <span>{likesCount}</span>
      <button
        className={`${
          likeIsPositive
            ? "text-green-700"
            : "hover:text-green-900  motion-safe:hover:scale-105 duration-500 motion-safe:hover:-translate-y-1.5"
        }`}
        onClick={() => changeLike(true)}
      >
        <i className="ri-arrow-up-s-line text-2xl" />
      </button>
    </div>
  );
};

export default LikeControlComponent;
