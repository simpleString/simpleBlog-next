import { Footer } from "./Footer";
import { NavBar } from "./NavBar";

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="">
      <NavBar />
      {children}
      <Footer />
    </div>
  );
};
