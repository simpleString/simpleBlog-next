import dynamic from "next/dynamic";
import { useState, useEffect } from "react";
import { Footer } from "./Footer";
interface LayoutProps {
  children: React.ReactNode;
}

const NavBarWithNoSSR = dynamic(() => import("./NavBar"), {
  ssr: false,
});

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [hasWindow, setHasWindow] = useState(false);
  useEffect(() => {
    if (typeof window !== "undefined") {
      setHasWindow(true);
    }
  }, []);

  return (
    <div className="">
      {/* <GlobalLoadingSpinner /> */}
      {hasWindow && <NavBarWithNoSSR />}
      {children}
      <Footer />
    </div>
  );
};
