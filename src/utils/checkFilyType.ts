export const checkFileType = (file: File, types: Array<string>): boolean => {
  const extension: string = file.name.split(".").pop() as string;
  const loweredTypes = types.map((type) => type.toLowerCase());
  return loweredTypes.includes(extension.toLowerCase());
};
