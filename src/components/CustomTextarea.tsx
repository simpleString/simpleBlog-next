import { TextareaHTMLAttributes, useEffect, useRef } from "react";

const CustomTextarea: React.FC<TextareaHTMLAttributes<HTMLTextAreaElement>> = (
  props
) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef && textareaRef.current) {
      textareaRef.current.style.height = "0px";
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = scrollHeight + "px";
    }
  }, [props.value]);

  return (
    <textarea
      {...props}
      className={
        "min-w-full resize-none outline-none h-fit p-2 " + props.className
      }
      ref={textareaRef}
    />
  );
};

export default CustomTextarea;
