import NextLink from "next/link";

type PostTitleProps = {
  postId: string;
  title: string;
};

const PostTitle: React.FC<PostTitleProps> = ({ title, postId }) => {
  return (
    <div>
      <NextLink href={`/post/${postId}`}>
        <a className="font-medium text-2xl mt-2 p-4">{title}</a>
      </NextLink>
    </div>
  );
};

export default PostTitle;
