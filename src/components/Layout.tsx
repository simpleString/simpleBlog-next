import dynamic from "next/dynamic";
import { Footer } from "./Footer";
import { GlobalLoadingSpinner } from "./GlobalLoadingSpinner";
interface LayoutProps {
  children: React.ReactNode;
}

const NavBarWithNoSSR = dynamic(() => import("./NavBar"), {
  ssr: false,
});

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="">
      <GlobalLoadingSpinner />
      <NavBarWithNoSSR />
      {children}
      <Footer />
    </div>
  );
};
