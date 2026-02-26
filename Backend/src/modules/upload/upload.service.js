import { generatePresignedUploadUrl } from "../../core/storage/s3.service.js";

export async function getUploadUrl(payload, tenant) {
  const { fileName, fileType, folder = "misc" } = payload;

  return await generatePresignedUploadUrl(
    { fileName, fileType, folder },
    tenant
  );
}