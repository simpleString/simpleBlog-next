import { useSession } from "next-auth/react";
import Image from "next/image";
import { FormEvent, ReactElement, useEffect, useState } from "react";
import { toast } from "react-toastify";
import LoadingSpinner from "../components/LoadingSpinner";
import { SupabaseBackets } from "../constants/supabase";
import { Layout } from "../layouts/Layout";
import { fileUploader } from "../utils/fileUploader";
import { generateBase64Image } from "../utils/generateBase64Image";
import { trpc } from "../utils/trpc";
import { NextPageWithLayout } from "./_app";
import MetaHead from "../components/MetaHead";

const Profile: NextPageWithLayout<React.FC> = () => {
  const session = useSession({ required: true });
  const utils = trpc.useContext();

  const me = trpc.useQuery(["user.me"], { enabled: true });

  const [base64Image, setbase64Image] = useState<string>();

  const updateUserData = trpc.useMutation(["user.updateUser"], {
    onSuccess: () => {
      utils.invalidateQueries();
    },
  });
  const updateUserProfile = trpc.useMutation(["user.updateUserPhoto"], {
    onSuccess: () => {
      utils.invalidateQueries();
    },
  });

  const [name, setName] = useState<null | string | undefined>("");

  useEffect(() => {
    setName(me.data?.name);
  }, [me.data]);

  const onFileChange = async (e: FormEvent<HTMLInputElement>) => {
    const file = e.currentTarget.files?.[0];
    if (!file) return;

    const base64Image = await generateBase64Image(file);

    setbase64Image(base64Image);

    const toastId = toast.loading("📦 Uploading image...", {
      position: "bottom-center",
    });

    try {
      const photoUrl = await fileUploader({
        file,
        backet: SupabaseBackets.PHOTO,
      });
      await updateUserProfile.mutateAsync({ imgUrl: photoUrl });
      toast.update(toastId, {
        type: "success",
        render: "🎉 Image uploaded",
        autoClose: 3000,
        isLoading: false,
        closeButton: true,
      });
    } catch (error) {
      if (error instanceof Error) {
        toast.update(toastId, {
          type: "error",
          render: error.message,
          autoClose: 3000,
          isLoading: false,
          closeButton: true,
        });
      }
    }
  };

  if (me.isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <>
      <MetaHead
        pageTitle={session.data?.user?.name ?? undefined}
        description={`SimpleString bloge user ${session.data?.user?.name} profile`}
        author={session.data?.user?.name ?? undefined}
        image={session.data?.user?.image ?? undefined}
      />

      <div className="  flex w-full flex-wrap bg-base-100 p-4 shadow">
        <div className="flex w-full flex-wrap items-center gap-8">
          <div className="indicator h-max ">
            <div className="avatar">
              <div className="w-32">
                <Image
                  src={base64Image ?? me.data?.image ?? "/user-placeholder.jpg"}
                  alt="Profile image"
                  layout="fill"
                  loading="eager"
                  className="rounded-full"
                />
              </div>
            </div>
            <label
              className="btn-secondary btn-xs btn absolute right-0 top-3"
              tabIndex={0}
            >
              <i className="ri-upload-line" />
              <input
                className="hidden"
                onChange={onFileChange}
                type="file"
                accept="image/png, image/jpeg"
              />
            </label>
          </div>
          <div className="flex-1 justify-self-center">
            <p className="my-4 text-3xl font-bold">{me.data?.name}</p>
            <p className="font-medium">User email: {me.data?.email}</p>
          </div>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (name) {
              updateUserData.mutateAsync({ name });
            }
          }}
          className="form-control w-full p-4"
        >
          <label className="label" htmlFor="name">
            Name
          </label>
          <input
            id="name"
            value={name ?? ""}
            onChange={(e) => setName(e.target.value)}
            placeholder="Name"
            className="input-primary input mb-4"
          />
          <button type="submit" className="btn mb-4">
            Update name
          </button>
        </form>
      </div>
    </>
  );
};

Profile.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>;
};

export default Profile;
