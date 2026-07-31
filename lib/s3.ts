import { PutObjectCommand, S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

function s3Configured() {
  return Boolean(process.env.AWS_S3_BUCKET && process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY);
}

function client() {
  return new S3Client({ region: process.env.AWS_REGION ?? "ap-south-1" });
}

export async function createPresignedUpload(args: { clerkUserId: string; fileName: string; mimeType: string; size: number }) {
  const objectKey = `private/${args.clerkUserId}/${Date.now()}-${args.fileName.replace(/[^a-zA-Z0-9._-]/g, "-")}`;

  if (!s3Configured()) {
    return {
      objectKey,
      uploadUrl: `/api/uploads/complete?demoKey=${encodeURIComponent(objectKey)}`,
      demo: true,
      headers: { "content-type": args.mimeType }
    };
  }

  const command = new PutObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET,
    Key: objectKey,
    ContentType: args.mimeType,
    ContentLength: args.size
  });

  return {
    objectKey,
    uploadUrl: await getSignedUrl(client(), command, { expiresIn: 300 }),
    demo: false,
    headers: { "content-type": args.mimeType }
  };
}

export async function createPresignedDownload(objectKey: string) {
  if (!s3Configured()) {
    return `/demo-evidence/${objectKey}`;
  }
  const command = new GetObjectCommand({ Bucket: process.env.AWS_S3_BUCKET, Key: objectKey });
  return getSignedUrl(client(), command, { expiresIn: 180 });
}
