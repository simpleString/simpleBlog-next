import { useSidebarState } from "../../store";

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
      <i className="ri-menu-line swap-off " />

      <i className="ri-close-line swap-on " />
    </label>
  );
};

export default MenuButton;
