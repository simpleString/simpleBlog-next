/* eslint-disable prefer-spread */
import { useSidebarState } from "../store";

const Sidebar: React.FC = () => {
  const toggleSidebar = useSidebarState((state) => state.toggle);
  const sidebarOpenStatus = useSidebarState((state) => state.sidebarOpen);
  // const [isSidebarOpen, setIsSidebarOpen] = useState(
  //   useSidebarState((state) => state.sidebarOpen)
  // );

  // TODO: Make open sidebar animation
  return (
    <>
      <div
        style={{ display: sidebarOpenStatus ? "block" : "none" }}
        className="z-50 relative h-screen md:z-0 "
      >
        <div className="fixed top-0 h-full bg-base-100 overflow-y-auto overflow-x-hidden w-9/12 md:max-w-max md:mt-[64px]">
          <div className="flex items-center bg-base-100 fixed z-50 w-9/12 h-16 md:hidden">
            <label
              className={` "relative left-3 btn btn-square btn-ghost swap swap-rotate" + ${
                sidebarOpenStatus ? " swap-active" : ""
              }
            `}
            >
              <button
                onClick={() => {
                  // setIsSidebarOpen(!isSidebarOpen);
                  toggleSidebar();
                }}
              />
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
          <ul className="menu p-4 bg-base-100 text-base-content">
            {Array.apply(null, Array(30)).map((_, i) => (
              <li key={i}>
                <a>Value {i}</a>
              </li>
            ))}
            <li>
              <a>Sidebar Item 1</a>
            </li>
            <li>
              <a>Sidebar Item 2</a>
            </li>
          </ul>
        </div>
      </div>
      <div
        onClick={() => toggleSidebar()}
        className={`${
          sidebarOpenStatus &&
          "fixed top-0 left-0 w-screen h-screen bg-[rgb(0,0,0,0.6)] z-20 visible"
        }  md:hidden`}
      ></div>
    </>
  );
};

export default Sidebar;