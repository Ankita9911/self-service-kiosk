import axiosInstance from "@/shared/lib/axiosInstance";
import axios from "axios";

export interface UploadResponse {
  uploadUrl: string;
  key: string;
  publicUrl: string;
}

export async function getUploadUrl(
  file: File,
  folder: string,
  outletId?: string
): Promise<UploadResponse> {
  const response = await axiosInstance.post<{ data: UploadResponse }>(
    "/upload",
    {
      fileName: file.name,
      fileType: file.type,
      folder,
      ...(outletId && { outletId }),
    }
  );

  return response.data.data;
}

export async function uploadFileToS3(
  uploadUrl: string,
  file: File
): Promise<void> {
  await axios.put(uploadUrl, file, {
    headers: {
      "Content-Type": file.type,
    },
  });
}