import dynamic from "next/dynamic";
import { Footer } from "./Footer";
interface LayoutProps {
  children: React.ReactNode;
}

const NavBarWithNoSSR = dynamic(() => import("./NavBar"), {
  ssr: false,
});

const SidebarWithNoSSR = dynamic(() => import("./Sidebar"), {
  ssr: false,
});

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <>
      <NavBarWithNoSSR />
      <div className="flex mt-[70px]">
        <SidebarWithNoSSR />
        <div className=" mx-auto max-w w-full md:w-2/4 lg:w-1/3">
          {children}
        </div>
      </div>
      <Footer />
    </>
  );
};
