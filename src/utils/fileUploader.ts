import { SupabaseBackets } from "../constants/supabase";
import { supabase } from "./supabaseClient";
import { v4 as uuidv4 } from "uuid";

export const fileUploader = async ({
  file,
  backet,
}: {
  file: File;
  backet: SupabaseBackets;
}) => {
  const fileExt = file.name.split(".").pop();
  const fileName = `${uuidv4()}.${fileExt}`;

  const { error: uploadError, data } = await supabase.storage
    .from(backet)
    .upload(fileName, file);
  if (uploadError) throw uploadError;

  const { data: publicData } = supabase.storage
    .from(backet)
    .getPublicUrl(data.path);

  return publicData.publicUrl;
};
