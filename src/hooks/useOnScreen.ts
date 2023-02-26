import { useState, useEffect, RefObject } from "react";

export const useOnScreen = (ref: RefObject<HTMLElement>) => {
  const [isIntersecting, setIntersecting] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry) setIntersecting(entry.isIntersecting);
    });
    if (ref.current) {
      observer.observe(ref.current);
    }
  }, [ref]);
  return isIntersecting;
};
