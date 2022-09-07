import Image from "next/image";
import { FormEvent, ReactElement, useEffect, useState } from "react";
import { Layout } from "../components/Layout";
import { trpc } from "../utils/trpc";
import { NextPageWithLayout } from "./_app";
import { supabase } from "../utils/supabaseClient";

const Profile: NextPageWithLayout<React.FC> = () => {
  const utils = trpc.useContext();
  const me = trpc.useQuery(["user.me"]);
  const updateUserProfile = trpc.useMutation(["user.updateUserPhoto"], {
    onSuccess: () => {
      utils.invalidateQueries(["user.me"]);
    },
  });

  const [file, setFile] = useState<File>();

  // useEffect(() => {
  //   const result = async () => {
  //     const { data, error } = await supabase.storage
  //       .from("public/photos")
  //       .download("image.jpeg");
  //     if (error) {
  //       throw error;
  //     }

  //     console.log("bucketsList: ", data);

  //     const url = URL.createObjectURL(data);
  //     setDownloadedImage(url);
  //     console.log("downloadedImage: ", url);
  //   };
  //   result();
  // }, []);

  const onFileChange = (e: FormEvent<HTMLInputElement>) => {
    setFile(e.currentTarget.files?.[0]);
  };

  const uploadImage = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!file) return;

    const fileExt = file.name.split(".").pop();
    const fileName = `${Math.random()}.${fileExt}`;

    const { error: uploadError, data } = await supabase.storage
      .from("photos")
      .upload(fileName, file);
    if (uploadError) throw uploadError;

    const { data: publicData } = supabase.storage
      .from("photos")
      .getPublicUrl(data.path);

    await updateUserProfile.mutateAsync({ imgUrl: publicData.publicUrl });
  };

  return (
    <div className="  shadow bg-base-100">
      {!me.isLoading && (
        <form onSubmit={uploadImage}>
          <div className="">
            <button type="submit">Upload</button>
            <div className="avatar">
              <div className="w-32 rounded">
                <Image
                  src={me.data?.image ?? "/user-placeholder.jpg"}
                  alt="Not image"
                  layout="fill"
                />
                <input
                  className="relative"
                  onChange={onFileChange}
                  type="file"
                  accept="image/png, image/jpeg"
                />
              </div>
            </div>
          </div>
        </form>
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
