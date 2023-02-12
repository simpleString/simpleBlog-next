import { SVGProps } from "react";
import { twMerge } from "tailwind-merge";

export const PencilIcon = () => <i className="ri-pencil-line" />;
export const ChevronUpIcon = ({
  className,
  ...props
}: SVGProps<HTMLElement>) => (
  <i {...props} className={twMerge("ri-arrow-up-s-line", className)} />
);
export const ChevronDownIcon = ({
  className,
  ...props
}: SVGProps<HTMLElement>) => (
  <i {...props} className={twMerge("ri-arrow-down-s-line", className)} />
);
export const MessageBubbleIcon = () => <i className="ri-chat-1-line" />;
export const UploadIcon = () => <i className="ri-upload-line" />;
export const SearchIcon = () => <i className="ri-search-line" />;
export const MenuIcon = (props: SVGProps<SVGSVGElement>) => (
  <i
    className={twMerge("ri-menu-line text-2xl text-center", props.className)}
  />
);
export const CloseIcon = (props: SVGProps<SVGSVGElement>) => (
  <i
    className={twMerge("ri-close-line text-2xl text-center", props.className)}
  />
);
