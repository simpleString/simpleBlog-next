import Head from "next/head";
import { Footer } from "../components/Footer";
import NavBar from "../components/Navbar/NavBar";
import { ToastContainer } from "react-toastify";
interface LayoutProps {
  children: React.ReactNode;
  pageTitle?: string;
  description?: string;
}

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
          <ToastContainer />
          {children}
        </div>
      </div>
      <Footer />
    </>
  );
};
