import { useSidebarState } from "../../store";
import { MenuIcon, CloseIcon } from "../Svg";

const MenuButton: React.FC = () => {
  const toggleSidebar = useSidebarState((state) => state.toggle);

  const isSidebarOpen = useSidebarState((state) => state.sidebarOpen);

  return (
    <label
      className={` "btn btn-square btn-ghost swap swap-rotate" + ${
        isSidebarOpen ? " swap-active" : ""
      }
  `}
    >
      <button
        onClick={() => {
          toggleSidebar();
        }}
      />
      <MenuIcon className="swap-off fill-current" />

      <CloseIcon className="swap-on fill-current" />
    </label>
  );
};

export default MenuButton;
