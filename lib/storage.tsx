import { File, Paths } from "expo-file-system";

export async function fileExistsAsync(fileName: string) {
  try {
    const file = new File(Paths.document, fileName);
    return file.exists;
  } catch (error) {
    console.error(error);
    return false;
  }
}

export async function loadFileAsync(fileName: string) {
  try {
    const file = new File(Paths.document, fileName);
    if (!file.exists) {
      file.create();
      console.log("File created:", fileName);
    }
    console.log("Loading file:", fileName);
    return await file.text();
  } catch (error) {
    console.error(error);
    return "";
  }
}

export async function saveFileAsync(fileName: string, data: string) {
  try {
    const file = new File(Paths.document, fileName);
    if (!file.exists) {
      file.create();
      console.log("File created:", fileName);
    }
    console.log("Saving file:", fileName);
    file.write(data);
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
}
