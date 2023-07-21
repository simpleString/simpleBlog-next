import Head from "next/head";
import { ToastContainer } from "react-toastify";
// import NavBar from "../components/Navbar/NavBar";
import dynamic from "next/dynamic";
interface LayoutProps {
  children: React.ReactNode;
  pageTitle?: string;
  description?: string;
}

const NavBar = dynamic(() => import("../components/Navbar/NavBar"), {
  ssr: false,
});

export const Layout: React.FC<LayoutProps> = ({
  children,
  pageTitle = "Simple Blog",
  description = "SimpleBlog",
}) => {
  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={description} />
        <link rel="icon" href="/favicon.ico" />
      </Head>

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
