import NextImage from "next/image";
import { getRelativeTime } from "../../utils/getRelativeTime";

type PostComponentHeaderProps = {
  image: string | null;
  username: string;
  date: Date;
};

const PostHeader: React.FC<PostComponentHeaderProps> = ({
  image,
  username,
  date,
}) => {
  const formattedDate = getRelativeTime(date);

  return (
    <div className="flex space-x-8 p-2">
      <div className="flex justify-center space-x-2">
        <NextImage
          alt="Avatar"
          src={image || "/user-placeholder.jpg"}
          width={22}
          height={22}
          className="rounded-full"
          loading="lazy"
        />
        <span>{username}</span>
      </div>
      <div className="tooltip" data-tip={date}>
        <span>{formattedDate}</span>
      </div>
    </div>
  );
};

export default PostHeader;
