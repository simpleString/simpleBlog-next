import NextLink from "next/link";

type PostTitleProps = {
  title: string;
  link: string;
};

const PostTitle: React.FC<PostTitleProps> = ({ title, link }) => {
  return (
    <div>
      <NextLink href={link}>
        <a className="mt-2 p-4 text-2xl font-medium">{title}</a>
      </NextLink>
    </div>
  );
};

export default PostTitle;
