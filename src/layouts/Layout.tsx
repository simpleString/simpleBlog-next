import dynamic from "next/dynamic";
import { Footer } from "../components/Footer";
interface LayoutProps {
  children: React.ReactNode;
}

const NavBarWithNoSSR = dynamic(() => import("../components/Navbar/NavBar"), {
  ssr: false,
});

const SidebarWithNoSSR = dynamic(() => import("../components/Sidebar"), {
  ssr: false,
});

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <>
      <NavBarWithNoSSR />
      <div className="flex mt-20">
        <SidebarWithNoSSR />
        <div className="mx-auto w-full sm:max-w-2xl ">{children}</div>
      </div>
      <Footer />
    </>
  );
};
