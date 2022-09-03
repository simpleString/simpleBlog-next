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
  return (
    <div className="">
      {/* <GlobalLoadingSpinner /> */}
      <NavBarWithNoSSR />
      {children}
      <Footer />
    </div>
  );
};
