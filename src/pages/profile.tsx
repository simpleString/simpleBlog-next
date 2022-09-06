import { ReactElement } from "react";
import { Layout } from "../components/Layout";
import { NextPageWithLayout } from "./_app";
import Image from "next/image";
import { trpc } from "../utils/trpc";

const Profile: NextPageWithLayout<React.FC> = () => {
  const me = trpc.useQuery(["user.me"]);

  return (
    <div className="w-full md:w-1/3 mx-auto mt-8 shadow bg-base-100">
      {!me.isLoading && (
        <div className="w-10 rounded-full">
          <Image
            className="rounded-full cursor-pointer"
            src={me.data?.image ?? "/user-placeholder.jpg"}
            width="48"
            alt="Not image"
            height="48"
          />
        </div>
      )}
      <form className="form-control p-4">
        <label className="label">Name</label>
        <input placeholder="Name" className="input" />
        <button className="btn">Save</button>
      </form>
    </div>
  );
};

Profile.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>;
};

export default Profile;
