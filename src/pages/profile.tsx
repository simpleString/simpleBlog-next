import { useSession } from "next-auth/react";
import Image from "next/image";
import { FormEvent, ReactElement, useEffect, useState } from "react";
import LoadingSpinner from "../components/LoadingSpinner";
import { SupabaseBackets } from "../constants/supabase";
import { Layout } from "../layouts/Layout";
import { fileUploader } from "../utils/fileUploader";
import { trpc } from "../utils/trpc";
import { NextPageWithLayout } from "./_app";

const Profile: NextPageWithLayout<React.FC> = () => {
  useSession({ required: true });
  const utils = trpc.useContext();
  const me = trpc.useQuery(["user.me"], { enabled: false });
  const updateUserData = trpc.useMutation(["user.updateUser"], {
    onSuccess: () => {
      utils.refetchQueries(["user.me"]);
    },
  });
  const updateUserProfile = trpc.useMutation(["user.updateUserPhoto"], {
    onSuccess: () => {
      utils.refetchQueries(["user.me"]);
    },
  });

  const [name, setName] = useState<null | string | undefined>("");

  useEffect(() => {
    //TODO: Optimize it. It's download twice and in every page entering
    const init = async () => {
      await me.refetch();
      console.log("name is ", me.data);
      setName(me.data?.name);
    };
    init();
  }, [me.isLoading]);

  const onFileChange = async (e: FormEvent<HTMLInputElement>) => {
    const file = e.currentTarget.files?.[0];
    if (!file) return;

    const photoUrl = await fileUploader({
      file,
      backet: SupabaseBackets.PHOTO,
    });

    await updateUserProfile.mutateAsync({ imgUrl: photoUrl });
  };

  if (me.isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="  shadow bg-base-100">
      {!me.isLoading && (
        <div className="indicator">
          <div className="avatar">
            <div className="w-32 rounded-full">
              <Image
                src={me.data?.image ?? "/user-placeholder.jpg"}
                alt="Profile image"
                layout="fill"
                loading="lazy"
              />
            </div>
          </div>
          <label className="bottom-6 right-6 indicator-item indicator-bottom badge cursor-pointer badge-secondary">
            <i className="ri-upload-line" />
            <input
              className="hidden"
              onChange={onFileChange}
              type="file"
              accept="image/png, image/jpeg"
            />
          </label>
        </div>
      )}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (name) {
            updateUserData.mutateAsync({ name });
          }
        }}
        className="form-control p-4"
      >
        <label className="label">Name</label>
        <input
          value={name || ""}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name"
          className="input mb-4"
        />
        <button type="submit" className="btn mb-4">
          Save
        </button>
      </form>
    </div>
  );
};

Profile.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>;
};

export default Profile;
