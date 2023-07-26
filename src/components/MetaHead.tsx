import Head from "next/head";
import { useRouter } from "next/router";

type MetaHeadProps = {
  pageTitle?: string;
  description?: string;
  author?: string;
  image?: string;
};

const MetaHead: React.FC<MetaHeadProps> = ({
  pageTitle = "SimpleString Blog",
  description = "SimpleString bloge it's a blog built with nextjs fullstack application for open minded people",
  author = "SimpleString Blog",
  image = "/simpleStringBlogImage.png",
}) => {
  const router = useRouter();

  const url =
    process.env.VERCEL_URL ?? `http://localhost:${process.env.PORT ?? 3000}`;
  return (
    <Head>
      <title>{pageTitle}</title>
      <meta name="description" content={description} key="description" />
      <meta name="author" content={author} key="author" />
      <link rel="icon" href="/favicon.ico" />

      <meta property="og:type" content="website" key="og:type" />
      <meta property="og:url" content={url + router.asPath} key="og:url" />
      <meta property="og:title" content={pageTitle} key="og:title" />
      <meta
        property="og:description"
        content={description}
        key="og:description"
      />
      <meta property="og:image" content={image} key="og:image" />

      <meta
        property="twitter:card"
        content="summary_large_image"
        key="twitter:card"
      />
      <meta
        property="twitter:url"
        content={url + router.asPath}
        key="twitter:url"
      />
      <meta property="twitter:title" content={pageTitle} key="twitter:title" />
      <meta
        property="twitter:description"
        content={description}
        key="twitter:description"
      />
      <meta property="twitter:image" content={image} key="twitter:image" />
    </Head>
  );
};

export default MetaHead;
