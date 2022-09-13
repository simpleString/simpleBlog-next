import React, { useState, useRef, useEffect, ReactNode } from "react";
import { twMerge } from "tailwind-merge";

type DropdownProps = {
  buttonComponent: ReactNode;
  children: ReactNode;
  childrenClasses?: string;
  buttonComponentClasses?: string;
};

const Dropdown: React.FC<DropdownProps> = ({
  buttonComponent,
  children,
  childrenClasses,
  buttonComponentClasses,
}) => {
  const [menuOpened, setMenuOpened] = useState(false);
  const menu = useRef<HTMLDivElement>(null);
  const menuButton = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpened) {
      if (document.activeElement instanceof HTMLElement) {
        console.log("state work");
        document.activeElement.blur();
      }
    } else if (menuOpened && !menu.current?.contains(document.activeElement)) {
      setMenuOpened(false);
    }
  }, [menuOpened]);

  return (
    <div ref={menu} className="dropdown dropdown-end">
      <div
        ref={menuButton}
        tabIndex={0}
        className={twMerge("btn btn-square btn-ghost", buttonComponentClasses)}
        onBlur={() => {
          setMenuOpened(false);
        }}
        onClick={(e) => {
          if (menuOpened) {
            setMenuOpened(false);
          } else {
            setMenuOpened(true);
          }
        }}
      >
        {buttonComponent}
      </div>
      <ul
        tabIndex={0}
        className={twMerge(
          "p-2 shadow menu dropdown-content bg-base-100 rounded-box w-52 text-neutral",
          childrenClasses
        )}
        onBlur={() => {
          menuButton.current?.focus();
        }}
        onFocus={() => {
          setMenuOpened(true);
        }}
      >
        <div
          onClick={() => {
            setMenuOpened(false);
            if (document.activeElement instanceof HTMLElement)
              document.activeElement.blur();
          }}
        >
          {children}
        </div>
      </ul>
    </div>
  );
};

export default Dropdown;
