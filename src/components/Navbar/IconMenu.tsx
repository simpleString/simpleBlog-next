import { signOut } from "next-auth/react";
import Dropdown from "../Dropdown";
import NextImage from "next/image";
import NextLink from "next/link";

type IconMenuProps = {
  image: string | null;
};

const IconMenu: React.FC<IconMenuProps> = ({ image }) => {
  return (
    <Dropdown
      dropdownClasses="dropdown-end"
      buttonComponentClasses="btn btn-ghost btn-circle avatar"
      childrenClasses=""
      buttonComponent={
        <div className="w-10 rounded-full">
          <NextImage
            className="cursor-pointer rounded-full"
            src={image || "/user-placeholder.jpg"}
            width="48"
            alt="Not image"
            height="48"
            loading="lazy"
          />
        </div>
      }
    >
      <li>
        <NextLink href="/profile">
          <a>Profile</a>
        </NextLink>
      </li>
      <li>
        <NextLink href="/drafts">
          <a>Drafts</a>
        </NextLink>
      </li>
      <li>
        <NextLink href="/post/saved">
          <a>Saved Posts</a>
        </NextLink>
      </li>
      <li>
        <a onClick={() => signOut()}>Logout</a>
      </li>
    </Dropdown>
  );
};

export default IconMenu;
