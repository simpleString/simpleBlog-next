import NextImage from "next/image";
import { useMemo } from "react";

type PostComponentHeaderProps = {
  image: string | null;
  userName: string;
  date: Date;
};

const PostHeader: React.FC<PostComponentHeaderProps> = ({
  image,
  userName,
  date,
}) => {
  const formattedDate = useMemo(() => date.toLocaleDateString(), [date]);

  return (
    <div className="flex p-4">
      <div className="mr-6">
        <NextImage
          alt="Avatar"
          src={image || "/user-placeholder.jpg"}
          width="24"
          height="24"
          className="rounded"
        />
      </div>
      <div>{userName}</div>
      <div className="ml-auto">{formattedDate}</div>
    </div>
  );
};

export default PostHeader;
