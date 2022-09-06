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
      <div className="flex">
        <SidebarWithNoSSR />
        <div>{children}</div>
      </div>
      <Footer />
    </>
  );
};
