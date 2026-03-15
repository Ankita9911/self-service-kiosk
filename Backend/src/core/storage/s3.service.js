import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import AppError from "../../shared/errors/AppError.js";
import env from "../../config/env.js";

const s3 = new S3Client({
  region: env.AWS_REGION,
  credentials: {
    accessKeyId: env.AWS_ACCESS_KEY_ID,
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
  },
});

export async function generatePresignedUploadUrl({ fileName, fileType, folder }, tenant) {
  if (!tenant?.franchiseId) {
    throw new AppError("Tenant context missing", 400);
  }

  if (!fileName || !fileType) {
    throw new AppError("Invalid file data", 400);
  }

  const key = `tenant/${tenant.franchiseId}/${tenant.outletId || "global"}/${folder}/${Date.now()}-${fileName}`;

  const command = new PutObjectCommand({
    Bucket: env.AWS_S3_BUCKET,
    Key: key,
    ContentType: fileType,
  });

  const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 60 });

  const publicUrl = `https://${env.AWS_S3_BUCKET}.s3.${env.AWS_REGION}.amazonaws.com/${key}`;

  return {
    uploadUrl,
    key,
    publicUrl,
  };
}
