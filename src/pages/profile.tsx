import Image from "next/image";
import { FormEvent, ReactElement, useEffect, useState } from "react";
import { Layout } from "../components/Layout";
import { trpc } from "../utils/trpc";
import { NextPageWithLayout } from "./_app";
import { supabase } from "../utils/supabaseClient";

const Profile: NextPageWithLayout<React.FC> = () => {
  const me = trpc.useQuery(["user.me"]);

  const [file, setFile] = useState<File>();
  const [downloadedImage, setDownloadedImage] = useState<string>();

  useEffect(() => {
    const result = async () => {
      const { data, error } = await supabase.storage
        .from("public/photos")
        .download("image.jpeg");
      if (error) {
        throw error;
      }

      console.log("bucketsList: ", data);

      const url = URL.createObjectURL(data);
      setDownloadedImage(url);
      console.log("downloadedImage: ", url);
    };
    result();
  }, []);

  const onFileChange = (e: FormEvent<HTMLInputElement>) => {
    setFile(e.currentTarget.files?.[0]);
  };

  const uploadImage = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!file) return;

    const fileExt = file.name.split(".").pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${fileName}`;

    console.log("filename: ", fileName);
    console.log("filePath: ", filePath);

    const { error: uploadError } = await supabase.storage
      .from("photos")
      .upload(fileName, file);
    if (uploadError) throw uploadError;
  };

  return (
    <div className="w-full md:w-1/3 mx-auto mt-8 shadow bg-base-100">
      {!me.isLoading && (
        <form onSubmit={uploadImage}>
          <div className="w-10 rounded-full">
            <input
              onChange={onFileChange}
              type="file"
              accept="image/png, image/jpeg"
            />
            <button type="submit">Upload</button>
            <Image
              className="rounded-full cursor-pointer"
              src={me.data?.image ?? "/user-placeholder.jpg"}
              width="48"
              alt="Not image"
              height="48"
            />
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
