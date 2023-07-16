export const generateBase64Image = async (file: File) => {
  return await new Promise<string>((resolve, reject) => {
    const fileReader = new FileReader();

    fileReader.onload = () => {
      if (fileReader.result) {
        resolve(fileReader.result as string);
      }
      reject(null);
    };
    fileReader.readAsDataURL(file);
  });
};
