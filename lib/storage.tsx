import { File, Paths } from "expo-file-system";

export async function loadFileAsync(fileName: string) {
  try {
    const file = new File(Paths.document, fileName);
    if (!file.exists) {
      file.create();
    }
    return await file.text();
  } catch (error) {
    console.error(error);
    return "";
  }
}

export async function saveFileAsync(data: string, fileName: string) {
  try {
    const file = new File(Paths.document, fileName);
    if (!file.exists) {
      file.create();
    }
    file.write(data);
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
}
