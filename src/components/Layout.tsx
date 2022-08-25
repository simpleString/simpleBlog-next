import { Footer } from "./Footer";
import { NavBar } from "./NavBar";

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="bg-gray-100">
      <NavBar />
      {children}
      <Footer />
    </div>
  );
};
