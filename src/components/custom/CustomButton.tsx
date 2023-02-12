import { ButtonHTMLAttributes } from "react";
import { twMerge } from "tailwind-merge";

type CustomButtonProps = {
  variant?: "primary" | "secondary";
  children: React.ReactNode;
} & ButtonHTMLAttributes<HTMLButtonElement>;

const CustomButton: React.FC<CustomButtonProps> = ({
  variant = "primary",
  children,
  className,
  ...props
}) => {
  let buttonClasses: string;
  if (variant === "primary") {
    buttonClasses =
      "mr-2 px-3 border rounded border-black font-semibold text-lg hover:bg-black hover:text-white ";
  } else {
    buttonClasses =
      "mr-2 px-3 border rounded border-black font-semibold text-lg bg-yellow-300 hover:bg-yellow-500 ";
  }

  return (
    <button {...props} className={twMerge(buttonClasses, className)}>
      {children}
    </button>
  );
};

export default CustomButton;
