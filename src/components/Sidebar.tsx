import { useSidebarState } from "../store";

const Sidebar: React.FC = () => {
  const isSidebarOpen = useSidebarState((state) => state.sidebarOpen);

  // TODO: Make open sidebar animation
  return (
    <div style={{ display: isSidebarOpen ? "block" : "none" }}>
      <ul className="menu p-4 w-80 bg-base-100 text-base-content">
        <li>
          <a>Sidebar Item 1</a>
        </li>
        <li>
          <a>Sidebar Item 2</a>
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;
