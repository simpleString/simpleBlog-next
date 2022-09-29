import { SupabaseBackets } from "../constants/supabase";
import { supabase } from "./supabaseClient";

export const fileUploader = async ({file, backet}: {file: File, backet: SupabaseBackets}) => {

  const fileExt = file.name.split(".").pop();
  const fileName = `${Math.random()}.${fileExt}`;

  const { error: uploadError, data } = await supabase.storage
      .from(backet)
      .upload(fileName, file);
    if (uploadError) throw uploadError;

  const { data: publicData } = supabase.storage
    .from(backet)
    .getPublicUrl(data.path);

  return publicData.publicUrl;
}