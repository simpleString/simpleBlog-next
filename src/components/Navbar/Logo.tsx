import NextLink from "next/link";

const Logo: React.FC = () => {
  return (
    <NextLink href="/">
      <a className="btn btn-ghost normal-case text-xl">SimpleBlog</a>
    </NextLink>
  );
};

export default Logo;
