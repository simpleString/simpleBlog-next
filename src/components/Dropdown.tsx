import React, { useState, useRef, useEffect, ReactNode } from "react";
import { twMerge } from "tailwind-merge";

type DropdownProps = {
  buttonComponent: ReactNode;
  children: ReactNode;
  childrenClasses?: string;
  buttonComponentClasses?: string;
  dropdownClasses?: string;
};

const Dropdown: React.FC<DropdownProps> = ({
  buttonComponent,
  children,
  childrenClasses,
  buttonComponentClasses,
  dropdownClasses,
}) => {
  const [menuOpened, setMenuOpened] = useState(false);
  const menu = useRef<HTMLDivElement>(null);
  const menuButton = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpened) {
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
    } else if (menuOpened && !menu.current?.contains(document.activeElement)) {
      setMenuOpened(false);
    }
  }, [menuOpened]);

  return (
    <div ref={menu} className={twMerge("dropdown", dropdownClasses)}>
      <div
        ref={menuButton}
        tabIndex={0}
        className={twMerge("", buttonComponentClasses)}
        onBlur={() => {
          setMenuOpened(false);
        }}
        onClick={() => {
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
          "p-2 shadow menu dropdown-content bg-base-100 w-52 text-neutral ",
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
