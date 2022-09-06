import { useSidebarState } from "../store";

const Sidebar: React.FC = () => {
  const isSidebarOpen = useSidebarState((state) => state.sidebarOpen);

  // TODO: Make open sidebar animation
  return (
    <>
      <div
        style={{ display: isSidebarOpen ? "block" : "none" }}
        className="z-50 fixed top-0  h-full w-5/6  md:static md:z-0"
      >
        <div>
          <label className="btn btn-square btn-ghost swap swap-rotate">
            <input type="checkbox" />
            {/* <button
            // onClick={() => {
            //   setIsSidebarOpen(!isSidebarOpen);
            //   toggleSidebar();
            // }}
            /> */}
            <svg
              className="swap-off fill-current"
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="32"
              viewBox="0 0 512 512"
            >
              <path d="M64,384H448V341.33H64Zm0-106.67H448V234.67H64ZM64,128v42.67H448V128Z" />
            </svg>

            <svg
              className="swap-on fill-current"
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="32"
              viewBox="0 0 512 512"
            >
              <polygon points="400 145.49 366.51 112 256 222.51 145.49 112 112 145.49 222.51 256 112 366.51 145.49 400 256 289.49 366.51 400 400 366.51 289.49 256 400 145.49" />
            </svg>
          </label>
        </div>
        <ul className="menu p-4 w-80 bg-base-100 text-base-content">
          <li>
            <a>Sidebar Item 1</a>
          </li>
          <li>
            <a>Sidebar Item 2</a>
          </li>
        </ul>
      </div>
      <div
        className={`${
          isSidebarOpen &&
          "absolute top-0 left-0 w-screen h-full bg-[rgb(0,0,0,0.6)]"
        } + md:hidden`}
      ></div>
    </>
  );
};

export default Sidebar;
