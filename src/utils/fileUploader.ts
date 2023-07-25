import { v4 as uuidv4 } from "uuid";
import { FILE_TYPES, MAX_FILE_SIZE } from "../constants/frontend";
import { SupabaseBackets } from "../constants/supabase";
import { checkFileType } from "./checkFileType";
import { supabase } from "./supabaseClient";

export const fileUploader = async ({
  file,
  backet,
}: {
  file: File;
  backet: SupabaseBackets;
}) => {
  if (file.size > MAX_FILE_SIZE * 1000000)
    throw new Error(`File size more that ${MAX_FILE_SIZE}mb`);
  if (!checkFileType(file, FILE_TYPES)) throw new Error("Incorrect file type");

  const fileExt = file.name.split(".").pop();
  const fileName = `${uuidv4()}.${fileExt}`;

  const { error: uploadError, data } = await supabase.storage
    .from(backet)
    .upload(fileName, file);
  if (uploadError) throw new Error(uploadError.message);

  const { data: publicData } = supabase.storage
    .from(backet)
    .getPublicUrl(data.path);

  return publicData.publicUrl;
};
