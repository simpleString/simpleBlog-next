import NextLink from "next/link";
import { useScrollState } from "../../store";

const Logo: React.FC = () => {
  const resetScroll = useScrollState((state) => state.reset);

  return (
    <NextLink href="/">
      <a
        onClick={() => resetScroll()}
        className="btn btn-ghost normal-case text-xl"
      >
        SimpleBlog
      </a>
    </NextLink>
  );
};

export default Logo;
