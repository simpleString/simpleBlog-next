import dynamic from "next/dynamic";
import { ToastContainer } from "react-toastify";
import MetaHead from "../components/MetaHead";
interface LayoutProps {
  children: React.ReactNode;
}

const NavBar = dynamic(() => import("../components/Navbar/NavBar"), {
  ssr: false,
});

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <>
      <MetaHead />
      <NavBar />
      <div className="mt-20 flex">
        <div className="mx-auto min-h-screen w-full sm:max-w-2xl">
          <ToastContainer closeButton={false} limit={4} />
          {children}
        </div>
      </div>
    </>
  );
};
