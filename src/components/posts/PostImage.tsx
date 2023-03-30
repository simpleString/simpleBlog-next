import NextLink from "next/link";
import NextImage from "next/image";

type PostImageProps = {
  image: string;
  postId: string;
};

const PostImage: React.FC<PostImageProps> = ({ postId, image }) => {
  return (
    <NextLink href={`/post/${postId}`} passHref>
      <div className="p-2">
        <NextImage
          className="cursor-pointer"
          src={image}
          alt="Post image"
          layout="responsive"
          width="640"
          height="360"
          loading="lazy"
          objectFit="contain"
        />
      </div>
    </NextLink>
  );
};

export default PostImage;
